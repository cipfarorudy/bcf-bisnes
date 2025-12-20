// Crée un produit et deux Price IDs (99€/mois + 199€ one-time) en mode test
// Utilisation (PowerShell):
// $env:STRIPE_SECRET_KEY="sk_test_..."; node .\scripts\stripe-create-prices.js

const Stripe = require("stripe");

(async () => {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      console.error("Erreur: STRIPE_SECRET_KEY manquant dans l'environnement.");
      process.exit(1);
    }

    const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });

    // 1) Créer le produit
    const product = await stripe.products.create({
      name: "BCF Bizness – Abonnement PRO",
      description: "Abonnement mensuel + frais d'activation",
    });

    // 2) Prix récurrent mensuel 99 €
    const pricePro = await stripe.prices.create({
      product: product.id,
      unit_amount: 99 * 100,
      currency: "eur",
      recurring: { interval: "month" },
      nickname: "PRO Monthly 99",
    });

    // 3) Prix one-time setup 199 €
    const priceSetup = await stripe.prices.create({
      product: product.id,
      unit_amount: 199 * 100,
      currency: "eur",
      nickname: "Setup 199",
    });

    console.log("Produit créé:", product.id);
    console.log("Price PRO (mensuel 99€):", pricePro.id);
    console.log("Price SETUP (one-time 199€):", priceSetup.id);

    console.log("\nFormat à transmettre:");
    console.log("price_subscription=", pricePro.id);
    console.log("price_setup=", priceSetup.id);
  } catch (err) {
    console.error("Stripe error:", err.message);
    process.exit(1);
  }
})();
