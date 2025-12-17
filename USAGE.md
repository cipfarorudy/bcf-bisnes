# Guide d'Utilisation - BCF Business Tools Generator

## Vue d'ensemble

Ce projet génère automatiquement un ensemble complet d'outils professionnels pour gérer une activité de services administratifs, centre d'appels, et accompagnement au financement.

## Installation Rapide

```bash
# 1. Cloner le dépôt
git clone https://github.com/cipfarorudy/bcf-bisnes.git
cd bcf-bisnes

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Générer les outils
python generate_business_tools.py
```

## Fichiers Générés

Après exécution, vous trouverez dans le dossier `output/` :

### 1. page_vente_abonnement_pro.html (~12 Ko)
**Page de vente HTML moderne et responsive**

- Design professionnel avec gradient et effets visuels
- Sections complètes : Hero, Offres, FAQ
- Formulaire de diagnostic intégré
- Optimisée mobile et desktop
- Style moderne avec CSS Variables

**Utilisation :**
- Ouvrir directement dans un navigateur
- Intégrer dans WordPress, CMS ou site existant
- Personnaliser les couleurs via les CSS variables

### 2. scripts_call_center.txt (~3.6 Ko)
**Guide opérationnel pour centre d'appels**

Contient :
- Scripts d'ouverture et clôture d'appel
- Procédures de qualification
- Arbre de décision (information, devis, financement, digital)
- Scripts de prise de rendez-vous
- Gestion des situations difficiles
- Champs CRM obligatoires

**Utilisation :**
- Imprimer et distribuer aux opérateurs
- Intégrer dans la formation du personnel
- Adapter les scripts selon votre contexte

### 3. modele_devis_abonnement_multiservices.docx (~38 Ko)
**Template de devis professionnel**

Sections :
- En-tête fournisseur et client
- Références (numéro, date, validité)
- Tableau détaillé des prestations
- Récapitulatif TTC avec TVA
- Conditions générales
- Zone de signature

**Utilisation :**
- Ouvrir avec Microsoft Word ou LibreOffice
- Remplacer les champs entre crochets [XXX]
- Sauvegarder et envoyer au client

### 4. template_import_crm_leads.csv (425 octets)
**Template d'import CRM**

19 colonnes :
- Identification (LeadID, Nom, Prénom, Entreprise, SIRET)
- Coordonnées (Email, Téléphone)
- Qualification (TypeStructure, BesoinPrincipal, OffreCible)
- Suivi (StatutLead, ProchaineAction, Responsable, Echeance)
- Métadonnées (DateCreation, Source, Urgence, Notes)

**Utilisation :**
- Importer dans votre CRM (HubSpot, Salesforce, Zoho, etc.)
- Compléter avec vos prospects
- Format compatible CSV standard

## Personnalisation

### Modifier le dossier de sortie

Éditez `generate_business_tools.py`, ligne 7 :

```python
base = os.path.join(os.path.dirname(__file__), "output")  # Modifier ici
```

### Personnaliser les templates

Tous les contenus sont dans `generate_business_tools.py` :

- **HTML** : variable `html` (lignes 10-268)
- **Scripts** : variable `script_txt` (lignes 275-360)
- **Devis** : génération DOCX (lignes 367-435)
- **CRM** : structure DataFrame (lignes 442-462)

## Tests et Validation

### Exécuter les tests unitaires

```bash
python test_generator.py
```

**11 tests vérifient :**
- Génération des 4 fichiers
- Taille non nulle
- Contenu attendu (mots-clés, structure)

### Script d'exemple

```bash
python example_usage.py
```

Affiche un résumé des fichiers générés avec taille et chemin.

## Structure du Projet

```
bcf-bisnes/
├── generate_business_tools.py  # Script principal
├── test_generator.py           # Tests unitaires
├── example_usage.py            # Script d'exemple
├── requirements.txt            # Dépendances Python
├── .gitignore                  # Fichiers à ignorer
├── README.md                   # Documentation principale
├── USAGE.md                    # Ce guide
└── output/                     # Dossier de sortie
    ├── page_vente_abonnement_pro.html
    ├── scripts_call_center.txt
    ├── modele_devis_abonnement_multiservices.docx
    └── template_import_crm_leads.csv
```

## Cas d'Usage

### 1. Lancement d'une activité
Générez tous les outils pour démarrer rapidement votre service.

### 2. Refonte d'image
Utilisez la page HTML moderne pour rafraîchir votre image.

### 3. Formation d'équipe
Les scripts call center servent de base de formation.

### 4. Standardisation
Templates uniformes pour devis et gestion CRM.

## Dépannage

### Erreur : Module 'docx' not found
```bash
pip install python-docx
```

### Erreur : Module 'pandas' not found
```bash
pip install pandas
```

### Fichiers non générés
Vérifiez les permissions du dossier `output/`.

### HTML ne s'affiche pas correctement
Ouvrez avec un navigateur moderne (Chrome, Firefox, Safari, Edge).

## Support

Pour toute question ou problème :
1. Consultez le README.md
2. Exécutez les tests : `python test_generator.py`
3. Vérifiez les permissions du dossier de sortie
4. Ouvrez une issue sur GitHub

## Licence

© Tous droits réservés.
