param(
    [string]$FunctionAppName = "bcf-stripe-prod",
    [string]$ResourceGroup = "rg-bcf-prod",
    [string]$SourcePath = "c:\\Users\\CIP FARO\\Documents\\BCF Bizness\\bcf-bisnes\\public\\index.html",
    [string]$TargetPath = "c:\\Users\\CIP FARO\\Documents\\BCF Bizness\\bcf-bisnes\\public\\index.deploy.html"
)

Write-Host "Récupération de la clé Azure Functions..." -ForegroundColor Cyan
$fnKey = az functionapp keys list -n $FunctionAppName -g $ResourceGroup --query "functionKeys.default" -o tsv
if (-not $fnKey) {
    Write-Error "Impossible de récupérer la clé de la Function App. Vérifiez le nom et le resource group."; exit 1
}

Write-Host "Copie du fichier source vers le fichier de déploiement..." -ForegroundColor Cyan
Copy-Item -Path $SourcePath -Destination $TargetPath -Force

Write-Host "Injection de la clé dans le fichier de déploiement..." -ForegroundColor Cyan
(Get-Content -Path $TargetPath) -replace "REMPLACER_PAR_VOTRE_CLE_AZURE", $fnKey | Set-Content -Path $TargetPath

Write-Host "Terminé. Fichier prêt: $TargetPath" -ForegroundColor Green
