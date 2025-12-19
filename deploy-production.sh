#!/bin/bash
# Script de déploiement - Injecte la clé de fonction dans le formulaire

set -e

echo "📦 Récupération de la clé de fonction Azure..."
FUNCTION_KEY=$(az functionapp keys list --name bcf-stripe-prod --resource-group rg-bcf-prod --query "functionKeys.default" -o tsv)

echo "🔄 Mise à jour du formulaire..."
sed -i "s/REMPLACER_PAR_VOTRE_CLE_AZURE/$FUNCTION_KEY/g" ./public/index.html

echo "🚀 Déploiement sur Static Web Apps..."
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list --name bcf-bizness-web --resource-group rg-bcf-prod --query "properties.apiKey" -o tsv)
npm install -g @azure/static-web-apps-cli
swa deploy ./public --deployment-token "$DEPLOYMENT_TOKEN" --app-name bcf-bizness-web

echo "✅ Déploiement réussi !"
echo "URL : https://ambitious-forest-04f3b3503.3.azurestaticapps.net"

# Restaurer le placeholder
git checkout public/index.html
