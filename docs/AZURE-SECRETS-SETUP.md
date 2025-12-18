# Script Étape 3 - Ajouter les Secrets Azure

## 🔐 Ajouter les variables d'environnement à Azure Functions

Une fois que vous avez vos 4 IDs Stripe, exécutez ce script PowerShell :

```powershell
# Configuration
$resourceGroup = "rg-bcf-prod"
$functionAppName = "bcf-stripe-prod"

# Vos values récupérées de Stripe
$stripeSecretKey = "sk_live_..."  # À remplacer
$stripeWebhookSecret = "whsec_..."  # À remplacer
$stripePriceIdPro = "price_..."  # À remplacer
$stripePriceIdSetup = "price_..."  # À remplacer

# Vos values Dataverse (optionnel si pas prêt)
$dataverseUrl = "https://votreorg.crm.dynamics.com"  # À remplacer
$dataverseTenantId = "..."  # À remplacer
$clientId = "..."  # À remplacer
$clientSecret = "..."  # À remplacer

# Ajouter les secrets
az functionapp config appsettings set \
  --name $functionAppName \
  --resource-group $resourceGroup \
  --settings \
    STRIPE_SECRET_KEY="$stripeSecretKey" \
    STRIPE_WEBHOOK_SECRET="$stripeWebhookSecret" \
    STRIPE_PRICE_ID_PRO="$stripePriceIdPro" \
    STRIPE_PRICE_ID_SETUP="$stripePriceIdSetup" \
    DATAVERSE_URL="$dataverseUrl" \
    DATAVERSE_TENANT_ID="$dataverseTenantId" \
    CLIENT_ID="$clientId" \
    CLIENT_SECRET="$clientSecret"

# Vérifier
echo "✅ Secrets ajoutés. Vérification :"
az functionapp config appsettings list \
  --name $functionAppName \
  --resource-group $resourceGroup \
  --query "[].{name:name, value:value}" -o table
```

### 📋 Version ligne par ligne (si le script entier échoue)

```powershell
# Se connecter à Azure
az login

# Définir le contexte
$resourceGroup = "rg-bcf-prod"
$functionAppName = "bcf-stripe-prod"

# Ajouter chaque secret individuellement
az functionapp config appsettings set --name $functionAppName --resource-group $resourceGroup --settings "STRIPE_SECRET_KEY=sk_live_..."

az functionapp config appsettings set --name $functionAppName --resource-group $resourceGroup --settings "STRIPE_WEBHOOK_SECRET=whsec_..."

az functionapp config appsettings set --name $functionAppName --resource-group $resourceGroup --settings "STRIPE_PRICE_ID_PRO=price_..."

az functionapp config appsettings set --name $functionAppName --resource-group $resourceGroup --settings "STRIPE_PRICE_ID_SETUP=price_..."

# Vérifier
az functionapp config appsettings list --name $functionAppName --resource-group $resourceGroup
```

---

## ⚠️ Important

1. **Ne mettez JAMAIS ces valeurs dans le code source**
2. **Utilisez UNIQUEMENT Azure App Settings** (ce que nous faisons)
3. **GitHub Secret Scanning** bloquera les vrais IDs
4. **Les secrets Azure sont chiffrés** par Microsoft

---

## ✅ Vérification

Après avoir exécuté le script, vérifiez :

```powershell
az functionapp config appsettings list --name bcf-stripe-prod --resource-group rg-bcf-prod --query "[?contains(name, 'STRIPE')].{name:name}" -o table
```

Vous devriez voir :
```
Name
---
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_PRO
STRIPE_PRICE_ID_SETUP
```

**Les valeurs ne sont pas affichées par sécurité** (c'est normal ✅)

---

## 🔄 Redéployer les Functions

Après avoir ajouté les secrets, redéployez les Azure Functions :

```powershell
cd "C:\Users\CIP FARO\Documents\BCF Bizness\bcf-bisnes"
func azure functionapp publish bcf-stripe-prod
```

Les fonctions auront accès aux variables d'environnement ! 🚀
