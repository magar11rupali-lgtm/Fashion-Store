# Login as admin
$loginBody = @{
    email = "admin@example.com"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:1337/admin/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "✓ Admin logged in successfully" -ForegroundColor Green
    Write-Host ""

    # Fetch wishlists from Content Manager
    Write-Host "Fetching wishlists from Content Manager..."
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $wishlistResponse = Invoke-RestMethod -Uri "http://localhost:1337/content-manager/collection-types/api::wishlist.wishlist?page=1`&pageSize=100" -Method GET -Headers $headers
    
    $count = $wishlistResponse.results.Count
    Write-Host "✓ Found $count wishlist entries" -ForegroundColor Green
    
    if ($count -gt 0) {
        Write-Host ""
        Write-Host "Wishlist entries:" -ForegroundColor Cyan
        foreach ($item in $wishlistResponse.results) {
            Write-Host "  - ID: $($item.id), User: $($item.user.username), Product: $($item.product.name)"
        }
    } else {
        Write-Host "⚠ No wishlist entries found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
