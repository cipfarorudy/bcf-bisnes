import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import Stripe from "stripe";
import { stripe } from "../../shared/stripe";
import {
  findDvSubscriptionByStripeId,
  patchDvSubscription,
  mapStripeStatus,
} from "../../shared/dataverse";

/**
 * Webhook Stripe
 * Reçoit les événements Stripe, vérifie la signature, met à jour Dataverse
 */
app.http("stripeWebhook", {
  route: "stripe/webhook",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext
  ): Promise<HttpResponseInit> => {
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    if (!sig) {
      ctx.error("Missing stripe-signature header");
      return { status: 400, body: "Missing stripe-signature" };
    }

    // IMPORTANT: Stripe exige le RAW BODY pour vérifier la signature
    const rawBody = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      ctx.error("Webhook signature failed", err.message);
      return { status: 400, body: `Webhook Error: ${err.message}` };
    }

    ctx.log(`Received Stripe event: ${event.type}`);

    try {
      const dvPrefix = process.env.DATAVERSE_PREFIX || "{DATAVERSE_PREFIX}";

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          ctx.log(`Checkout session completed: ${session.id}`);
          // TODO: Créer/mettre à jour subscription Dataverse si nécessaire
          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const sub = event.data.object as Stripe.Subscription;
          ctx.log(`Subscription ${event.type}: ${sub.id}`);

          const dvSub = await findDvSubscriptionByStripeId(sub.id, dvPrefix);
          if (!dvSub) {
            ctx.log(`No Dataverse subscription found for Stripe ID: ${sub.id}`);
            break;
          }

          await patchDvSubscription(
            dvSub[`${dvPrefix}subscriptionid`],
            {
              [`${dvPrefix}status`]: mapStripeStatus(sub.status),
              [`${dvPrefix}currentperiodend`]: sub.current_period_end
                ? new Date(sub.current_period_end * 1000).toISOString()
                : null,
              [`${dvPrefix}stripecustomerid`]:
                typeof sub.customer === "string"
                  ? sub.customer
                  : sub.customer?.id,
            },
            dvPrefix
          );
          break;
        }

        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          ctx.log(`Subscription deleted: ${sub.id}`);

          const dvSub = await findDvSubscriptionByStripeId(sub.id, dvPrefix);
          if (!dvSub) break;

          await patchDvSubscription(
            dvSub[`${dvPrefix}subscriptionid`],
            {
              [`${dvPrefix}status`]: "Cancelled",
            },
            dvPrefix
          );
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object as Stripe.Invoice;
          ctx.log(`Invoice paid: ${invoice.id}`);
          // TODO: Mettre à jour un champ "LastPaymentStatus" ou créer un record "Invoice"
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          ctx.log(`Invoice payment failed: ${invoice.id}`);
          // TODO: Mettre à jour Subscription status à "PastDue" + créer tâche call center
          if (invoice.subscription) {
            const dvSub = await findDvSubscriptionByStripeId(
              invoice.subscription as string,
              dvPrefix
            );
            if (dvSub) {
              await patchDvSubscription(
                dvSub[`${dvPrefix}subscriptionid`],
                {
                  [`${dvPrefix}status`]: "PastDue",
                },
                dvPrefix
              );
            }
          }
          break;
        }

        default:
          ctx.log(`Unhandled event type: ${event.type}`);
          break;
      }

      return { status: 200, body: "ok" };
    } catch (err: any) {
      ctx.error("Webhook handler error", err.message);
      return { status: 500, body: "internal_error" };
    }
  },
});
