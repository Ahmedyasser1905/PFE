@echo off
echo Checking for changes...
cd "C:\Users\User\.gemini\antigravity\scratch\PFE_MapNote_New"
powershell -ExecutionPolicy Bypass -File "./sync.ps1"
pause
