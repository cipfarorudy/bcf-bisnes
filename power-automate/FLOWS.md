# Power Automate — 6 Flux (Guide d'implémentation)

## ⚠️ IMPORTANT : Placeholders à remplacer

Tous les champs avec `{LIKE_THIS}` doivent être remplacés :
- `{DATAVERSE_PREFIX}` : votre préfixe (ex: `cip_`, `new_`)
- `{DATAVERSE_URL}` : URL instance (ex: `https://xxx.crm4.dynamics.com`)
- `{STRIPE_WEBHOOK_SECRET}` : de votre compte Stripe
- `{AZURE_FUNCTION_URL}` : URL déployée
- `{TEAMS_CHANNEL_ID}` : pour les notifications

---

## Flow 1 — Onboarding (Power Pages → Dataverse + Tickets)

**Déclencheur** : Quand un formulaire Power Pages est soumis

### Actions

1. **Créer/Mettre à jour Account** (Dataverse)
   - Name = input formulaire "Company Name"
   - Industry = input "Industry"
   - Phone = input "Phone"

2. **Créer/Mettre à jour Contact** (Dataverse)
   - First Name, Last Name = input formulaire
   - Email = input
   - Phone = input
   - Job Title = input
   - Decision Maker = booléen (oui/non)
   - Account = lookup vers Account créé

3. **Créer Lead** (Dataverse)
   - Name = {DATAVERSE_PREFIX}name
   - Email = input
   - Phone = input
   - Company Name = input
   - Source = "Website"
   - Status = "Nouveau"

4. **Créer 4 ServiceTickets** (boucle)
   - Types : "Call Center", "Financing", "Domain & Mail", "Tunnel"
   - Status = "À faire"
   - Due Date = NOW() + 7 jours
   - Subscription = lookup (créé en étape 5)

5. **Créer Subscription** (Dataverse)
   - Name = "{DATAVERSE_PREFIX}name"
   - Plan = "PRO"
   - Status = "Pending"
   - Account = lookup
   - Start Date = NOW()
   - MRR = 990

6. **Notifier Teams** (optionnel)
   - Canal : Operations
   - Message : "Nouveau client [Name] — Onboarding lancé"

7. **Envoyer Email** (Outlook)
   - À : input "Email"
   - Sujet : "Bienvenue chez BCF Bizness"
   - Corps : template HTML avec lien onboarding + checklist

---

## Flow 2 — Activation Abonnement

**Déclencheur** : Quand une Subscription est modifiée

**Condition** : `Status = "Active"` AND `Kickoff Done != true`

### Actions

1. **Mettre à jour Subscription**
   - Kickoff Done = true

2. **Créer tâche** (ou Activity)
   - Sujet : "Appel J0 - Lancement"
   - Due Date = NOW()
   - Owner = "Call Center Team"

3. **Envoyer Email Client**
   - Sujet : "Votre abonnement PRO est activé !"
   - Corps : instructions accès + planning

4. **Notifier Teams**
   - Canal : Sales
   - Message : "[Customer] — Abonnement actif, lancer sequences"

---

## Flow 3 — Dunning (Impayés)

**Déclencheur** : Quand Subscription status devient `"PastDue"`

### Actions (conditionnelles par jour)

**J0 (immédiat)**
1. Créer tâche "Relance paiement J0"
2. Envoyer email + SMS (si connecteur disponible)
3. Poster dans Teams

**J2 (planifié)**
1. Créer tâche "Relance paiement J2 - Appel"
2. Escalade : notifier manager

**J5 (si pas payé)**
1. Mettre à jour Subscription : `ServiceAccess = "Suspended"`
2. Email dernier rappel
3. Créer tâche "Suspension - À relancer"

---

## Flow 4 — Routing Call Center

**Déclencheur** : Quand ServiceTicket est créé avec Type = "Call Center"

### Actions

1. **Assigner à agent** (round-robin ou selon charge)
   - Lookup Agent (table Utilisateurs)
   - Assigner à : Agent.ID

2. **Créer CallTask** (Activity ou record custom)
   - Subject = "Appel qualification"
   - Regarding = Subscription
   - Owner = Agent assigné

3. **Notifier Agent** (Teams ou Email)
   - Message : "Nouveau prospect à appeler — [Customer Name]"
   - Script : lien vers PDF script qualification

4. **Quand Agent clôt la tâche**
   - Mettre à jour Lead.Status (Qualifié / RDV / Perdu)
   - Créer RDV si "RDV pris"

---

## Flow 5 — Facturation

**Déclencheur** : Quand Subscription devient `"Active"`

### Actions

1. **Générer facture**
   - Option A : Word template + "Populate Word template" + "Convert to PDF"
   - Option B : Récupérer PDF depuis Stripe API

2. **Stocker dans SharePoint**
   - Folder : `/Invoices/{Year}/{Month}`
   - Filename : `Invoice_{SubscriptionID}_{Date}.pdf`

3. **Envoyer Email Client**
   - À : {DATAVERSE_PREFIX}contact.email
   - Pièce jointe : facture PDF
   - Sujet : "Votre facture PRO — [Date]"

---

## Flow 6 — Reporting Hebdomadaire

**Déclencheur** : Planifié (lundi 08:00)

### Actions

1. **Query Dataverse**
   - MRR total = SUM(Subscription.MRR WHERE Status = "Active")
   - PastDue count = COUNT(Subscription WHERE Status = "PastDue")
   - Tickets ouverts = COUNT(ServiceTicket WHERE Status != "Terminé")
   - Churn = COUNT(Subscription WHERE Status = "Cancelled" THIS WEEK)

2. **Composer résumé**
   ```
   📊 RAPPORT HEBDO — BCF Bizness
   MRR : 990€ × [N clients] = [Total]€
   Paiements en retard : [N]
   Tickets actifs : [N]
   Churn : [N]
   ```

3. **Poster dans Teams**
   - Canal : Direction
   - Message : résumé + lien dashboard Power BI (optionnel)

4. **Envoyer Email** (optionnel)
   - Destinataires : Direction
   - Pièce jointe : rapport PDF

---

## Notes d'implémentation

- Tous les noms de tables/colonnes doivent utiliser votre `{DATAVERSE_PREFIX}`
- Les emails doivent utiliser **Outlook** (connecteur natif Microsoft)
- Pour les notifications Teams, ajouter le connecteur **Teams**
- Les automates avec "planifié" nécessitent **Power Automate Premium** (ou utiliser Azure Logic Apps gratuit)
- Tester d'abord en **Sandbox** avant production

---

## Checklist d'activation

- [ ] Dataverse tables créées (voir DATAVERSE-SCHEMA.json)
- [ ] Power Automate connecteurs configurés (Dataverse, Outlook, Teams)
- [ ] Azure Functions déployées et testées
- [ ] Stripe webhooks pointant vers Azure Function
- [ ] Flows importés et mappés à votre instance
- [ ] Test end-to-end : formulaire → Dataverse → email

