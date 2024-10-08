# Baixar Vídeos do Youtube
- Os videos que você baixar ficaram salvos na pasta downloads do projeto

## Pré-requisitos

- Node.js (https://nodejs.org/en/download/prebuilt-installer)
- FFmpeg (https://github.com/BtbN/FFmpeg-Builds/releases)
- Python e Pip (https://www.python.org/downloads/windows/)

## Como executar

1. **Instale o Node.js**:
   - Acesse [https://nodejs.org/en/download/prebuilt-installer](https://nodejs.org/en/download/prebuilt-installer) e baixe a versão LTS recomendada (A versão default que já vai estar selecionada).
   - Siga as instruções desse video https://youtu.be/4FAtFwKVhn0?t=134

2. **Instale o FFmpeg**:
   - Acesse [https://github.com/BtbN/FFmpeg-Builds/releases](https://github.com/BtbN/FFmpeg-Builds/releases) e baixe a versão "ffmpeg-master-latest-win64-gpl.zip".
   - Siga as instruções desse video https://youtu.be/JR36oH35Fgg?t=47

3. **Instale o python**:
   - Acesse [https://www.python.org/downloads/windows/](https://www.python.org/downloads/windows/) e baixe a versão "Download Windows Installer" da Stable Releases.
   - No instalador certifique-se de marcar a opção "Add Python to PATH" para que o Python e o pip sejam adicionados ao PATH do sistema

4. **Baixe o projeto do GitHub**:
   - Clique no botão verde "<> Code" e clique em Download ZIP, extraia-o aonde quiser.

5. **Execute o script batch**:
   - Navegue até a pasta do projeto.

   OBS: Talvez o Windows não deixe você realizar os proximos 2 passos, pq ele tenta rodar um script de bash, se
   aparecer a tela do Windows Defender, clique em "Executar assim mesmo" ou "Run Anyway".

   - Clique duas vezes no arquivo `instalar_dependencias.bat`.
   - Clique duas vezes no arquivo `iniciar_servidor.bat`.
   - O servidor será iniciado e o navegador abrirá automaticamente na URL `http://localhost:3000`
   caso não abra a guia do navegador sozinho, acesse a url manualmente `http://localhost:3000`

   (Caso não tenha conseguido abrir os Scripts - Siga os passos abaixo)
   - Abra um Prompt de comando do Windows e navegue até o projeto
   - escreva o comando: npm install
   - aguarde ele instalar as dependencias
   - escreva o comando: pip install yt-dlp
   - aguarde ele instalar o yt-dlp
   - escreva o comando npm start
   - acesse em seu navegador a url http://localhost:3000

6. **Final**:
   - Depois de instalar as dependências, não é mais necessário abrir o script "instalar_dependencias.bat" para utilizar o programa, apenas o "iniciar_servidor.bat" ou então o comando "npm start" no prompt de comando no diretorio do projeto.