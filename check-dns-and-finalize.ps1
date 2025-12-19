# Script de vérification et finalisation DNS - bcfbiznes.com
# Usage: .\check-dns-and-finalize.ps1

Write-Host "🔍 Vérification DNS pour bcfbiznes.com..." -ForegroundColor Cyan

# Vérifier TXT
Write-Host "`n1️⃣ Vérification TXT (asuid.bcfbiznes.com)..." -ForegroundColor Yellow
try {
    $txtRecord = Resolve-DnsName -Name asuid.bcfbiznes.com -Type TXT -ErrorAction Stop | Select-Object -ExpandProperty Strings
    if ($txtRecord -match "_d9azj7v10m80jcv04h3kony2ize4wuf") {
        Write-Host "   ✅ TXT OK: $txtRecord" -ForegroundColor Green
        $txtReady = $true
    } else {
        Write-Host "   ❌ TXT trouvé mais incorrect: $txtRecord" -ForegroundColor Red
        Write-Host "   Attendu: _d9azj7v10m80jcv04h3kony2ize4wuf" -ForegroundColor Yellow
        $txtReady = $false
    }
} catch {
    Write-Host "   ❌ TXT non trouvé (pas encore propagé)" -ForegroundColor Red
    $txtReady = $false
}

# Vérifier CNAME
Write-Host "`n2️⃣ Vérification CNAME (www.bcfbiznes.com)..." -ForegroundColor Yellow
try {
    $cnameRecord = Resolve-DnsName -Name www.bcfbiznes.com -Type CNAME -ErrorAction Stop | Select-Object -ExpandProperty NameHost
    if ($cnameRecord -match "ambitious-forest-04f3b3503") {
        Write-Host "   ✅ CNAME OK: $cnameRecord" -ForegroundColor Green
        $cnameReady = $true
    } else {
        Write-Host "   ❌ CNAME trouvé mais incorrect: $cnameRecord" -ForegroundColor Red
        Write-Host "   Attendu: ambitious-forest-04f3b3503.3.azurestaticapps.net" -ForegroundColor Yellow
        $cnameReady = $false
    }
} catch {
    Write-Host "   ❌ CNAME non trouvé (pas encore propagé)" -ForegroundColor Red
    $cnameReady = $false
}

# Résumé
Write-Host "`n📊 Résumé:" -ForegroundColor Cyan
Write-Host "   TXT (asuid):     $(if ($txtReady) { '✅ Prêt' } else { '⏳ En attente' })"
Write-Host "   CNAME (www):     $(if ($cnameReady) { '✅ Prêt' } else { '⏳ En attente' })"

if (-not $txtReady -and -not $cnameReady) {
    Write-Host "`n⏳ Aucun enregistrement propagé. Vérifiez:" -ForegroundColor Yellow
    Write-Host "   1. Avez-vous créé les enregistrements DNS chez votre registrar ?"
    Write-Host "   2. Attendez 5-30 minutes pour la propagation"
    Write-Host "   3. Relancez ce script"
    exit 1
}

# Finaliser si au moins un est prêt
Write-Host "`n🚀 Finalisation de l'attachement Azure..." -ForegroundColor Cyan

if ($txtReady) {
    Write-Host "`n3️⃣ Attachement apex (bcfbiznes.com)..." -ForegroundColor Yellow
    az staticwebapp hostname set `
        --name bcf-bizness-web `
        --resource-group rg-bcf-prod `
        --hostname bcfbiznes.com `
        --validation-method dns-txt-token
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Apex attaché avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Échec de l'attachement apex" -ForegroundColor Red
    }
}

if ($cnameReady) {
    Write-Host "`n4️⃣ Attachement www (www.bcfbiznes.com)..." -ForegroundColor Yellow
    az staticwebapp hostname set `
        --name bcf-bizness-web `
        --resource-group rg-bcf-prod `
        --hostname www.bcfbiznes.com
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ www attaché avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Échec de l'attachement www" -ForegroundColor Red
    }
}

# Liste finale
Write-Host "`n5️⃣ État final des hostnames:" -ForegroundColor Yellow
az staticwebapp hostname list `
    --name bcf-bizness-web `
    --resource-group rg-bcf-prod `
    -o table

Write-Host "`n✅ Terminé ! Vérifiez les URLs dans 5-10 minutes:" -ForegroundColor Green
Write-Host "   - https://bcfbiznes.com"
Write-Host "   - https://www.bcfbiznes.com"
Write-Host "   - https://bcfbiznes.com/success"
Write-Host "   - https://bcfbiznes.com/cancel"
