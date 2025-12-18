# ⚪ Configuration Stripe - Guide Complet

## 📋 Étape 2.1 - Créer les Products

Accédez à : https://dashboard.stripe.com/products

### Product 1 : PRO Mensuel (Récurrent)

1. Cliquez sur **"+ Add product"**
2. Remplissez :
   - **Product name** : `BCF Bizness PRO`
   - **Description** : `Plan professionnel mensuel`
   - **Pricing model** : `Standard pricing`
3. Cliquez sur **"Add pricing"**
4. Configurez le prix :
   - **Price** : `990.00 EUR`
   - **Billing period** : `Monthly` (récurrent)
   - **Tax behavior** : `Taxable` (si applicable)
5. Cliquez sur **"Save product"**
6. **Copiez l'ID du price** qui commence par `price_...` (exemple : `price_1Q7X2K...`)
   ```
   STRIPE_PRICE_ID_PRO = price_...
   ```

### Product 2 : Frais d'Installation (One-time)

1. **Même produit PRO** ou créer un nouveau
2. Cliquez sur **"+ Add another price"** (si même produit) OU créez un nouveau produit
3. Configurez :
   - **Price** : `490.00 EUR`
   - **Billing period** : `One time` (unique)
4. **Copiez cet ID du price** :
   ```
   STRIPE_PRICE_ID_SETUP = price_...
   ```

**Résultat attendu** : Vous devez avoir 2 price IDs

---

## 🔗 Étape 2.2 - Configurer le Webhook

Accédez à : https://dashboard.stripe.com/webhooks

1. Cliquez sur **"+ Add an endpoint"**
2. Remplissez :
   - **Endpoint URL** : `https://bcf-stripe-prod.azurewebsites.net/api/stripe/webhook`
   - **Select events** : Sélectionnez **"Select all events"** OU manuellement :
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.created`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
     - ✅ `invoice.payment_succeeded`
     - ✅ `invoice.payment_failed`
3. Cliquez sur **"Add endpoint"**
4. **Copiez le Signing Secret** qui commence par `whsec_...`
   ```
   STRIPE_WEBHOOK_SECRET = whsec_...
   ```

**⚠️ IMPORTANT** : Gardez ce secret privé !

---

## 🔑 Étape 2.3 - Récupérer la Secret Key

Accédez à : https://dashboard.stripe.com/apikeys

1. Vous êtes en mode **"Live"** (pas "Test")
2. **Copiez la Secret key** qui commence par `sk_live_...`
   ```
   STRIPE_SECRET_KEY = sk_live_...
   ```

⚠️ **Ne jamais commiter cette clé sur GitHub !**

---

## 📝 Résumé des IDs Récupérés

| Variable | Valeur Exemple | Où récupérer |
|----------|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_51Q7X...` | API Keys page |
| `STRIPE_WEBHOOK_SECRET` | `whsec_1Q7X2...` | Webhooks page |
| `STRIPE_PRICE_ID_PRO` | `price_1Q7X2...` | Products → PRO → Pricing |
| `STRIPE_PRICE_ID_SETUP` | `price_1Q7X3...` | Products → SETUP → Pricing |

---

## ✅ Checklist Stripe

- [ ] Produit PRO créé (990€/mois)
- [ ] Produit SETUP créé (490€ one-time)
- [ ] Price ID PRO noté
- [ ] Price ID SETUP noté
- [ ] Webhook configuré
- [ ] Webhook Signing Secret noté
- [ ] Secret API Key Stripe copiée

**Une fois ces 4 IDs/secrets récupérés → Passez à l'étape 3 !** 🚀
