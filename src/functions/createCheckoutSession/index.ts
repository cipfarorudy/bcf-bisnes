import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { stripe } from "../../shared/stripe";
import { createDvLead } from "../../shared/dataverse";

/**
 * Crée une session Stripe Checkout
 * Combine : Setup fee (one-time) + Abonnement PRO (recurring)
 */
app.http("createCheckoutSession", {
  route: "stripe/createCheckoutSession",
  methods: ["POST"],
  authLevel: "function",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext
  ): Promise<HttpResponseInit> => {
    try {
      const body = (await req.json()) as {
        email?: string;
        companyName?: string;
        dvSubscriptionId?: string;
        plan?: string; // STARTER | PRO | PREMIUM
      };
      const { email, companyName, dvSubscriptionId, plan } = body;

      if (!email) {
        return { status: 400, body: "Email required" };
      }

      // Enregistrement lead (non bloquant)
      try {
        await createDvLead({ email, companyName, leadName: companyName });
        ctx.log("Lead enregistré dans Dataverse");
      } catch (e: any) {
        ctx.warn?.("Dataverse lead skip: " + e.message);
      }

      const planKey = (plan ?? "PRO").toUpperCase();
      const planMap: Record<string, string | undefined> = {
        STARTER: process.env.STRIPE_PRICE_ID_STARTER,
        PRO: process.env.STRIPE_PRICE_ID_PRO,
        PREMIUM: process.env.STRIPE_PRICE_ID_PREMIUM,
      };

      const priceId = planMap[planKey];

      if (!priceId) {
        ctx.error(`Missing price ID for plan ${planKey}`);
        return { status: 500, body: "Configuration error" };
      }

      // Optional setup fee kept for backward compatibility if configured
      const setupPriceId = process.env.STRIPE_PRICE_ID_SETUP;

      const successUrl = process.env.SUCCESS_URL || "{SUCCESS_URL}";
      const cancelUrl = process.env.CANCEL_URL || "{CANCEL_URL}";

      ctx.log(`Creating checkout session for: ${email}`);

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
          ...(setupPriceId
            ? [
                {
                  price: setupPriceId,
                  quantity: 1,
                },
              ]
            : []),
        ],
        subscription_data: {
          metadata: {
            dvSubscriptionId: dvSubscriptionId ?? "",
            companyName: companyName ?? "",
            plan: planKey,
          },
        },
        metadata: {
          dvSubscriptionId: dvSubscriptionId ?? "",
          companyName: companyName ?? "",
          plan: planKey,
        },
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
      });

      ctx.log(`Checkout session created: ${session.id}`);

      return {
        status: 200,
        jsonBody: {
          url: session.url,
          sessionId: session.id,
        },
      };
    } catch (err: any) {
      ctx.error("createCheckoutSession error", err.message);
      return {
        status: 500,
        body: "Failed to create checkout session",
      };
    }
  },
});
