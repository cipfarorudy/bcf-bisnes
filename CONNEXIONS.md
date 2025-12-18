# 🔐 Guide de Connexion - BCF Bizness

## 1️⃣ Azure Portal (Gestion infrastructure)

**URL** : https://portal.azure.com

**Accès avec** : dev@farorudy.com (votre compte Microsoft)

### Ressources à vérifier :

- **Resource Group** : `rg-bcf-prod`
  - Portal : https://portal.azure.com/#resource/subscriptions/bdf51064-432f-49d2-a5e4-7b368e014313/resourceGroups/rg-bcf-prod

- **Azure Functions** : `bcf-stripe-prod`
  - Portal : https://portal.azure.com/#@farorudy.com/resource/subscriptions/bdf51064-432f-49d2-a5e4-7b368e014313/resourceGroups/rg-bcf-prod/providers/Microsoft.Web/sites/bcf-stripe-prod

- **Static Web App** : `bcf-bizness-web`
  - Portal : https://portal.azure.com/#@farorudy.com/resource/subscriptions/bdf51064-432f-49d2-a5e4-7b368e014313/resourceGroups/rg-bcf-prod/providers/Microsoft.Web/staticSites/bcf-bizness-web

- **Application Insights** : `bcf-stripe-prod`
  - Portal : https://portal.azure.com/#@farorudy.com/resource/subscriptions/bdf51064-432f-49d2-a5e4-7b368e014313/resourceGroups/rg-bcf-prod/providers/microsoft.insights/components/bcf-stripe-prod

---

## 2️⃣ GitHub Repository

**URL** : https://github.com/cipfarorudy/bcf-bisnes

**Accès avec** : cipfarorudy (votre compte GitHub)

### Actions à faire :

1. **Voir le code source** : Tous les fichiers TypeScript, HTML, config
2. **Voir les commits** : Historique des déploiements
3. **Configurer les secrets** (future automatisation) :
   - Settings → Secrets and variables → Actions

---

## 3️⃣ Stripe Dashboard (Paiements)

**URL** : https://dashboard.stripe.com

**Accès avec** : Votre compte Stripe

### À configurer :

1. **Products** → Créer/vérifier les prix :
   - `price_...` pour PRO 990€/mois (recurring)
   - `price_...` pour Setup 490€ (one-time)

2. **Webhooks** → Configurer l'endpoint :
   - URL : `https://bcf-stripe-prod.azurewebsites.net/api/stripe/webhook`
   - Events : checkout.session.completed, customer.subscription.*, invoice.*
   - Signing secret : À copier dans Azure App Settings

3. **API Keys** :
   - Secret Key : `sk_live_...` → Copier dans Azure
   - Webhook Secret : `whsec_...` → Copier dans Azure

---

## 4️⃣ Azure CLI (Terminal/PowerShell)

Pour gérer via commandes :

```powershell
# Se connecter
az login

# Voir le statut de la Function App
az functionapp show --name bcf-stripe-prod --resource-group rg-bcf-prod

# Voir les logs en temps réel
func azure functionapp logstream bcf-stripe-prod --resource-group rg-bcf-prod

# Voir les variables d'environnement
az functionapp config appsettings list --name bcf-stripe-prod --resource-group rg-bcf-prod

# Mettre à jour une variable
az functionapp config appsettings set --name bcf-stripe-prod --resource-group rg-bcf-prod --settings "STRIPE_SECRET_KEY=sk_live_votre_vraie_cle"
```

---

## 5️⃣ Static Web App Deployment

**URL production** : https://ambitious-forest-04f3b3503.3.azurestaticapps.net

**Redéployer après changements** :

```powershell
cd "C:\Users\CIP FARO\Documents\BCF Bizness\bcf-bisnes"
npm run build
swa deploy ./public --deployment-token [TOKEN] --app-name bcf-bizness-web
```

Token récupérable via :
```powershell
az staticwebapp secrets list --name bcf-bizness-web --resource-group rg-bcf-prod --query "properties.apiKey" -o tsv
```

---

## 🎯 Checklist Configuration - TODO

- [ ] **Stripe** : Créer les products PRO (990€/mois) et SETUP (490€)
- [ ] **Stripe** : Récupérer les Price IDs (price_...)
- [ ] **Stripe** : Configurer le webhook vers Azure Functions
- [ ] **Azure** : Remplir les variables d'environnement :
  ```
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  STRIPE_PRICE_ID_PRO=price_...
  STRIPE_PRICE_ID_SETUP=price_...
  DATAVERSE_URL=https://votreorg.crm.dynamics.com
  DATAVERSE_TENANT_ID=...
  CLIENT_ID=...
  CLIENT_SECRET=...
  ```
- [ ] **Frontend** : Mettre à jour la clé de fonction dans `public/index.html` ligne 143
- [ ] **Frontend** : Redéployer la Static Web App
- [ ] **Test** : Accéder à https://ambitious-forest-04f3b3503.3.azurestaticapps.net et tester un achat
- [ ] **Dataverse** : Créer les 6 tables (bcf_lead, bcf_account, bcf_contact, bcf_subscription, bcf_serviceticket, bcf_fundingcase)
- [ ] **Power Automate** : Créer les 6 flows

---

## 📊 Monitoring & Logs

### Application Insights

```powershell
# Voir les erreurs des 2 dernières heures
az monitor app-insights metrics show --app bcf-stripe-prod --start-time 2025-12-17T17:00:00Z --interval PT5M
```

### Logs en direct

```powershell
func azure functionapp logstream bcf-stripe-prod --resource-group rg-bcf-prod
```

Ou dans **Azure Portal** → bcf-stripe-prod → **Log stream**

---

## 🆘 Troubleshooting

### Erreur 401 Unauthorized (webhook)
- Vérifier que le STRIPE_WEBHOOK_SECRET est correct dans Azure App Settings
- Vérifier que la signature est valide

### Erreur 500 (Azure Functions)
- Voir Application Insights
- Vérifier les logs : `func azure functionapp logstream`
- Vérifier les variables d'environnement

### Connexion Stripe échoue
- Vérifier `STRIPE_SECRET_KEY`
- Vérifier que la clé est en mode `sk_live_` (production) ou `sk_test_` (test)

### Dataverse non accessible
- Vérifier `DATAVERSE_URL`, `DATAVERSE_TENANT_ID`, `CLIENT_ID`, `CLIENT_SECRET`
- Vérifier que l'app Azure AD a les permissions sur Dataverse

---

## 📞 Contacts & Ressources

- **GitHub** : https://github.com/cipfarorudy/bcf-bisnes
- **Documentation locale** : Voir [STATUS.md](STATUS.md), [DEPLOY-AZURE.md](DEPLOY-AZURE.md), [TEST-ENDPOINTS.md](TEST-ENDPOINTS.md)
- **Stripe** : https://stripe.com/docs
- **Azure Functions** : https://learn.microsoft.com/en-us/azure/azure-functions/
