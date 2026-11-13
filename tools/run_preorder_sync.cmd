@echo off
REM Vorbestell-Abgleich Shopify -> Merchant Center (SFTP). Windows-Aufgabe "biberna MC Vorbestellung", taeglich 08:30, holt verpasste Laeufe nach (eingerichtet 13.11.2026)
cd /d "%~dp0.."
set PYTHONIOENCODING=utf-8
"C:\Users\mschmaenk\AppData\Local\Programs\Python\Python312\python.exe" tools\mc_preorder_sync.py
