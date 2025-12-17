# 🚀 Guide Déploiement Complet — Stripe + Azure Functions + Dataverse

## Phase 1 : Préparation (Jour 0)

### 1.1 Stripe Setup

1. Allez sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Créez 2 **Products** :
   - **"Abonnement PRO multiservices"**
     - Price : 990€/mois (recurring, monthly)
     - Récupérez le `PRICE_ID` → `price_XXXXX` (conservez-le, vous en aurez besoin)
   - **"Mise en service PRO"**
     - Price : 490€ (one-time)
     - Récupérez le `PRICE_ID` → `price_YYYYY`

3. Récupérez votre **API Key Secret** :
   - Developers → API Keys
   - Copiez la clé secrète `sk_live_...` (ou `sk_test_...` en mode test)

4. Récupérez votre **Webhook Secret** :
   - Developers → Webhooks
   - Vous allez l'ajouter après déploiement Azure

### 1.2 Microsoft Setup

1. **Tenant Azure** : connectez-vous sur [portal.azure.com](https://portal.azure.com)
2. **Dataverse** :
   - Allez dans Power Platform Admin Center → Environments
   - Notez votre `{DATAVERSE_URL}` (ex: `https://org1234567.crm4.dynamics.com`)
   - Notez votre `{DATAVERSE_PREFIX}` (ex: `cip_`, `new_`)

3. **App Registration** (pour authentifier Azure Functions → Dataverse) :
   - Azure AD → App Registrations → New registration
   - Name : `stripe-azure-function`
   - Redirect URI : `http://localhost:3000`
   - Récupérez :
     - `Application (client) ID` → `{DATAVERSE_CLIENT_ID}`
     - `Directory (tenant) ID` → `{DATAVERSE_TENANT_ID}`
   - Certificats et secrets → New client secret → copiez la valeur → `{DATAVERSE_CLIENT_SECRET}`

4. **Permissions** (sur l'App Registration) :
   - API Permissions → Add a permission
   - Dynamics CRM → user_impersonation → Grant admin consent

---

## Phase 2 : Déploiement Azure Functions (Jour 1)

### 2.1 Préparation locale

```bash
# 1. Clonez/téléchargez le kit
cd backend/azure-functions

# 2. Installez dépendances
npm install

# 3. Compilez TypeScript
npm run build

# 4. Testez localement (optionnel)
npm run start
```

### 2.2 Déploiement Azure

**Option A : Avec Azure CLI** (recommandé)

```bash
# 1. Installez Azure Functions Core Tools
# Windows : https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local

# 2. Connexion Azure
az login

# 3. Créez une Function App
az functionapp create \
  --resource-group {YOUR_RESOURCE_GROUP} \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name stripe-pro-function-app

# 4. Configurez les variables d'environnement
az functionapp config appsettings set \
  --name stripe-pro-function-app \
  --resource-group {YOUR_RESOURCE_GROUP} \
  --settings \
    STRIPE_SECRET_KEY="sk_live_..." \
    STRIPE_WEBHOOK_SECRET="whsec_..." \
    STRIPE_PRICE_ID_PRO="price_XXXXX" \
    STRIPE_PRICE_ID_SETUP="price_YYYYY" \
    DATAVERSE_URL="https://org1234567.crm4.dynamics.com" \
    DATAVERSE_TENANT_ID="{TENANT_ID}" \
    DATAVERSE_CLIENT_ID="{CLIENT_ID}" \
    DATAVERSE_CLIENT_SECRET="{CLIENT_SECRET}" \
    DATAVERSE_PREFIX="cip_" \
    SUCCESS_URL="https://votresite.com/success" \
    CANCEL_URL="https://votresite.com/cancel"

# 5. Déployez le code
func azure functionapp publish stripe-pro-function-app
```

**Option B : Avec Visual Studio Code**

1. Installez l'extension **Azure Functions**
2. File → Open Folder → choisissez `azure-functions/`
3. Cliquez sur Azure logo → Deploy to Function App
4. Sélectionnez votre Function App créée
5. Configurez les settings après déploiement (Azure Portal)

### 2.3 Vérifiez le déploiement

```bash
# Récupérez l'URL de votre Function App
az functionapp show --name stripe-pro-function-app \
  --resource-group {YOUR_RESOURCE_GROUP} \
  --query defaultHostName -o tsv

# Output : stripe-pro-function-app.azurewebsites.net

# Les endpoints seront :
# https://stripe-pro-function-app.azurewebsites.net/api/stripe/webhook
# https://stripe-pro-function-app.azurewebsites.net/api/stripe/createCheckoutSession
# https://stripe-pro-function-app.azurewebsites.net/api/stripe/portal
```

---

## Phase 3 : Configuration Stripe Webhooks (Jour 1–2)

1. Allez sur Stripe Dashboard → Developers → Webhooks
2. Cliquez sur **"Add endpoint"**
3. URL : `https://stripe-pro-function-app.azurewebsites.net/api/stripe/webhook`
4. Events à sélectionner :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiez le **Signing secret** (`whsec_...`) et ajoutez-le aux settings Azure :
   ```bash
   az functionapp config appsettings set \
     --name stripe-pro-function-app \
     --resource-group {YOUR_RESOURCE_GROUP} \
     --settings STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

---

## Phase 4 : Dataverse Setup (Jour 2)

### 4.1 Créer les tables

1. Power Platform Admin Center → Tables
2. Importez `DATAVERSE-SCHEMA.json` (ou créez manuellement)
3. Pour chaque table, vérifiez :
   - Nom logique = `{DATAVERSE_PREFIX}tablename`
   - Champs = mappé au JSON

### 4.2 Remplir les placeholders

Dans tous les fichiers, remplacez :
- `{DATAVERSE_PREFIX}` → votre préfixe (ex: `cip_`)
- `{DATAVERSE_URL}` → votre URL
- etc.

---

## Phase 5 : Power Automate Flows (Jour 2–3)

1. Allez sur Power Automate (make.powerautomate.com)
2. Importez les 6 flows depuis `FLOWS.md`
3. Mappez chaque flow à :
   - Votre Dataverse instance
   - Vos connecteurs (Outlook, Teams)
   - Vos variables d'environnement

### Checklist rapide par flow :

- **Flow 1 (Onboarding)** : trigger Power Pages → Dataverse create/update
- **Flow 2 (Activation)** : trigger subscription update → kickoff tasks
- **Flow 3 (Dunning)** : trigger subscription PastDue → relances J0/J2/J5
- **Flow 4 (Routing)** : trigger service ticket → assign agent
- **Flow 5 (Facturation)** : trigger subscription active → generate PDF + email
- **Flow 6 (Reporting)** : scheduled Monday 08:00 → compose summary + Teams post

---

## Phase 6 : Test End-to-End (Jour 3–4)

### 6.1 Test Checkout Session

```bash
# 1. Appelez créateCheckoutSession
curl -X POST https://stripe-pro-function-app.azurewebsites.net/api/stripe/createCheckoutSession \
  -H "Content-Type: application/json" \
  -H "x-functions-key: {FUNCTION_KEY}" \
  -d '{
    "email": "test@example.com",
    "companyName": "Test Corp",
    "dvSubscriptionId": "123e4567-e89b-12d3-a456-426614174000"
  }'

# 2. Vous recevrez un JSON :
# {
#   "url": "https://checkout.stripe.com/pay/...",
#   "sessionId": "cs_..."
# }

# 3. Ouvrez l'URL dans un navigateur
```

### 6.2 Test Webhook

```bash
# 1. Utilisez Stripe CLI pour relire les webhooks
stripe listen --forward-to https://stripe-pro-function-app.azurewebsites.net/api/stripe/webhook

# 2. Déclenchez un événement test
stripe trigger customer.subscription.updated

# 3. Vérifiez dans les logs Azure Function que l'événement a été reçu
```

### 6.3 Vérifiez Dataverse

1. Power Platform Admin Center → Data → Entities
2. Table `Subscription` → vérifiez que les statuts sont mis à jour après les webhooks

---

## Phase 7 : Production (Jour 5+)

### Avant de passer en production :

- [ ] Testez avec cartes Stripe de test
- [ ] Vérifiez que les emails sont envoyés correctement
- [ ] Vérifiez que Dataverse se met à jour automatiquement
- [ ] Testez les relances de paiement (dunning flow)
- [ ] Testez la résiliation depuis Stripe

### Basculer vers Stripe LIVE :

1. Allez dans Stripe Settings
2. Passez de "Test mode" à "Live mode"
3. Utilisez les vraies clés (`sk_live_...`, `pk_live_...`)
4. Mettez à jour les settings Azure :
   ```bash
   az functionapp config appsettings set \
     --name stripe-pro-function-app \
     --resource-group {YOUR_RESOURCE_GROUP} \
     --settings STRIPE_SECRET_KEY="sk_live_..."
   ```

---

## Troubleshooting

### Webhook ne reçoit pas les événements

- [ ] Vérifiez que l'URL webhook est accessible publiquement
- [ ] Vérifiez le `Signing Secret` (whsec_...)
- [ ] Consultez les logs Stripe (Developers → Webhooks → failed deliveries)

### Dataverse ne se met pas à jour

- [ ] Vérifiez que le `DATAVERSE_PREFIX` est correct
- [ ] Vérifiez les permissions de l'App Registration
- [ ] Consultez les logs Azure Function (Application Insights)

### Erreur "Configuration error"

- [ ] Vérifiez que tous les settings Azure sont remplis
- [ ] Redémarrez la Function App

---

## Support

Pour des questions spécifiques :
1. Consultez [Stripe Docs](https://stripe.com/docs)
2. Consultez [Microsoft Dataverse Docs](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/)
3. Consultez [Azure Functions Docs](https://learn.microsoft.com/en-us/azure/azure-functions/)

