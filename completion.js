import OpenAi from "openai";
import {config} from "dotenv";
config();
const openai = new OpenAi();
import {sist_sumario} from "./sys-prompts.js";

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

        console.log(completion.choices[0].message.content);
        return completion.choices[0].message.content;

    } catch (err) {
        console.log(err);
        throw(err);
    }
}

export { Completion }