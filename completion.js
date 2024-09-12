import OpenAi from "openai";
import {config} from "dotenv";
config();
const openai = new OpenAi();
import {sist_sumario} from "./sys-prompts.js";
import logger from "node-color-log";

async function Completion(text) {
    try {

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                sist_sumario,
                {
                    role: "user",
                    content: text,
                }
            ]
        });

        //console.log(completion.choices[0].message.content);
        return completion.choices[0].message.content;

    } catch (err) {
        //console.log(err);
        logger.error(err);
        throw(err);
    }
}

export { Completion }