import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { stripe } from "../../shared/stripe";

/**
 * Crée un lien vers le portail client Stripe
 * Permet au client de : mettre à jour CB, résilier, modifier plan, etc.
 */
app.http("customerPortal", {
  route: "stripe/portal",
  methods: ["POST"],
  authLevel: "function",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext
  ): Promise<HttpResponseInit> => {
    try {
      const body = (await req.json()) as {
        stripeCustomerId?: string;
        returnUrl?: string;
      };
      const { stripeCustomerId, returnUrl } = body;

      if (!stripeCustomerId) {
        return { status: 400, body: "stripeCustomerId required" };
      }

      const portalReturnUrl =
        returnUrl || process.env.PORTAL_RETURN_URL || "{PORTAL_RETURN_URL}";

      ctx.log(`Creating Stripe portal link for customer: ${stripeCustomerId}`);

      const portal = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: portalReturnUrl,
      });

      ctx.log(`Portal session created: ${portal.id}`);

      return {
        status: 200,
        jsonBody: {
          url: portal.url,
        },
      };
    } catch (err: any) {
      ctx.error("customerPortal error", err.message);
      return {
        status: 500,
        body: "Failed to create portal session",
      };
    }
  },
});
