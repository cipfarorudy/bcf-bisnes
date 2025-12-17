# BCF Business Tools Generator

Services administratifs conseils call center - Générateur d'outils professionnels

## Description

Ce projet génère automatiquement un ensemble d'outils professionnels pour la gestion d'une activité de services administratifs, incluant :

1. **Page de vente HTML** - Une page de vente moderne et responsive pour l'abonnement Pro (back-office + financement + acquisition)
2. **Scripts Call Center** - Scripts opérationnels pour la gestion des appels entrants
3. **Modèle de devis DOCX** - Template de devis professionnel pour l'abonnement multi-services
4. **Template CRM CSV** - Fichier d'import pour la gestion des leads

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/cipfarorudy/bcf-bisnes.git
cd bcf-bisnes
```

2. Installer les dépendances :
```bash
pip install -r requirements.txt
```

## Utilisation

Exécuter le script de génération :
```bash
python generate_business_tools.py
```

Les fichiers générés seront créés dans le répertoire `output/` :
- `page_vente_abonnement_pro.html` - Page de vente HTML
- `scripts_call_center.txt` - Scripts pour le centre d'appels
- `modele_devis_abonnement_multiservices.docx` - Modèle de devis
- `template_import_crm_leads.csv` - Template d'import CRM

## Fichiers générés

### 1. Page de vente HTML
Une page de vente professionnelle avec :
- Design moderne et responsive
- Sections : Hero, Offres (Pro/Premium), FAQ
- Formulaire de diagnostic intégré
- Optimisée pour mobile et desktop

### 2. Scripts Call Center
Scripts complets pour la gestion des appels entrants :
- Procédures d'ouverture et de clôture d'appel
- Arbre de décision (information, devis, financement, digital)
- Scripts de prise de rendez-vous
- Gestion des clients mécontents
- Champs CRM à remplir

### 3. Modèle de devis DOCX
Template de devis professionnel incluant :
- Informations fournisseur et client
- Détail des prestations (Pro, Premium, Setup)
- Récapitulatif avec TVA
- Conditions générales

### 4. Template CRM CSV
Fichier d'import avec exemple de lead :
- Champs complets pour la gestion des prospects
- Format compatible avec la plupart des CRM
- Exemple de données pré-rempli

## Configuration

Le répertoire de sortie est configuré pour générer les fichiers dans le dossier `output/` du projet.
Vous pouvez modifier ce chemin dans le fichier `generate_business_tools.py` si nécessaire :
```python
base = os.path.join(os.path.dirname(__file__), "output")  # Modifier selon vos besoins
```

## Dépendances

- `python-docx` - Pour la génération de documents Word
- `pandas` - Pour la manipulation de données CSV

## Tests

Pour vérifier que tout fonctionne correctement, exécutez les tests :
```bash
python test_generator.py
```

Ou utilisez le script d'exemple :
```bash
python example_usage.py
```

## Licence

Tous droits réservés.
