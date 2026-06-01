export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMProviderConfig {
  provider: "anthropic" | "openrouter" | "google" | "ollama" | "lmstudio";
  model: string;
  ollamaUrl?: string;
  lmstudioUrl?: string;
}

export interface LLMProvider {
  chat(messages: Message[]): Promise<string>;
  stream(messages: Message[]): AsyncGenerator<string, void, unknown>;
}
