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
// clearDownloadsFolder();

// Configurar livereload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

app.use(connectLivereload());

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

function sanitizeFileName(fileName) {
    return fileName.replace(/[<>:"/\\|?*\x00-\x1F]/g, ''); // Remove caracteres inválidos
}

let clients = [];

function fileExistsWithoutExtension(filePath) {
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath);

    const files = fs.readdirSync(dir);
    return files.some(file => file.startsWith(baseName));
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

            // Verificar se o arquivo já existe (ignorando a extensão)
            if (fileExistsWithoutExtension(outputFilePath)) {
                clients.forEach(client => client.res.write(`data: ${JSON.stringify({ progress: 100 })}\n\n`));
                resolve(cleanFileName);
                return;
            }

            const downloadCommand = `yt-dlp -f "${format}" -o "${outputFilePath}" "${url}"`;
            const downloadProcess = exec(downloadCommand);

            downloadProcess.stdout.on('data', (data) => {
                const progressMatch = data.match(/(\d+(\.\d+)?%)/);
                if (progressMatch) {
                    const progress = parseFloat(progressMatch[1]);
                    clients.forEach(client => client.res.write(`data: ${JSON.stringify({ progress })}\n\n`));
                }
            });

            downloadProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(cleanFileName);
                } else {
                    reject(new Error('Download failed'));
                }
            });
        });
    });
}

app.post('/download', async (req, res) => {
    const { url, quality, mediaType } = req.body;

    try {
        const outputFileName = await downloadMedia(url, quality, mediaType);
        res.json({ message: `Download do ${mediaType} "${outputFileName}" concluído com sucesso! Ele está salvo na pasta downloads do projeto` });
    } catch (error) {
        console.error(`Erro: ${error}`);
        res.status(500).json({ error: `Falha ao baixar o ${mediaType}. "${url}". Verifique a URL e a qualidade.` });
    }
});

app.get('/progress', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now();
    clients.push({ id: clientId, res });

    req.on('close', () => {
        clients = clients.filter(client => client.id !== clientId);
    });
});

app.listen(PORT, () => {
    console.log(`Acesse a url http://localhost:${PORT} no seu navegador.`);
});

// Notificar livereload sobre mudanças
liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});