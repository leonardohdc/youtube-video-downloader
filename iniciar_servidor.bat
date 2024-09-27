@echo off
:: Obtém o diretório onde o script está localizado
set SCRIPT_DIR=%~dp0

:: Navega até o diretório do projeto
cd /d "%SCRIPT_DIR%"

:: Abre o navegador na URL http://localhost:3000
echo Abrindo o navegador em http://localhost:3000...
start http://localhost:3000

:: Mantém o terminal aberto

:: Inicia o servidor
echo Iniciando o servidor...
call npm start
if %errorlevel% neq 0 (
    echo Erro ao iniciar o servidor.
    pause
    exit /b %errorlevel%
)
pause