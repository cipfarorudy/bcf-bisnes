#!/bin/bash
# Deploy Azure Functions avec injection des variables d'environnement
# Usage: ./deploy.sh

set -e

RESOURCE_GROUP="rg-bcf-prod"
FUNCTION_APP="bcf-stripe-prod"
LOCATION="eastus"

echo "🚀 Déploiement BCF Bizness..."

# 1. Créer/mettre à jour l'App Service Plan
echo "📦 Configuration App Service..."
az appservice plan create \
  --name $FUNCTION_APP-plan \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux || true

# 2. Créer/mettre à jour la Function App
echo "⚙️ Création/mise à jour Function App..."
az functionapp create \
  --resource-group $RESOURCE_GROUP \
  --consumption-plan-location $LOCATION \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name $FUNCTION_APP \
  --storage-account "storageacctname" \
  --os-type Linux || true

# 3. Configurer les variables d'environnement depuis .env
echo "🔐 Configuration des secrets..."
source .env

az functionapp config appsettings set \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --settings \
    STRIPE_PRICE_ID_STARTER="$STRIPE_PRICE_ID_STARTER" \
    STRIPE_PRICE_ID_PRO="$STRIPE_PRICE_ID_PRO" \
    STRIPE_PRICE_ID_PREMIUM="$STRIPE_PRICE_ID_PREMIUM" \
    STRIPE_API_KEY="$STRIPE_API_KEY" \
    FUNCTION_KEY="$FUNCTION_KEY" \
    DATAVERSE_URL="$DATAVERSE_URL" \
    DATAVERSE_USERNAME="$DATAVERSE_USERNAME" \
    DATAVERSE_PASSWORD="$DATAVERSE_PASSWORD" \
    SUCCESS_URL="$SUCCESS_URL" \
    CANCEL_URL="$CANCEL_URL"

# 4. Déployer le code
echo "📤 Déploiement du code..."
func azure functionapp publish $FUNCTION_APP --build remote

# 5. Obtenir la clé de fonction
echo "🔑 Récupération de la clé de fonction..."
FUNCTION_KEY=$(az functionapp keys list \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --query "functionKeys.default" -o tsv)

echo "✅ Déploiement terminé!"
echo "URL: https://$FUNCTION_APP.azurewebsites.net"
echo "Clé: $FUNCTION_KEY"
