# 🔐 Configuration des Secrets et Clés Azure Function

## 📋 Résumé

Cette application utilise une **architecture sécurisée** pour gérer les clés API :
- ❌ Les clés ne sont **PAS** stockées dans le code source
- ✅ Les clés sont stockées dans **Azure Key Vault** ou **Variables d'environnement**
- ✅ Un endpoint `/api/config/apikey` injecte la clé au client de manière sécurisée

## 🚀 Configuration Locale (Développement)

### 1. Copier et remplir le fichier `.env`
```bash
cp .env.example .env
```

Ajouter vos clés :
```env
STRIPE_PRICE_ID_STARTER=price_xxxxx
STRIPE_PRICE_ID_PRO=price_xxxxx
STRIPE_PRICE_ID_PREMIUM=price_xxxxx
STRIPE_API_KEY=sk_test_xxxxx
FUNCTION_KEY=xxxxx
```

### 2. Lancer en local
```bash
func host start
```

Le HTML chargera la clé depuis `http://localhost:7071/api/config/apikey`

## 🔒 Configuration Production (Azure)

### Option A : Via Azure CLI

```bash
# 1. Créer le Resource Group
az group create \
  --name rg-bcf-prod \
  --location eastus

# 2. Créer la Function App
az functionapp create \
  --resource-group rg-bcf-prod \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name bcf-stripe-prod \
  --storage-account "yourstorageaccount"

# 3. Configurer les variables d'environnement
az functionapp config appsettings set \
  --name bcf-stripe-prod \
  --resource-group rg-bcf-prod \
  --settings \
    STRIPE_PRICE_ID_STARTER="price_xxxxx" \
    STRIPE_PRICE_ID_PRO="price_xxxxx" \
    STRIPE_PRICE_ID_PREMIUM="price_xxxxx" \
    STRIPE_API_KEY="sk_live_xxxxx"

# 4. Déployer le code
func azure functionapp publish bcf-stripe-prod --build remote

# 5. Récupérer la clé de fonction
az functionapp keys list \
  --name bcf-stripe-prod \
  --resource-group rg-bcf-prod \
  --query "functionKeys.default" -o tsv
```

### Option B : Via Script `deploy.sh`

```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔑 Endpoint de Récupération de Clé

**Route :**
```
GET /api/config/apikey?code={FUNCTION_KEY}
```

**Réponse :**
```json
{
  "apiKey": "xxxxx"
}
```

**Sécurité :**
- ✅ Authentification par `authLevel: "function"`
- ✅ Clé injectée côté serveur
- ✅ Cachée du code source Git

## 📝 Notes Importantes

1. **Jamais hardcoder les clés** dans le HTML
2. **Toujours utiliser `.env`** en développement
3. **Utiliser Azure Key Vault** en production (avancé)
4. **Vérifier les secrets** avec `git secrets` avant de pusher

## 🧪 Test Local

```bash
# Démarrer Azure Functions
func host start

# Dans le navigateur
curl http://localhost:7071/api/config/apikey?code=YOUR_LOCAL_KEY
```

## 🚨 Troubleshooting

**"API key not configured"**
- Vérifier que `FUNCTION_KEY` est défini dans `.env` ou les paramètres Azure

**"401 Unauthorized"**
- Vérifier le `FUNCTION_KEY` dans l'URL

**"TypeError: Cannot read property 'apiKey'"**
- Vérifier que l'endpoint retourne du JSON valide

---

📚 **Documentation :**
- [Azure Functions Authentication](https://learn.microsoft.com/en-us/azure/azure-functions/security-concepts)
- [Azure Key Vault](https://learn.microsoft.com/en-us/azure/key-vault/)
