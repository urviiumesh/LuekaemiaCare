# PowerShell script to test submit appointment endpoint
$url = "http://localhost:5000/submit-appointment"

# Create JSON body with required fields
$body = @{
    id = "12345"
    patientName = "John Doe"
    date = "2024-05-20"
    time = "10:00 AM"
    type = "Follow-up"
} | ConvertTo-Json -Compress

try {
    # Send POST request with proper headers
    $headers = @{
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -Headers $headers
    
    # Output response
    Write-Host "Response from server:"
    $response | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}