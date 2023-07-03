const { Configuration, OpenAIApi } = require("openai");
import type { NextApiRequest, NextApiResponse } from "next";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
  basePath: "https://api.openai.com/v1",
});

const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.query;

  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  res.status(200).json({
    "answer": chatCompletion.data.choices[0].message['content']
  });
}
