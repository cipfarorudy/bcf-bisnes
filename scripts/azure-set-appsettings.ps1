param(
  [string]$SubscriptionId,
  [string]$ResourceGroup,
  [string]$FunctionAppName
)

function Require-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Error "Commande '$name' introuvable. Installez-la et réessayez." -ErrorAction Stop
  }
}

try {
  Require-Command az
} catch {
  Write-Host "Installez Azure CLI: https://aka.ms/install-azcli" -ForegroundColor Yellow
  throw
}

if (-not $SubscriptionId) { $SubscriptionId = Read-Host "AZURE_SUBSCRIPTION_ID" }
if (-not $ResourceGroup) { $ResourceGroup = Read-Host "Resource Group" }
if (-not $FunctionAppName) { $FunctionAppName = Read-Host "Function App name" }

$STRIPE_API_KEY           = Read-Host "STRIPE_API_KEY (sk_live_...)"
$STRIPE_PRICE_ID_STARTER  = Read-Host "STRIPE_PRICE_ID_STARTER"
$STRIPE_PRICE_ID_PRO      = Read-Host "STRIPE_PRICE_ID_PRO"
$STRIPE_PRICE_ID_PREMIUM  = Read-Host "STRIPE_PRICE_ID_PREMIUM"
$SUCCESS_URL              = Read-Host "SUCCESS_URL (ex: https://.../success.html)"
$CANCEL_URL               = Read-Host "CANCEL_URL (ex: https://.../cancel.html)"
$FUNCTION_KEY             = Read-Host "FUNCTION_KEY (clé de la function)"
$ALLOWED_ORIGINS          = Read-Host "ALLOWED_ORIGINS (ex: https://bcf-stripe-prod.azurewebsites.net)"

Write-Host "Connexion Azure..." -ForegroundColor Cyan
az account set --subscription $SubscriptionId

Write-Host "Injection des App Settings..." -ForegroundColor Cyan
az functionapp config appsettings set `
  --name $FunctionAppName `
  --resource-group $ResourceGroup `
  --settings `
  STRIPE_API_KEY=$STRIPE_API_KEY `
  STRIPE_PRICE_ID_STARTER=$STRIPE_PRICE_ID_STARTER `
  STRIPE_PRICE_ID_PRO=$STRIPE_PRICE_ID_PRO `
  STRIPE_PRICE_ID_PREMIUM=$STRIPE_PRICE_ID_PREMIUM `
  SUCCESS_URL=$SUCCESS_URL `
  CANCEL_URL=$CANCEL_URL `
  FUNCTION_KEY=$FUNCTION_KEY `
  ALLOWED_ORIGINS=$ALLOWED_ORIGINS | Out-Null

Write-Host "App Settings mis à jour avec succès." -ForegroundColor Green

Write-Host "Vérification..." -ForegroundColor Cyan
az functionapp config appsettings list --name $FunctionAppName --resource-group $ResourceGroup `
  --query "[?name=='STRIPE_PRICE_ID_PREMIUM' || name=='ALLOWED_ORIGINS' || name=='SUCCESS_URL']" -o table
