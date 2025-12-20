param(
  [string]$BaseUrl = "http://localhost:7071/api",
  [string]$Email = "smoke.local+$(Get-Date -Format yyyyMMddHHmmss)@example.com",
  [string]$Plan = "STARTER"
)

Write-Host "[Local Smoke] BaseUrl = $BaseUrl" -ForegroundColor Cyan

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

# 1) Récupérer la clé (si disponible)
$ApiKey = ""
try {
  $resp = Invoke-Json GET "$BaseUrl/config/apikey" $null
  if ($resp -and $resp.apiKey) {
    $ApiKey = $resp.apiKey
    Write-Host "✓ getApiKey OK (clé chargée)" -ForegroundColor Green
  } else {
    Write-Host "⚠ getApiKey: pas de clé retournée (toléré en local)" -ForegroundColor Yellow
  }
} catch {
  Write-Host "⚠ getApiKey indisponible (toléré en local): $($_.Exception.Message)" -ForegroundColor Yellow
}

# 2) Tester createCheckoutSession
$createUrl = if ([string]::IsNullOrEmpty($ApiKey)) { "$BaseUrl/stripe/createcheckoutsession" } else { "$BaseUrl/stripe/createcheckoutsession?code=$ApiKey" }

$payload = @{ email = $Email; companyName = "Smoke Test Local"; plan = $Plan }
try {
  $resp2 = Invoke-Json POST $createUrl $payload
  Write-Host "✓ createCheckoutSession OK" -ForegroundColor Green
  $resp2 | ConvertTo-Json -Depth 5
} catch {
  Write-Error "createCheckoutSession KO: $($_.Exception.Message)"
  exit 1
}

Write-Host "Smoke test local terminé." -ForegroundColor Cyan
