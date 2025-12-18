# 🚀 Configuration Rapide - Étapes 2, 3, 4

## 📌 Vue d'ensemble

```
✅ Étape 1 : Clé Azure Function     [COMPLÉTÉE]
   ↓
⏳ Étape 2 : Configuration Stripe    [À FAIRE MAINTENANT]
   ├─ Créer 2 products (PRO + SETUP)
   ├─ Configurer webhook
   └─ Récupérer 4 IDs/secrets
   ↓
⏳ Étape 3 : Ajouter Secrets Azure   [APRÈS Étape 2]
   ├─ STRIPE_SECRET_KEY
   ├─ STRIPE_WEBHOOK_SECRET
   ├─ STRIPE_PRICE_ID_PRO
   └─ STRIPE_PRICE_ID_SETUP
   ↓
⏳ Étape 4 : Créer Tables Dataverse  [OPTIONNEL - En parallèle OK]
   └─ 6 tables avec 50+ colonnes
```

---

## 🏃 Chemin Critique (ordre recommandé)

### **JOUR 1 - Stripe (2-3h)**

**Voir** : [docs/STRIPE-SETUP-GUIDE.md](STRIPE-SETUP-GUIDE.md)

```
1. Dashboard Stripe
2. Créer Product PRO (990€/mois)
3. Créer Product SETUP (490€ one-time)
4. Noter les 2 Price IDs
5. Configurer Webhook → https://bcf-stripe-prod.azurewebsites.net/api/stripe/webhook
6. Noter le Signing Secret
7. Copier la Secret API Key
```

**Résultat** : 4 IDs notés
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_SETUP=price_...
```

---

### **JOUR 1-2 - Azure Secrets (15 min)**

**Voir** : [docs/AZURE-SECRETS-SETUP.md](AZURE-SECRETS-SETUP.md)

```powershell
# Exécuter le script avec vos 4 IDs Stripe
$resourceGroup = "rg-bcf-prod"
$functionAppName = "bcf-stripe-prod"

az functionapp config appsettings set \
  --name $functionAppName \
  --resource-group $resourceGroup \
  --settings \
    STRIPE_SECRET_KEY="sk_live_..." \
    STRIPE_WEBHOOK_SECRET="whsec_..." \
    STRIPE_PRICE_ID_PRO="price_..." \
    STRIPE_PRICE_ID_SETUP="price_..."

# Redéployer
func azure functionapp publish bcf-stripe-prod
```

**Résultat** : Azure Functions ont accès aux secrets ✅

---

### **JOUR 2-3 - Dataverse Tables (2-3h) [OPTIONNEL]**

**Voir** : [docs/DATAVERSE-TABLES-SETUP.md](DATAVERSE-TABLES-SETUP.md)

**Pour chaque table**, dans **Power Apps** :

1. https://make.powerapps.com
2. Dataverse → Nouvelles tables
3. Créer :
   - `bcf_lead` (prospect)
   - `bcf_account` (entreprise)
   - `bcf_contact` (personne)
   - `bcf_subscription` (abonnement)
   - `bcf_serviceticket` (support)
   - `bcf_fundingcase` (financement)

**Résultat** : 6 tables prêtes pour Power Automate 🎯

---

## ⚡ Ordre d'Exécution

| Jour | Tâche | Priorité | Durée |
|-----|-------|----------|-------|
| 1 | ✅ **Stripe Setup** | 🔴 CRITIQUE | 2-3h |
| 1-2 | ✅ **Azure Secrets** | 🔴 CRITIQUE | 15min |
| 2 | 🟡 **Dataverse Tables** | 🟡 IMPORTANTE | 2-3h |
| 3+ | 🟢 **Power Automate Flows** | 🟢 BONUS | 3-4h |

---

## 🧪 Test de Fonctionnement

**Après Étape 2 + 3**, testez :

```powershell
# URL du formulaire
https://ambitious-forest-04f3b3503.3.azurestaticapps.net

# Remplir :
# Email: test@example.com
# Entreprise: Test SARL
# Cliquer "S'abonner"

# Vous devriez être redirigé vers Stripe Checkout ✅
# Les webhooks doivent recevoir les événements ✅
```

---

## 📞 Support

- **Problème Stripe ?** → [STRIPE-SETUP-GUIDE.md](STRIPE-SETUP-GUIDE.md#-troubleshooting)
- **Problème Azure ?** → [AZURE-SECRETS-SETUP.md](AZURE-SECRETS-SETUP.md#-important)
- **Problème Dataverse ?** → [DATAVERSE-TABLES-SETUP.md](DATAVERSE-TABLES-SETUP.md#-checklist-dataverse)

---

## 📊 Statut Global

| Composant | Étape | Statut |
|-----------|-------|--------|
| Frontend | 1 | ✅ LIVE |
| Azure Functions API | 1 | ✅ LIVE |
| Stripe Products | **2** | ⏳ À FAIRE |
| Stripe Webhook | **2** | ⏳ À FAIRE |
| Azure App Settings | **3** | ⏳ À FAIRE |
| Dataverse Tables | **4** | ⏳ À FAIRE (optionnel) |
| Power Automate Flows | 5 | ⏳ À FAIRE (optionnel) |

---

## 🎯 Prochaine Étape

👉 **Allez à** : [docs/STRIPE-SETUP-GUIDE.md](STRIPE-SETUP-GUIDE.md) pour commencer ! 🚀
