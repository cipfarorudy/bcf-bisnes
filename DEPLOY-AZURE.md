# 🚀 Déploiement Azure - Guide Rapide

## Prérequis
- Compte Azure actif
- Azure CLI installé

## Étape 1 : Se connecter à Azure

```powershell
az login
```

## Étape 2 : Créer les ressources Azure

```powershell
# Variables (personnalisez)
$RESOURCE_GROUP = "rg-bcf-prod"
$LOCATION = "westeurope"
$STORAGE_ACCOUNT = "bcfstorage$(Get-Random -Maximum 9999)"
$FUNCTION_APP = "bcf-stripe-functions"

# Créer le groupe de ressources
az group create --name $RESOURCE_GROUP --location $LOCATION

# Créer le compte de stockage
az storage account create `
  --name $STORAGE_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --sku Standard_LRS

# Créer la Function App (Node.js 18, Consumption Plan)
az functionapp create `
  --name $FUNCTION_APP `
  --resource-group $RESOURCE_GROUP `
  --storage-account $STORAGE_ACCOUNT `
  --consumption-plan-location $LOCATION `
  --runtime node `
  --runtime-version 18 `
  --functions-version 4 `
  --os-type Linux
```

## Étape 3 : Configurer les variables d'environnement

```powershell
# Remplacez par vos vraies valeurs
az functionapp config appsettings set `
  --name $FUNCTION_APP `
  --resource-group $RESOURCE_GROUP `
  --settings `
    "STRIPE_SECRET_KEY=sk_live_..." `
    "STRIPE_WEBHOOK_SECRET=whsec_..." `
    "STRIPE_PRICE_ID_PRO=price_..." `
    "STRIPE_PRICE_ID_SETUP=price_..." `
    "DATAVERSE_URL=https://votre-org.crm.dynamics.com" `
    "DATAVERSE_TENANT_ID=..." `
    "CLIENT_ID=..." `
    "CLIENT_SECRET=..." `
    "DATAVERSE_PREFIX=bcf_" `
    "SUCCESS_URL=https://votre-site.com/success" `
    "CANCEL_URL=https://votre-site.com/cancel" `
    "PORTAL_RETURN_URL=https://votre-site.com/account"
```

## Étape 4 : Déployer le code

```powershell
cd "C:\Users\CIP FARO\Documents\BCF Bizness\abonnement-multiservices\backend\azure-functions"

# Déploiement
func azure functionapp publish $FUNCTION_APP
```

## Étape 5 : Récupérer l'URL du webhook

```powershell
# Obtenir l'URL de base
$URL = az functionapp show --name $FUNCTION_APP --resource-group $RESOURCE_GROUP --query "defaultHostName" -o tsv
Write-Host "Webhook URL: https://$URL/api/stripe/webhook"
```

## Étape 6 : Configurer Stripe

1. Allez sur **Stripe Dashboard** → **Developers** → **Webhooks**
2. Cliquez **Add endpoint**
3. URL : `https://votre-function-app.azurewebsites.net/api/stripe/webhook`
4. Sélectionnez les événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiez le **Signing secret** (whsec_...)
6. Mettez à jour la variable `STRIPE_WEBHOOK_SECRET` dans Azure :

```powershell
az functionapp config appsettings set `
  --name $FUNCTION_APP `
  --resource-group $RESOURCE_GROUP `
  --settings "STRIPE_WEBHOOK_SECRET=whsec_nouveau_secret"
```

## Étape 7 : Tester

### Tester createCheckoutSession

```powershell
# Obtenir la clé de fonction
$FUNCTION_KEY = az functionapp keys list --name $FUNCTION_APP --resource-group $RESOURCE_GROUP --query "functionKeys.default" -o tsv

# Tester
Invoke-RestMethod -Method POST `
  -Uri "https://$URL/api/stripe/createCheckoutSession" `
  -Headers @{
    "x-functions-key" = $FUNCTION_KEY
    "Content-Type" = "application/json"
  } `
  -Body '{"email":"test@example.com","companyName":"Test Corp","dvSubscriptionId":"123"}' | ConvertTo-Json
```

## 📊 Monitoring

Voir les logs en temps réel :
```powershell
func azure functionapp logstream $FUNCTION_APP --resource-group $RESOURCE_GROUP
```

Ou dans le portail Azure :
- **Application Insights** → **Live Metrics**
- **Monitor** → **Logs**

## 🔥 Troubleshooting

### Erreur 500 au déploiement
```powershell
# Redémarrer la Function App
az functionapp restart --name $FUNCTION_APP --resource-group $RESOURCE_GROUP
```

### Voir les erreurs
```powershell
az monitor app-insights query `
  --app $FUNCTION_APP `
  --analytics-query "traces | where severityLevel > 2 | order by timestamp desc | take 20"
```

### Test webhook Stripe local
```bash
stripe listen --forward-to https://$URL/api/stripe/webhook
stripe trigger checkout.session.completed
```

## ✅ Checklist finale

- [ ] Function App créée
- [ ] Toutes les variables d'environnement configurées
- [ ] Code déployé avec `func azure functionapp publish`
- [ ] Webhook Stripe configuré
- [ ] Test d'un checkout session OK
- [ ] Logs Application Insights fonctionnels
