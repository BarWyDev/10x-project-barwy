# Manual Test Script for POST /api/flashcards/generate
# PowerShell script to test the endpoint

# Load test credentials
$creds = Get-Content test-credentials.json | ConvertFrom-Json
$API_BASE = "http://localhost:3000"
$AUTH_HEADER = "Bearer $($creds.accessToken)"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "🧪 MANUAL API TESTS: POST /api/flashcards/generate" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

$passedTests = 0
$failedTests = 0

function Test-Endpoint {
    param(
        [string]$TestName,
        [string]$Deck_Id,
        [string]$Text,
        [string]$Authorization = $AUTH_HEADER,
        [int]$ExpectedStatus,
        [string]$ExpectedError = $null
    )
    
    Write-Host "`n🧪 $TestName" -ForegroundColor Yellow
    Write-Host ("─" * 60)
    
    try {
        $body = @{
            deck_id = $Deck_Id
            text = $Text
        } | ConvertTo-Json
        
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Authorization) {
            $headers["Authorization"] = $Authorization
        }
        
        $response = Invoke-WebRequest -Uri "$API_BASE/api/flashcards/generate" `
            -Method POST `
            -Headers $headers `
            -Body $body `
            -ErrorAction SilentlyContinue `
            -StatusCodeVariable statusCode
            
        $data = $response.Content | ConvertFrom-Json
        $actualStatus = $response.StatusCode
        
        if ($actualStatus -eq $ExpectedStatus) {
            Write-Host "✅ PASS: Status $actualStatus (expected $ExpectedStatus)" -ForegroundColor Green
            
            if ($ExpectedStatus -eq 200) {
                Write-Host "   Generated $($data.proposals.Count) proposals" -ForegroundColor Gray
                Write-Host "   Usage: $($data.usage.total_generated_today)/$($data.usage.daily_limit)" -ForegroundColor Gray
            } elseif ($ExpectedError) {
                Write-Host "   Error Code: $($data.error.code)" -ForegroundColor Gray
                Write-Host "   Message: $($data.error.message)" -ForegroundColor Gray
            }
            
            $script:passedTests++
        } else {
            Write-Host "❌ FAIL: Expected $ExpectedStatus, got $actualStatus" -ForegroundColor Red
            Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
            $script:failedTests++
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq $ExpectedStatus) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $responseBody = $reader.ReadToEnd()
            $data = $responseBody | ConvertFrom-Json
            
            Write-Host "✅ PASS: Status $statusCode (expected $ExpectedStatus)" -ForegroundColor Green
            
            if ($ExpectedError) {
                Write-Host "   Error Code: $($data.error.code)" -ForegroundColor Gray
                Write-Host "   Message: $($data.error.message)" -ForegroundColor Gray
            }
            
            $script:passedTests++
        } else {
            Write-Host "❌ FAIL: Expected $ExpectedStatus, got $statusCode" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
            $script:failedTests++
        }
    }
}

# TEST 1: Successful Generation
Test-Endpoint -TestName "Test 1: Successful Generation" `
    -Deck_Id $creds.deckId `
    -Text "Mitochondria are membrane-bound organelles found in the cytoplasm of all eukaryotic cells. They are responsible for producing adenosine triphosphate (ATP), the main energy currency of the cell." `
    -ExpectedStatus 200

# TEST 2: Validation Error - Text Too Short
Test-Endpoint -TestName "Test 2: Validation Error - Text Too Short" `
    -Deck_Id $creds.deckId `
    -Text "Short" `
    -ExpectedStatus 400 `
    -ExpectedError "VALIDATION_ERROR"

# TEST 3: Validation Error - Invalid UUID
Test-Endpoint -TestName "Test 3: Validation Error - Invalid UUID" `
    -Deck_Id "not-a-uuid" `
    -Text "This is a text with more than fifty characters for testing purposes only." `
    -ExpectedStatus 400 `
    -ExpectedError "VALIDATION_ERROR"

# TEST 4: Unauthorized - Missing Token
Test-Endpoint -TestName "Test 4: Unauthorized - Missing Token" `
    -Deck_Id $creds.deckId `
    -Text "This is a text with more than fifty characters for testing purposes only." `
    -Authorization $null `
    -ExpectedStatus 401 `
    -ExpectedError "UNAUTHORIZED"

# TEST 5: Unauthorized - Invalid Token
Test-Endpoint -TestName "Test 5: Unauthorized - Invalid Token" `
    -Deck_Id $creds.deckId `
    -Text "This is a text with more than fifty characters for testing purposes only." `
    -Authorization "Bearer invalid-token-12345" `
    -ExpectedStatus 401 `
    -ExpectedError "UNAUTHORIZED"

# TEST 6: Not Found - Deck Doesn't Exist
Test-Endpoint -TestName "Test 6: Not Found - Deck Doesn't Exist" `
    -Deck_Id "00000000-0000-0000-0000-000000000000" `
    -Text "This is a text with more than fifty characters for testing purposes only." `
    -ExpectedStatus 404 `
    -ExpectedError "NOT_FOUND"

# SUMMARY
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Total Tests:  $($passedTests + $failedTests)"
Write-Host "✅ Passed:     $passedTests" -ForegroundColor Green
Write-Host "❌ Failed:     $failedTests" -ForegroundColor Red
$successRate = if (($passedTests + $failedTests) -gt 0) { ($passedTests / ($passedTests + $failedTests)) * 100 } else { 0 }
Write-Host "Success Rate: $([math]::Round($successRate, 1))%"
Write-Host "============================================================`n" -ForegroundColor Cyan

if ($failedTests -gt 0) {
    exit 1
} else {
    exit 0
}

