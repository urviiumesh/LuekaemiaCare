# PowerShell script to test get appointments endpoint
$url = "http://localhost:5000/get-appointments"

try {
    # Send GET request
    $response = Invoke-RestMethod -Uri $url -Method Get
    
    # Output response in formatted JSON
    Write-Host "Appointments retrieved:"
    $response | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}