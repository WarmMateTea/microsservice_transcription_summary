import {config} from "dotenv";
config();
import express from "express";
import multer from "multer";
import path from "path";
import cors from 'cors';
import { Transcription } from './transcription.js';
import { fileURLToPath } from 'url';
import { Completion } from './completion.js';
import logger from "node-color-log";
import * as fs from 'fs';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(cors());

const port = process.env.TOKEN_SERVER_PORT;

app.listen(port, () => {
    logger.info(`API server running on ${port}...`);
    
    var dir = './uploads';
    if (!fs.existsSync(dir)){
        logger.warn("Uploads folder not found, creating...");
        logger.info("Creating uploads folder...");
        fs.mkdirSync(dir);
    }
});

/**
 * Função p/ o multer salvar no armazenamento local temporariamente
 */ 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({storage: storage});

/**
 *  Função p/ verificar a chave de API (estática no momento, definida no .env) 
 */
var checkApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (apiKey !== process.env.API_KEY) {
        logger.error(`Invalid API Key`);
        return res.status(401).json({ message: "Invalid API Key"})
    }

    next();
};

/**
 * Todas as rotas precisam do header com a chave de API em x-api-key
 */ 
app.all('/api/*', checkApiKey);


// caminho pra receber o arquivo de áudio + chave
app.post('/api/upload', upload.single('file'), (req, res) => {
    logger.info("New Request at ", Date.now());

    logger.debug("Uploaded file: ", req.file);

    const uploadedFile = req.file;
    const filePath = path.join(__dirname, uploadedFile.path);
    logger.debug("File path to transcribe: ", filePath);

    if (!uploadedFile) {
        logger.error("No file uploaded");
        return res.status(400).json({message: 'No file uploaded'});
    }

    Transcription(filePath)
        .then((result) => {
            logger.success("Transcription success!");
            logger.debug("Transcrição:");
            logger.debug("'" + result + "'");

            Completion(result).then((result) => {
                logger.success("Summarization success!");
                logger.debug("Sumário gerado:");
                logger.debug("'" + result + "'");
                return res.status(200).json({result});

            }).catch((err) => {
                logger.error("Error during completion: ", err);
                return res.status(500).json({message: 'Error during completion'});
                
            });
        }).catch((err) => {
            logger.error("Error during transcription: ", err);
            return res.status(500).json({message: 'Error during transcription'});

        });
})