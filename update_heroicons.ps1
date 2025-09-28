# PowerShell script to update all Heroicons imports
Get-ChildItem -Path "client" -Recurse -Filter "*.js" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "@heroicons/react/24/outline") {
        $newContent = $content -replace "@heroicons/react/24/outline", "@heroicons/react/outline"
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "Updated: $($_.FullName)"
    }
}
Write-Host "All files updated!"


