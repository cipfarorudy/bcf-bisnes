import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

/**
 * Retourne la clé Azure Function pour le client
 * (idéalement à restreindre par IP ou authentification)
 */
app.http("getApiKey", {
  route: "config/apikey",
  methods: ["GET"],
  authLevel: "function",
  handler: async (
    req: HttpRequest,
    ctx: InvocationContext
  ): Promise<HttpResponseInit> => {
    try {
      const apiKey =
        process.env.FUNCTION_KEY || process.env.WEBSITE_AUTH_DEFAULT_PROVIDER;

      if (!apiKey) {
        ctx.warn("API key not configured");
        return { status: 500, body: "Configuration error" };
      }

      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      };
    } catch (error: any) {
      ctx.error("Error getting API key: " + error.message);
      return { status: 500, body: "Internal error" };
    }
  },
});
