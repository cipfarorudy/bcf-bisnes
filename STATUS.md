# ✅ Déploiement Réussi !

## 🎯 Ressources Azure Créées

| Ressource | Nom | URL |
|-----------|-----|-----|
| **Resource Group** | `rg-bcf-prod` | - |
| **Storage Account** | `bcfstorage1657` | - |
| **Function App** | `bcf-stripe-prod` | https://bcf-stripe-prod.azurewebsites.net |
| **Application Insights** | `bcf-stripe-prod` | Monitoring actif |

## 📍 URLs des Endpoints

### Webhook Stripe
```
https://bcf-stripe-prod.azurewebsites.net/api/stripe/webhook
```
☝️ Configurez cette URL dans Stripe Dashboard → Webhooks

### Create Checkout Session (protégé)
```
POST https://bcf-stripe-prod.azurewebsites.net/api/stripe/createCheckoutSession
```

### Customer Portal (protégé)
```
POST https://bcf-stripe-prod.azurewebsites.net/api/stripe/portal
```

## ⚙️ Prochaines Étapes - Configuration

### 1. Variables d'environnement à remplacer

Dans **Azure Portal** → bcf-stripe-prod → **Configuration** → **Application settings** :

```bash
# STRIPE (Remplacez par vos vraies clés)
STRIPE_SECRET_KEY=sk_live_VOTRE_VRAIE_CLE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_VRAI_SECRET
STRIPE_PRICE_ID_PRO=price_VOTRE_PRICE_ID_PRO  # 990€/mois
STRIPE_PRICE_ID_SETUP=price_VOTRE_PRICE_ID_SETUP  # 490€ one-time

# DATAVERSE
DATAVERSE_URL=https://votreorg.crm.dynamics.com
DATAVERSE_TENANT_ID=eb99c72c-deb5-4c55-8568-7498a26dc050  # Votre Tenant ID
CLIENT_ID=votre-client-id  # Azure AD App Registration
CLIENT_SECRET=votre-client-secret  # Azure AD App Secret
DATAVERSE_PREFIX=bcf_

# URLs (Power Pages ou votre site)
SUCCESS_URL=https://votre-power-pages.com/paiement-succes
CANCEL_URL=https://votre-power-pages.com/paiement-annule
PORTAL_RETURN_URL=https://votre-power-pages.com/mon-compte
```

### 2. Configurer Stripe Webhook

1. **Stripe Dashboard** → Developers → **Webhooks** → **Add endpoint**
2. **Endpoint URL** : `https://bcf-stripe-prod.azurewebsites.net/api/stripe/webhook`
3. **Events to send** :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
4. **Copier le Signing secret** (whsec_...) → Azure Configuration

### 3. Créer les tables Dataverse

Utilisez le fichier [power-automate/DATAVERSE-SCHEMA.json](power-automate/DATAVERSE-SCHEMA.json) :

- `bcf_lead` - Leads/Prospects
- `bcf_account` - Comptes entreprise
- `bcf_contact` - Contacts décisionnaires
- `bcf_subscription` - Abonnements Stripe
- `bcf_serviceticket` - Tickets tâches (Call Center, Financement, etc.)
- `bcf_fundingcase` - Dossiers financement (CPF, OPCO, etc.)

### 4. Créer les flows Power Automate

Consultez [power-automate/FLOWS.md](power-automate/FLOWS.md) pour les 6 flows :

1. **Onboarding** - Prospect → Account/Contact/Lead
2. **Activation** - Subscription Active → Kickoff
3. **Dunning** - Relance J0/J2/J5 PastDue
4. **Routing** - Assignment tickets Call Center
5. **Facturation** - PDF + Email + SharePoint
6. **Reporting** - MRR Hebdomadaire Teams

### 5. Créer Power Pages (optionnel)

Consultez [docs/POWER-PAGES-INTEGRATION.md](docs/POWER-PAGES-INTEGRATION.md)

## 🧪 Tester l'API

### Test avec Stripe CLI (local)

```bash
# Installer Stripe CLI
scoop install stripe

# Écouter les webhooks
stripe listen --forward-to https://bcf-stripe-prod.azurewebsites.net/api/stripe/webhook

# Simuler un checkout
stripe trigger checkout.session.completed
```

### Test du endpoint createCheckoutSession

```powershell
# Récupérer la Function Key
$functionKey = az functionapp keys list --name bcf-stripe-prod --resource-group rg-bcf-prod --query "functionKeys.default" -o tsv

# Tester
Invoke-RestMethod -Method POST `
  -Uri "https://bcf-stripe-prod.azurewebsites.net/api/stripe/createCheckoutSession" `
  -Headers @{
    "x-functions-key" = $functionKey
    "Content-Type" = "application/json"
  } `
  -Body '{"email":"test@bcf.com","companyName":"BCF Test","dvSubscriptionId":"test-123"}' | ConvertTo-Json
```

## 📊 Monitoring

### Application Insights

**Portal Azure** → bcf-stripe-prod → **Application Insights** :

- **Live Metrics** - Temps réel
- **Logs** - Requêtes et erreurs
- **Performance** - Latence endpoints

### Logs en temps réel

```powershell
func azure functionapp logstream bcf-stripe-prod --resource-group rg-bcf-prod
```

### Requêtes Kusto (Analytics)

```kusto
traces
| where timestamp > ago(1h)
| where severityLevel > 2
| order by timestamp desc
| take 50
```

## 📁 Repository GitHub

**Code source** : https://github.com/cipfarorudy/bcf-bisnes

Pour mettre à jour :
```bash
cd "C:\Users\CIP FARO\Documents\BCF Bizness\bcf-bisnes"
git pull
npm install
npm run build
func azure functionapp publish bcf-stripe-prod
```

## 🔐 Sécurité

- ✅ **HTTPS** uniquement
- ✅ **Webhook signature** vérifiée (HMAC SHA256)
- ✅ **Function Keys** pour endpoints protégés
- ✅ **OAuth2** pour Dataverse
- ⚠️ **Secrets** stockés dans Azure Configuration (chiffrés)

## 📞 Support

- **Documentation complète** : [DEPLOY-AZURE.md](DEPLOY-AZURE.md)
- **Setup détaillé** : [docs/STRIPE-AZURE-SETUP.md](docs/STRIPE-AZURE-SETUP.md)
- **Power Pages** : [docs/POWER-PAGES-INTEGRATION.md](docs/POWER-PAGES-INTEGRATION.md)

---

## ✅ Checklist Finale

- [x] Azure Function App créée et déployée
- [x] Code poussé sur GitHub
- [x] Application Insights configuré
- [ ] **Variables d'environnement réelles configurées** ⬅️ VOUS
- [ ] **Webhook Stripe configuré** ⬅️ VOUS
- [ ] **Tables Dataverse créées** ⬅️ VOUS
- [ ] **Power Automate flows créés** ⬅️ VOUS
- [ ] **Test end-to-end checkout** ⬅️ VOUS

**🎯 Prochaine action** : Remplacez les placeholders dans Azure Configuration avec vos vraies clés Stripe et Dataverse !
