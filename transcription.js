import fs from "fs";
import OpenAi from "openai";
import { config } from 'dotenv';
import logger from "node-color-log";
config()
const openai = new OpenAi();


async function Transcription(filePath) {
    try {
        const fileStream = fs.createReadStream(filePath);

        const transcription = await openai.audio.transcriptions.create({
            file: fileStream,
            model: 'whisper-1',
            language: 'pt',
        });

        return transcription.text;
    } catch (err) {
        logger.error("Error in transcription: ", err);
        throw(err);
    } finally {
       logger.warn("Trying to remove file ", filePath) 
        fs.unlink(filePath, (err) => {
            if (err) {
                logger.error(err);
            } else {
                logger.success(`File ${filePath} deleted successfully.`);
            }
        });
    }
}

export { Transcription }