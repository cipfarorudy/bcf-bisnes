# 🧪 Test des Endpoints Azure Functions

## ⚠️ Diagnostic

Les fonctions sont déployées mais **pas encore enregistrées** dans le runtime Azure Functions v4.

### Cause probable :
Le modèle de programmation v4 nécessite que toutes les fonctions soient importées dans un point d'entrée unique.

## ✅ Solution

Les fonctions doivent être correctement exportées. Vérifiez que `src/index.ts` importe toutes les fonctions :

```typescript
import "./functions/stripeWebhook";
import "./functions/createCheckoutSession";
import "./functions/customerPortal";
```

## 🔧 Test après redéploiement

### 1. Test createCheckoutSession

```powershell
# Récupérer la clé via Azure CLI
$functionKey = az functionapp keys list --name bcf-stripe-prod --resource-group rg-bcf-prod --query "functionKeys.default" -o tsv

$headers = @{
    "x-functions-key" = $functionKey
    "Content-Type" = "application/json"
}

$body = @{
    email = "test@bcf.com"
    companyName = "BCF Test"
    dvSubscriptionId = "test-123"
} | ConvertTo-Json

Invoke-RestMethod -Method POST `
    -Uri "https://bcf-stripe-prod.azurewebsites.net/api/stripe/createCheckoutSession" `
    -Headers $headers `
    -Body $body
```

**Réponse attendue** :
```json
{
  "error": "Missing Stripe price ID configuration"
}
```
(car les variables d'environnement ne sont pas encore configurées)

### 2. Test webhook (doit échouer sans signature)

```powershell
Invoke-WebRequest -Method POST `
    -Uri "https://bcf-stripe-prod.azurewebsites.net/api/stripe/webhook" `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"type":"test"}'
```

**Réponse attendue** : 400 Bad Request (signature manquante)

### 3. Vérifier les fonctions disponibles

```bash
curl https://bcf-stripe-prod.azurewebsites.net/admin/functions
```

Ou via Azure Portal :
**bcf-stripe-prod** → **Functions** → Voir la liste

## 📊 État actuel

- ✅ Function App en ligne
- ✅ Code déployé  
- ⚠️ Fonctions non enregistrées (sync triggers failed)
- ❌ Variables d'environnement non configurées

## 🎯 Prochaines actions

1. Vérifier que `dist/src/index.js` contient bien les imports
2. Configurer les variables d'environnement dans Azure Portal
3. Redémarrer l'application :
   ```powershell
   az functionapp restart --name bcf-stripe-prod --resource-group rg-bcf-prod
   ```
