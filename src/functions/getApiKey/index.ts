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
  authLevel: "anonymous",
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

      // Contrôle d'origine simple (prod et local)
      const origin =
        req.headers.get("origin") || req.headers.get("referer") || "";
      const allowed = (
        process.env.ALLOWED_ORIGINS ||
        "https://bcf-stripe-prod.azurewebsites.net,http://localhost:7071,http://localhost:5500,http://127.0.0.1:5500"
      )
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const isAllowed = !origin || allowed.some((o) => origin.startsWith(o));
      if (!isAllowed) {
        ctx.warn(`Blocked getApiKey from origin: ${origin}`);
        return { status: 403, body: "Forbidden" };
      }

      return {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ apiKey }),
      };
    } catch (error: any) {
      ctx.error("Error getting API key: " + error.message);
      return { status: 500, body: "Internal error" };
    }
  },
});
