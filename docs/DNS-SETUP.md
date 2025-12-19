# 🌐 Configuration DNS - bcfbiznes.com

## 📋 Enregistrements à créer chez votre registrar

### 1️⃣ Validation de l'apex (bcfbiznes.com)

**Type**: TXT  
**Nom**: `asuid.bcfbiznes.com` OU `asuid` (selon interface)  
**Valeur**: `_d9azj7v10m80jcv04h3kony2ize4wuf`  
**TTL**: 300 (5 min) ou Auto

---

### 2️⃣ Sous-domaine www

**Type**: CNAME  
**Nom**: `www`  
**Cible**: `ambitious-forest-04f3b3503.3.azurestaticapps.net`  
**TTL**: 300 (5 min) ou Auto

---

### 3️⃣ Routage de l'apex (optionnel)

Si votre DNS supporte ALIAS/ANAME:
- **Type**: ALIAS ou ANAME
- **Nom**: `@` (racine)
- **Cible**: `ambitious-forest-04f3b3503.3.azurestaticapps.net`

Si non supporté:
- Utilisez `www.bcfbiznes.com` comme URL principale
- Redirigez `bcfbiznes.com` → `www.bcfbiznes.com` via redirection HTTP

---

## 🔍 Vérification de la propagation DNS

### PowerShell (Windows)

```powershell
# Vérifier TXT
Resolve-DnsName -Name asuid.bcfbiznes.com -Type TXT | Select-Object -ExpandProperty Strings

# Vérifier CNAME
Resolve-DnsName -Name www.bcfbiznes.com -Type CNAME | Select-Object -ExpandProperty NameHost

# Devrait retourner: ambitious-forest-04f3b3503.3.azurestaticapps.net
```

### Linux/macOS

```bash
# Vérifier TXT
dig asuid.bcfbiznes.com TXT +short

# Vérifier CNAME
dig www.bcfbiznes.com CNAME +short
```

---

## ✅ Finaliser l'attachement Azure

**Une fois les DNS propagés** (5-30 min), exécutez:

```powershell
# Attacher l'apex avec validation TXT
az staticwebapp hostname set `
  --name bcf-bizness-web `
  --resource-group rg-bcf-prod `
  --hostname bcfbiznes.com `
  --validation-method dns-txt-token

# Attacher www avec validation CNAME
az staticwebapp hostname set `
  --name bcf-bizness-web `
  --resource-group rg-bcf-prod `
  --hostname www.bcfbiznes.com

# Lister les hostnames configurés
az staticwebapp hostname list `
  --name bcf-bizness-web `
  --resource-group rg-bcf-prod `
  -o table
```

---

## 🔐 Certificat SSL

**Automatique** : Azure génère et renouvelle le certificat SSL (Let's Encrypt) une fois les domaines validés.

**Vérification** : Après ~10 min, accédez à:
- https://bcfbiznes.com
- https://www.bcfbiznes.com

Le cadenas 🔒 doit apparaître dans la barre d'adresse.

---

## 📊 État actuel

| Élément | Statut |
|---------|--------|
| Token TXT généré | ✅ `_d9azj7v10m80jcv04h3kony2ize4wuf` |
| Enregistrement TXT créé | ⏳ À faire chez registrar |
| CNAME www créé | ⏳ À faire chez registrar |
| Propagation DNS | ⏳ 5-30 min après création |
| Attachement Azure | ⏳ Après propagation |
| Certificat SSL | ⏳ Auto après attachement |

---

## 🆘 Troubleshooting

### "CNAME Record is invalid"
➡️ Le CNAME n'est pas encore propagé. Attendez 5-10 min et réessayez.

### "Validation token not found"
➡️ L'enregistrement TXT n'est pas visible. Vérifiez:
- Le nom est bien `asuid.bcfbiznes.com` (ou `asuid` selon votre DNS)
- La valeur exacte sans guillemets
- Propagation DNS (utilisez `Resolve-DnsName`)

### Apex ne fonctionne pas
➡️ Si votre DNS ne supporte pas ALIAS:
1. Utilisez `www.bcfbiznes.com` comme URL principale
2. Configurez une redirection HTTP 301 de `bcfbiznes.com` → `www.bcfbiznes.com`

---

## 📞 Support

- **Azure Static Web Apps**: https://learn.microsoft.com/azure/static-web-apps/custom-domain
- **DNS propagation checker**: https://dnschecker.org
- **Contact**: contact@bcfbiznes.com
