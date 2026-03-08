@echo off
echo Checking for changes...
cd "C:\Users\User\Desktop\Application mobile projet\MapNote\PFE_MapNote"
powershell -ExecutionPolicy Bypass -File "./sync.ps1"
pause
