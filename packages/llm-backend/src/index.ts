export type { Message, LLMProvider, LLMProviderConfig } from "./providers/base.js";

import type { LLMProvider, LLMProviderConfig, Message } from "./providers/base.js";
import { AnthropicProvider } from "./providers/anthropic.js";
import { OpenRouterProvider } from "./providers/openrouter.js";
import { GoogleProvider } from "./providers/google.js";
import { OllamaProvider, LMStudioProvider } from "./providers/ollama.js";

const DEFAULT_CONFIG: LLMProviderConfig = {
  provider: "anthropic",
  model: "claude-sonnet-4-20250514",
};

function createProvider(config: LLMProviderConfig): LLMProvider {
  switch (config.provider) {
    case "anthropic":
      return new AnthropicProvider(config.model);
    case "openrouter":
      return new OpenRouterProvider(config.model);
    case "google":
      return new GoogleProvider(config.model);
    case "ollama":
      return new OllamaProvider(config.model, config.ollamaUrl);
    case "lmstudio":
      return new LMStudioProvider(config.model, config.lmstudioUrl);
    default:
      throw new Error(`Unknown provider: ${(config as LLMProviderConfig).provider}`);
  }
}

export class LLMBackend {
  private config: LLMProviderConfig;
  private provider: LLMProvider;

  constructor(config?: Partial<LLMProviderConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.provider = createProvider(this.config);
  }

  /** Switch provider/model at runtime -- no restart needed. */
  setConfig(config: Partial<LLMProviderConfig>): void {
    this.config = { ...this.config, ...config };
    this.provider = createProvider(this.config);
  }

  getConfig(): Readonly<LLMProviderConfig> {
    return { ...this.config };
  }

  async chat(messages: Message[]): Promise<string> {
    return this.provider.chat(messages);
  }

  async *stream(messages: Message[]): AsyncGenerator<string, void, unknown> {
    yield* this.provider.stream(messages);
  }
}

export { AnthropicProvider } from "./providers/anthropic.js";
export { OpenRouterProvider } from "./providers/openrouter.js";
export { GoogleProvider } from "./providers/google.js";
export { OllamaProvider, LMStudioProvider } from "./providers/ollama.js";
