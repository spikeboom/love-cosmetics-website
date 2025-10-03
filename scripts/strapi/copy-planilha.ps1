# Script PowerShell para copiar a planilha

$sourceDir = "C:\Users\Administrator\Documents\"
$destPath = "C:\Users\Administrator\Documents\Love Drive\NextLove\love-cosmetics-website\scripts\strapi\planilha-produtos.xlsx"

# Busca arquivos com PLANILHA no nome
$files = Get-ChildItem -Path $sourceDir -Filter "*PLANILHA*"

if ($files.Count -gt 0) {
    $file = $files[0]
    Write-Host "Arquivo encontrado: $($file.Name)"
    Copy-Item -Path $file.FullName -Destination $destPath -Force
    Write-Host "Arquivo copiado para: $destPath"
} else {
    Write-Host "Nenhum arquivo encontrado"
}
