# Git Sync Script for PFE_MapNote
# This script stages all changes, commits them with a timestamp, and pushes to GitHub.

Write-Host "Checking for changes..." -ForegroundColor Cyan

# Check if there are any changes
$changes = git status --porcelain
if ($null -eq $changes) {
    Write-Host "No changes to sync." -ForegroundColor Yellow
    exit
}

Write-Host "Staging changes..." -ForegroundColor Cyan
git add .

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$message = "Auto-sync at $timestamp"

Write-Host "Committing with message: '$message'..." -ForegroundColor Cyan
git commit -m "$message"

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push origin head

Write-Host "Success! Your changes are now on GitHub." -ForegroundColor Green
