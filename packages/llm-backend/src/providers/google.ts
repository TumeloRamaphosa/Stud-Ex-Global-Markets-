import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LLMProvider, Message } from "./base.js";

export class GoogleProvider implements LLMProvider {
  private model: string;
  private client: GoogleGenerativeAI;

  constructor(model: string) {
    const key = process.env.GOOGLE_AI_API_KEY;
    if (!key) throw new Error("GOOGLE_AI_API_KEY environment variable is required");
    this.client = new GoogleGenerativeAI(key);
    this.model = model;
  }

  async chat(messages: Message[]): Promise<string> {
    const genModel = this.client.getGenerativeModel({ model: this.model });

    const systemMessage = messages.find((m) => m.role === "system");
    const history = messages
      .filter((m) => m.role !== "system")
      .slice(0, -1)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const lastMessage = messages.filter((m) => m.role !== "system").at(-1);
    if (!lastMessage) throw new Error("No user message provided");

    const chat = genModel.startChat({
      history,
      ...(systemMessage && {
        systemInstruction: { role: "system", parts: [{ text: systemMessage.content }] },
      }),
    });

    const result = await chat.sendMessage(lastMessage.content);
    return result.response.text();
  }

  async *stream(messages: Message[]): AsyncGenerator<string, void, unknown> {
    const genModel = this.client.getGenerativeModel({ model: this.model });

    const systemMessage = messages.find((m) => m.role === "system");
    const history = messages
      .filter((m) => m.role !== "system")
      .slice(0, -1)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const lastMessage = messages.filter((m) => m.role !== "system").at(-1);
    if (!lastMessage) throw new Error("No user message provided");

    const chat = genModel.startChat({
      history,
      ...(systemMessage && {
        systemInstruction: { role: "system", parts: [{ text: systemMessage.content }] },
      }),
    });

    const result = await chat.sendMessageStream(lastMessage.content);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  }
}
