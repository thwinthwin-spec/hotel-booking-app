# Packages the completed hotel-booking-app into a clean zip.
# Run from anywhere: powershell -File .\make-zip.ps1
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$src  = "C:\Users\USER\OneDrive\Documents\Default Project\hotel-booking-app"
$stage = "C:\Users\USER\AppData\Local\Temp\opencode\hotel-booking-stage"
$zip  = "C:\Users\USER\Documents\Codex\2026-11-21\can-you-give-me-to-write\outputs\hotel-booking-app.zip"

if (Test-Path $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage -Force | Out-Null

Get-ChildItem -LiteralPath $src -Recurse -File -Force | Where-Object {
  $_.FullName -notmatch '\\node_modules\\' -and
  $_.FullName -notmatch '\\.expo\\' -and
  $_.Name -ne '.env' -and
  $_.Extension -ne '.zip' -and
  $_.Name -ne '.DS_Store' -and
  $_.Extension -ne '.log'
} | ForEach-Object {
  $relative = $_.FullName.Substring($src.Length + 1)
  $destination = Join-Path $stage $relative
  $parent = Split-Path $destination -Parent
  if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
  Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
}

if (Test-Path $zip) { Remove-Item -LiteralPath $zip -Force }
$stream = [System.IO.File]::Open($zip, [System.IO.FileMode]::Create)
$archive = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Create, $false)

Get-ChildItem -LiteralPath $stage -Recurse -File | ForEach-Object {
  $relative = $_.FullName.Substring($stage.Length + 1).Replace('\', '/')
  $entry = $archive.CreateEntry($relative, [System.IO.Compression.CompressionLevel]::Optimal)
  $entryStream = $entry.Open()
  $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
  $entryStream.Write($bytes, 0, $bytes.Length)
  $entryStream.Dispose()
}

$archive.Dispose()
$stream.Dispose()
Remove-Item -LiteralPath $stage -Recurse -Force

$item = Get-Item $zip
Write-Output "Created: $($item.FullName)"
Write-Output "Size: $([math]::Round($item.Length / 1MB, 2)) MB"
Write-Output "Entries: $(( [System.IO.Compression.ZipFile]::OpenRead($zip).Entries.Count ))"
