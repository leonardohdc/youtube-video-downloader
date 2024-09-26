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

document.getElementById('downloadForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const url = urlInput.value;
    const quality = qualitySelect.value;
    const mediaType = mediaTypeSelect.value; // Obter o tipo de mídia

    downloadButton.innerText = 'Baixando...';
    downloadButton.disabled = true;

    fetch('/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, quality, mediaType }), // Enviar o tipo de mídia
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                notification.innerText = 'Erro ao fazer download';
                notification.classList.add('error');
                showNotification();
            } else {
                notification.innerText = data.message;
                notification.classList.remove('error');
                showNotification();
            }
        })
        .catch(error => {
            notification.innerText = 'Erro ao fazer download';
            notification.classList.add('error');
            showNotification();
            console.error(`Erro: ${error.message}`);
        })
        .finally(() => {
            downloadButton.innerText = 'Baixar';
            downloadButton.disabled = false;
        });
});

function showNotification() {
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

document.getElementById('clearButton').addEventListener('click', function () {
    urlInput.value = '';
    mediaTypeSelect.value = 'video'; // Resetar tipo de mídia
    qualitySelect.value = 'best'; // Resetar qualidade
    downloadButton.disabled = true;
});