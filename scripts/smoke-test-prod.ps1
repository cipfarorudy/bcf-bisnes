param(
  [string]$BaseUrl = "https://bcf-stripe-prod.azurewebsites.net/api",
  [string]$Email = "smoke.prod+$(Get-Date -Format yyyyMMddHHmmss)@example.com",
  [string]$Plan = "PREMIUM"
)

Write-Host "[Prod Smoke] BaseUrl = $BaseUrl" -ForegroundColor Cyan

function Invoke-Json($Method, $Url, $Body) {
  try {
    if ($Body) {
      $json = $Body | ConvertTo-Json -Depth 5
      return Invoke-RestMethod -Method $Method -Uri $Url -ContentType 'application/json' -Body $json -TimeoutSec 30
    } else {
      return Invoke-RestMethod -Method $Method -Uri $Url -TimeoutSec 30
    }
  } catch {
    Write-Warning "Request failed: $($_.Exception.Message)"
    throw
  }
}

# 1) Récupérer la fonction key via getApiKey (contrôle d'origine en place)
$resp = Invoke-Json GET "$BaseUrl/config/apikey" $null
if (-not $resp -or -not $resp.apiKey) {
  throw "getApiKey n'a pas retourné de clé. Vérifiez ALLOWED_ORIGINS et FUNCTION_KEY."
}
$ApiKey = $resp.apiKey
Write-Host "✓ getApiKey OK (clé chargée)" -ForegroundColor Green

# 2) Créer une session de checkout
$createUrl = "$BaseUrl/stripe/createcheckoutsession?code=$ApiKey"
$payload = @{ email = $Email; companyName = "Smoke Test Prod"; plan = $Plan }
$resp2 = Invoke-Json POST $createUrl $payload
Write-Host "✓ createCheckoutSession OK" -ForegroundColor Green
$resp2 | ConvertTo-Json -Depth 5

Write-Host "Smoke test prod terminé." -ForegroundColor Cyan
