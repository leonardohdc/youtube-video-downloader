const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const fs = require('fs');

const app = express();
const PORT = 3000;

const downloadsDir = path.join(__dirname, 'downloads');

function clearDownloadsFolder() {
    fs.readdir(downloadsDir, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(downloadsDir, file), err => {
                if (err) throw err;
            });
        }
    });
}

// Limpar a pasta downloads no início do servidor
clearDownloadsFolder();

// Configurar livereload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

app.use(connectLivereload());

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

function sanitizeFileName(fileName) {
    return fileName.replace(/[<>:"/\\|?*\x00-\x1F]/g, ''); // Remove caracteres inválidos
}

function downloadMedia(url, quality, mediaType) {
    return new Promise((resolve, reject) => {
        let format;

        if (mediaType === 'video') {
            format = quality === 'best' ? 'bestvideo+bestaudio' : `bestvideo[height<=${quality}]+bestaudio`;
        } else if (mediaType === 'audio') {
            format = quality === 'best' ? 'bestaudio' : `bestaudio[abr<=${quality}]`;
        }

        const getInfoCommand = `yt-dlp --get-title --get-format -f "${format}" "${url}"`;

        exec(getInfoCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro ao obter o título e formato: ${error.message}`);
                reject(error.message);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(stderr);
                return;
            }

            const [mediaTitle, mediaFormat] = stdout.trim().split('\n');
            const matchQuality = mediaFormat.match(/\d{3,4}p|\d+kbps/);
            const finalQuality = matchQuality ? matchQuality[0] : 'best';

            let cleanFileName = mediaType === 'video'
                ? `${mediaTitle} - ${finalQuality}`
                : `${mediaTitle}.mp3`;

            cleanFileName = sanitizeFileName(cleanFileName); // Sanitiza o nome do arquivo
            const outputFilePath = path.join(__dirname, 'downloads', cleanFileName);

            const downloadCommand = `yt-dlp -f "${format}" -o "${outputFilePath}" "${url}"`;
            exec(downloadCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erro ao baixar o ${mediaType}: ${error.message}`);
                    reject(cleanFileName);
                    return;
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    reject(cleanFileName);
                    return;
                }
                console.log(`Baixado: ${stdout}`);
                resolve(cleanFileName);
            });
        });
    });
}

app.post('/download', async (req, res) => {
    const { url, quality, mediaType } = req.body;

    try {
        const outputFileName = await downloadMedia(url, quality, mediaType);
        res.json({ message: `Download do ${mediaType} "${outputFileName}" concluído com sucesso!` });
    } catch (error) {
        console.error(`Erro: ${error}`);
        res.status(500).json({ error: `Falha ao baixar o ${mediaType}. "${url}". Verifique a URL e a qualidade.` });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Notificar livereload sobre mudanças
liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});
