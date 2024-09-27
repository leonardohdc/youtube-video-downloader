@echo off
:: Obtém o diretório onde o script está localizado
set SCRIPT_DIR=%~dp0

:: Navega até o diretório do projeto
cd /d "%SCRIPT_DIR%"

:: Abre uma nova janela do terminal e executa npm install
start cmd /c "cd /d %SCRIPT_DIR% && echo Instalando dependências... && npm install"

:: Fecha a janela do terminal após a conclusão
exit