const downloadButton = document.getElementById('downloadButton');
const urlInput = document.getElementById('url');
const notification = document.getElementById('notification');
const mediaTypeSelect = document.getElementById('mediaType');
const qualitySelect = document.getElementById('quality');

urlInput.addEventListener('input', function () {
    downloadButton.disabled = !urlInput.value.trim();
});

mediaTypeSelect.addEventListener('change', function () {
    const mediaType = this.value;

    // Atualizar as opções de qualidade com base no tipo de mídia selecionado
    if (mediaType === 'video') {
        qualitySelect.innerHTML = `
            <option value="best">A melhor possível</option>
            <option value="2160">2160p (4K)</option>
            <option value="1440">1440p (2K)</option>
            <option value="1080">1080p (Full HD)</option>
            <option value="720">720p (HD)</option>
            <option value="480">480p (SD)</option>
            <option value="360">360p</option>
            <option value="240">240p</option>
            <option value="144">144p</option>
        `;
    } else {
        qualitySelect.innerHTML = `
            <option value="best">A melhor possível</option>
        `;
    }

    qualitySelect.value = 'best'; // Resetar para a opção padrão
});

document.getElementById('downloadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const url = document.getElementById('url').value;
    const quality = document.getElementById('quality').value;
    const mediaType = document.getElementById('mediaType').value;
    const downloadButton = document.getElementById('downloadButton');

    // Desabilitar o botão e mudar o texto para "Aguarde... Seu download começará em breve"
    downloadButton.disabled = true;
    downloadButton.textContent = 'Aguarde... Seu download começará em breve';

    // Configurar o EventSource antes do fetch
    const eventSource = new EventSource('/progress');
    eventSource.onmessage = function (event) {
        const progressData = JSON.parse(event.data);
        const progressBar = document.getElementById('progressBar');
        const progressContainer = document.getElementById('progressContainer');
        const progressText = document.getElementById('progressText');

        progressContainer.style.display = 'block';
        progressBar.style.width = progressData.progress + '%';
        progressText.textContent = `Baixando... ${progressData.progress}%`;

        if (progressData.progress === 100) {
            eventSource.close();
            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
                progressText.textContent = 'Baixando... 0%';

                // Reabilitar o botão e mudar o texto de volta para "Baixar"
                downloadButton.disabled = false;
                downloadButton.textContent = 'Baixar';
            }, 3000); // Esconde a barra de progresso após 3 segundos
        }
    };

    eventSource.onerror = function (error) {
        eventSource.close();
        showNotification('Erro ao baixar o vídeo.');
        downloadButton.disabled = false;
        downloadButton.textContent = 'Baixar';
    };

    fetch('/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, quality, mediaType })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            showNotification(data.message); // Usar a mensagem do endpoint
        })
        .catch(error => {
            console.error('Erro:', error);
            showNotification(error.message || 'Erro ao iniciar o download.', true);
            downloadButton.disabled = false;
            downloadButton.textContent = 'Baixar';
        });
});

function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    if (isError) {
        notification.classList.add('error');
    } else {
        notification.classList.remove('error');
    }
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.remove('error');
    }, 3000);
}

document.getElementById('clearButton').addEventListener('click', function () {
    urlInput.value = '';
    mediaTypeSelect.value = 'video'; // Resetar tipo de mídia
    qualitySelect.value = 'best'; // Resetar qualidade
    downloadButton.disabled = true;
});