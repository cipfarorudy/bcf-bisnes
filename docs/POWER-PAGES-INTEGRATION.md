# 🎨 Power Pages — Intégration Stripe Checkout

## Vue d'ensemble

Power Pages affiche votre page de vente → Client clique "Démarrer" → Appel Azure Function → Redirection Stripe Checkout → Paiement → Retour Success/Cancel

---

## Architecture

```
[Power Pages]
    ↓ Bouton "Démarrer PRO"
    ↓ JavaScript: fetch Azure Function
[Azure Function: createCheckoutSession]
    ↓ Création session Stripe
    ↓ Retour URL checkout
[Redirection Stripe Checkout]
    ↓ Client paie
    ↓ Success ou Cancel
[Power Pages: /success ou /cancel]
```

---

## Étape 1 : Créer les pages Power Pages

### Page 1 : `/tarifs` (ou `/pricing`)

**Contenu :**
- Hero : "Abonnement Multiservices PRO"
- Bloc bénéfices
- Prix : 990€/mois + 490€ setup
- Bouton : **"Démarrer maintenant"** → `onclick="startCheckout()"`

### Page 2 : `/paiement-succes` (Success)

**Contenu :**
```html
<h1>✅ Paiement confirmé !</h1>
<p>Votre abonnement PRO est activé.</p>
<p>Vous allez recevoir un email de confirmation sous quelques minutes.</p>

<script>
  // Récupérer session_id depuis URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (sessionId) {
    console.log('Session Stripe:', sessionId);
    // Optionnel : envoyer à Dataverse ou afficher détails
  }
</script>
```

### Page 3 : `/paiement-annule` (Cancel)

**Contenu :**
```html
<h1>❌ Paiement annulé</h1>
<p>Vous avez annulé le paiement.</p>
<p><a href="/tarifs">← Retour aux tarifs</a></p>
<p>ou</p>
<p><button onclick="startCheckout()">Réessayer maintenant</button></p>
```

---

## Étape 2 : JavaScript dans Power Pages

Ajoutez ce code dans **Content Snippets** ou **Web Template** :

```javascript
async function startCheckout() {
  try {
    // Récupérer données du formulaire (si applicable)
    const email = document.getElementById('email')?.value || prompt('Votre email ?');
    const companyName = document.getElementById('company')?.value || '';
    
    // Appel Azure Function
    const response = await fetch('https://stripe-bcf-function-app.azurewebsites.net/api/stripe/createCheckoutSession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': 'VOTRE_FUNCTION_KEY_ICI' // Depuis Azure Portal
      },
      body: JSON.stringify({
        email: email,
        companyName: companyName,
        dvSubscriptionId: '' // Optionnel : ID Dataverse si déjà créé
      })
    });
    
    const data = await response.json();
    
    if (data.url) {
      // Redirection vers Stripe Checkout
      window.location.href = data.url;
    } else {
      alert('Erreur lors de la création du paiement');
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('Une erreur est survenue. Veuillez réessayer.');
  }
}
</script>
```

---

## Étape 3 : Sécuriser l'appel Azure Function

### Option A : Function Key (simple)

1. Azure Portal → Function App → Functions → `createCheckoutSession`
2. Function Keys → Copiez la **default** key
3. Ajoutez dans l'en-tête : `'x-functions-key': 'VOTRE_KEY'`

### Option B : CORS + domaine autorisé

1. Azure Portal → Function App → CORS
2. Ajoutez votre domaine Power Pages : `https://votre-site.powerappsportals.com`
3. Supprimez `*` si présent

---

## Étape 4 : Formulaire optionnel (collecte avant paiement)

Si vous voulez collecter des infos **avant** le checkout :

```html
<form id="leadForm">
  <input type="text" id="name" placeholder="Nom" required>
  <input type="email" id="email" placeholder="Email" required>
  <input type="text" id="company" placeholder="Entreprise">
  <input type="tel" id="phone" placeholder="Téléphone">
  
  <button type="submit">Passer au paiement →</button>
</form>

<script>
document.getElementById('leadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    company: document.getElementById('company').value,
    phone: document.getElementById('phone').value
  };
  
  // 1. Créer lead dans Dataverse (via Power Pages form ou API)
  // 2. Récupérer ID Dataverse
  // 3. Appeler startCheckout avec dvSubscriptionId
  
  await startCheckout();
});
</script>
```

---

## Étape 5 : Webhook confirmation (côté serveur)

Après paiement, Stripe envoie webhook → Azure Function → Dataverse :

1. Dataverse : Subscription status = "Active"
2. Power Automate : Flow "Activation abonnement"
3. Email client : "Bienvenue ! Votre abonnement est activé"
4. Teams : Notification équipe

---

## Étape 6 : Portail client (gérer abonnement)

Créez une page `/mon-compte` avec bouton "Gérer mon abonnement" :

```javascript
async function openStripePortal() {
  // Récupérer stripeCustomerId depuis Dataverse (via API)
  const stripeCustomerId = 'cus_XXXXX'; // À récupérer dynamiquement
  
  const response = await fetch('https://stripe-bcf-function-app.azurewebsites.net/api/stripe/portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-functions-key': 'VOTRE_KEY'
    },
    body: JSON.stringify({
      stripeCustomerId: stripeCustomerId,
      returnUrl: window.location.href
    })
  });
  
  const data = await response.json();
  window.location.href = data.url; // Redirection vers portail Stripe
}
</script>

<button onclick="openStripePortal()">Gérer mon abonnement</button>
```

---

## Checklist Power Pages

- [ ] Page `/tarifs` créée avec bouton "Démarrer"
- [ ] Page `/paiement-succes` créée
- [ ] Page `/paiement-annule` créée
- [ ] JavaScript `startCheckout()` ajouté
- [ ] Function Key récupérée et sécurisée
- [ ] CORS configuré dans Azure Function App
- [ ] Test : clic bouton → redirection Stripe
- [ ] Test : paiement → retour /success
- [ ] Test : annulation → retour /cancel

---

## Exemple de bouton stylisé

```html
<style>
.btn-checkout {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 32px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-checkout:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}
</style>

<button class="btn-checkout" onclick="startCheckout()">
  🚀 Démarrer l'abonnement PRO
</button>
```

---

## Support

Pour questions spécifiques Power Pages :
- [Microsoft Learn - Power Pages](https://learn.microsoft.com/en-us/power-pages/)
- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)

