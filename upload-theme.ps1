$zipPath = $env:ZIP_PATH
if (-not $zipPath) { $zipPath = Join-Path $PSScriptRoot '..\my-salla-theme-v1.zip' }

if (-not (Test-Path $zipPath)) {
  Write-Error "ZIP not found: $zipPath"
  exit 1
}

$token = $env:SALLA_TOKEN
if (-not $token) {
  Write-Error "Set environment variable SALLA_TOKEN before running the script. Example: `$env:SALLA_TOKEN = 'your_token'`"
  exit 1
}

$headers = @{ Authorization = "Bearer $token" }
$url = 'https://api.salla.dev/v1/themes/upload'

try {
  Write-Output "Uploading $zipPath to $url ..."
  $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Form @{ file = Get-Item $zipPath }
  Write-Output "Response:"
  $response | ConvertTo-Json -Depth 5
} catch {
  Write-Error "Upload failed: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    try {
      $stream = $_.Exception.Response.GetResponseStream()
      $reader = New-Object System.IO.StreamReader($stream)
      $body = $reader.ReadToEnd()
      Write-Error "Response body: $body"
    } catch { }
  }
  exit 1
}