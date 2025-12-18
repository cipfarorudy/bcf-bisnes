# 🟣 Configuration Dataverse - Tables & Schéma

## 📍 Accès Dataverse

1. Allez à : https://make.powerapps.com
2. Sélectionnez **votre environment**
3. Cliquez sur **Dataverse** → **Tables**

---

## 📋 Tables à Créer

Vous devez créer **6 tables** avec le préfixe `bcf_` (norme Microsoft)

---

### Table 1 : bcf_lead (Prospect/Lead)

**Affichage** : `bcf_leadname`

| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| `bcf_leadname` | Text (255) | ✅ | Nom du prospect |
| `bcf_email` | Text (254) | ✅ | Email du prospect |
| `bcf_companyname` | Text (255) | ✅ | Entreprise |
| `bcf_phone` | Text (20) | ❌ | Téléphone |
| `bcf_leadstatus` | Choice | ✅ | *New*, *Qualified*, *Converted* |
| `bcf_sourceofcontact` | Choice | ❌ | *Website*, *Referral*, *Other* |

**Créer** :
1. Power Apps → Tables → Nouvelle table
2. Nom : `Lead` (crée automatiquement `bcf_lead`)
3. Ajouter les colonnes ci-dessus

---

### Table 2 : bcf_account (Entreprise Client)

**Affichage** : `bcf_accountname`

| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| `bcf_accountname` | Text (255) | ✅ | Nom de l'entreprise |
| `bcf_accountnumber` | Text (100) | ❌ | N° Client |
| `bcf_address` | Text (2048) | ❌ | Adresse |
| `bcf_city` | Text (100) | ❌ | Ville |
| `bcf_zipcode` | Text (10) | ❌ | Code postal |
| `bcf_country` | Text (100) | ❌ | Pays |
| `bcf_phone` | Text (20) | ❌ | Téléphone |
| `bcf_industrycode` | Text (100) | ❌ | Secteur d'activité |

---

### Table 3 : bcf_contact (Contact/Personne)

**Affichage** : `bcf_fullname`

| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| `bcf_fullname` | Text (255) | ✅ | Nom complet |
| `bcf_firstname` | Text (100) | ❌ | Prénom |
| `bcf_lastname` | Text (100) | ❌ | Nom |
| `bcf_email` | Text (254) | ✅ | Email |
| `bcf_phone` | Text (20) | ❌ | Téléphone |
| `bcf_jobtitle` | Text (100) | ❌ | Fonction |
| `bcf_account` | Lookup | ❌ | Lien vers Account |
| `bcf_isfccontact` | Boolean | ❌ | Est contact formation continue ? |

**Relation** :
- Lien vers `bcf_account` (Many-to-One)

---

### Table 4 : bcf_subscription (Abonnement Client)

**Affichage** : `bcf_subscriptionid`

| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| `bcf_subscriptionid` | Text (100) | ✅ | ID unique (ex: `web-1671X`) |
| `bcf_account` | Lookup | ✅ | Lien vers Account |
| `bcf_contact` | Lookup | ❌ | Contact principal |
| `bcf_plan` | Choice | ✅ | *PRO* |
| `bcf_status` | Choice | ✅ | *Active*, *PastDue*, *Canceled*, *Completed* |
| `bcf_stripecustomerid` | Text (100) | ✅ | ID Stripe `cus_...` |
| `bcf_stripesubscriptionid` | Text (100) | ❌ | ID Subscription Stripe `sub_...` |
| `bcf_startdate` | Date | ✅ | Date de début |
| `bcf_enddate` | Date | ❌ | Date de fin (si applicable) |
| `bcf_monthlyamount` | Decimal | ✅ | Montant mensuel (990,00€) |
| `bcf_setupfee` | Decimal | ❌ | Frais d'installation (490,00€) |
| `bcf_currency` | Choice | ✅ | *EUR* |
| `bcf_billingcycle` | Choice | ✅ | *Monthly*, *Quarterly*, *Yearly* |

---

### Table 5 : bcf_serviceticket (Demande de Service)

**Affichage** : `bcf_ticketnumber`

| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| `bcf_ticketnumber` | AutoNumber | ✅ | Numéro auto-généré |
| `bcf_subscription` | Lookup | ✅ | Lien vers Subscription |
| `bcf_contact` | Lookup | ❌ | Contact demandeur |
| `bcf_subject` | Text (500) | ✅ | Sujet du ticket |
| `bcf_description` | Text (2048) | ✅ | Description |
| `bcf_priority` | Choice | ✅ | *Low*, *Medium*, *High*, *Critical* |
| `bcf_status` | Choice | ✅ | *New*, *In Progress*, *Waiting*, *Resolved* |
| `bcf_assignedto` | Lookup | ❌ | Agent assigné (User) |
| `bcf_createdon` | DateTime | ✅ | Auto (Création) |
| `bcf_resolvedon` | DateTime | ❌ | Date résolution |
| `bcf_resolutiontime` | Text (255) | ❌ | Temps de résolution |

---

### Table 6 : bcf_fundingcase (Dossier de Financement)

**Affichage** : `bcf_casereference`

| Colonne | Type | Obligatoire | Description |
|---------|------|-------------|-------------|
| `bcf_casereference` | Text (100) | ✅ | Référence dossier |
| `bcf_subscription` | Lookup | ✅ | Lien vers Subscription |
| `bcf_fundingtype` | Choice | ✅ | *CPF*, *Entreprise*, *Pole Emploi*, *Autre* |
| `bcf_amount` | Decimal | ✅ | Montant du dossier |
| `bcf_currency` | Choice | ✅ | *EUR* |
| `bcf_status` | Choice | ✅ | *Pending*, *Approved*, *Rejected*, *Completed* |
| `bcf_submitteddate` | Date | ❌ | Date soumission |
| `bcf_approvaldate` | Date | ❌ | Date approbation |
| `bcf_documenturl` | Text (2048) | ❌ | Lien vers document |
| `bcf_fundingagency` | Text (255) | ❌ | Organisme financeur |

---

## 🚀 Procédure Création Rapide

Pour chaque table, dans Power Apps :

1. **Dataverse** → **Nouvelles tables** → **Créer une table**
2. **Nom** : Entrez le nom (ex: "Lead" → crée `bcf_lead`)
3. **Affichage principal** : Choisissez la colonne display (ex: `bcf_leadname`)
4. **Ajouter des colonnes**
5. **Créer des relations** avec lookup
6. **Enregistrer**

---

## 🔗 Relations (Lookups)

| De | Vers | Type |
|----|------|------|
| `Contact` | `Account` | Many-to-One |
| `Subscription` | `Account` | Many-to-One |
| `ServiceTicket` | `Subscription` | Many-to-One |
| `ServiceTicket` | `Contact` | Many-to-One |
| `FundingCase` | `Subscription` | Many-to-One |

---

## ✅ Checklist Dataverse

- [ ] Table `bcf_lead` créée avec 6 colonnes
- [ ] Table `bcf_account` créée avec 8 colonnes
- [ ] Table `bcf_contact` créée avec 8 colonnes + lookup Account
- [ ] Table `bcf_subscription` créée avec 13 colonnes
- [ ] Table `bcf_serviceticket` créée avec 10 colonnes + lookups
- [ ] Table `bcf_fundingcase` créée avec 9 colonnes
- [ ] Toutes les relations (lookups) configurées
- [ ] Sécurité : Vérifier les permissions (Users/Teams)

---

## 📊 Vue d'ensemble

```
Lead → (Converted To) → Account
                           ↓
                      Contact (Many)
                      Subscription (Many)
                           ↓
                   ServiceTicket (Many)
                   FundingCase (Many)
```

---

## 🔄 Prochaines étapes

Une fois les tables créées :

1. **Étape suivante** : Créer les **6 Power Automate Flows** (voir `FLOWS.md`)
2. Ces flows vont :
   - Écouter les webhooks Stripe
   - Créer automatiquement les Lead/Contact/Account
   - Gérer les abonnements
   - Gérer les demandes de service

**Allez à** : [power-automate/FLOWS.md](../power-automate/FLOWS.md) 🚀
