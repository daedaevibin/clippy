import type { DownloadState } from "./sharedState";

export interface Model {
  name: string;
  size: number;
  company?: string;
  url?: string;
  description?: string;
  homepage?: string;
}

export interface ManagedModel extends Model {
  path: string;
  downloaded?: boolean;
  downloadState?: DownloadState;
  imported?: boolean;
}

export type ModelState = Record<string, ManagedModel>;

export const BUILT_IN_MODELS: Model[] = [
  {
    name: "Gemma 3 (1B)",
    company: "Google",
    size: 806,
    url: "https://huggingface.co/unsloth/gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q4_K_M.gguf",
    description:
      "Gemma 3, Google's new state-of-the-art models come in 1B, 4B, 12B, and 27B sizes. Gemma 3 has a 128K context window, and multilingual support.",
  },
  {
    name: "Gemma 3 (4B)",
    company: "Google",
    size: 2490,
    url: "https://huggingface.co/unsloth/gemma-3-4b-it-GGUF/resolve/main/gemma-3-4b-it-Q3_K_M.gguf",
    description:
      "Gemma 3, Google's new state-of-the-art models come in 1B, 4B, 12B, and 27B sizes. Gemma 3 has a 128K context window, and multilingual support.",
  },
  {
    name: "Gemma 3 (12B)",
    company: "Google",
    size: 5600,
    url: "https://huggingface.co/unsloth/gemma-3-12b-it-GGUF/resolve/main/gemma-3-12b-it-Q3_K_M.gguf",
    description:
      "Gemma 3,Google's new state-of-the-art models come in 1B,4B,12B,and 27B sizes. Gemma 3 has a 128K context window,and multilingual support.",
  },
  {
    name: "Gemma 3 (27B)",
    company: "Google",
    size: 12500,
    url: "https://huggingface.co/unsloth/gemma-3-27b-it-GGUF/resolve/main/gemma-3-27b-it-Q3_K_M.gguf",
    description:
      "Gemma 3,Google's new state-of-the-art models come in 1B,4B,12B,and 27B sizes. Gemma 3 has a 128K context window, and multilingual support.",
  },
  {
    name: "Qwen3 (4B)",
    company: "Qwen",
    size: 2500,
    url: "https://huggingface.co/unsloth/Qwen3-4B-GGUF/resolve/main/Qwen3-4B-Q4_K_M.gguf",
    description:
      "Qwen3 is the latest generation of large language models in Qwen series, offering a comprehensive suite of dense and mixture-of-experts (MoE) models. Built upon extensive training, Qwen3 delivers groundbreaking advancements in reasoning, instruction-following, agent capabilities, and multilingual support.",
    homepage: "https://qwenlm.github.io/blog/qwen3/",
  },
  {
    name: "Llama 3.2 (1B Instruct)",
    company: "Meta",
    size: 808,
    url: "https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf",
    description:
      "The Llama 3.2 collection of multilingual large language models (LLMs) is a collection of pretrained and instruction-tuned generative models in 1B and 3B sizes (text in/text out).",
    homepage:
      "https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/",
  },
  {
    name: "Llama 3.2 (3B Instruct)",
    company: "Meta",
    size: 2020,
    url: "https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf",
    description:
      "The Llama 3.2 collection of multilingual large language models (LLMs) is a collection of pretrained and instruction-tuned generative models in 1B and 3B sizes (text in/text out).",
    homepage:
      "https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/",
  },
  {
    name: "Gemini 2.5 Flash",
    company: "Google",
    size: 0,
    description: "Gemini 2.5 Flash placeholder for future Google models.",
    homepage: "https://deepmind.google/technologies/gemini/flash/",
  },
  {
    name: "Gemini 3.0 Flash Preview",
    company: "Google",
    size: 0,
    description: "Gemini 3.0 Flash placeholder for future Google models.",
    homepage: "https://deepmind.google/technologies/gemini/flash/",
  },
  {
    name: "Gemini 3.1 Flash Preview",
    company: "Google",
    size: 0,
    description: "Gemini 3.1 Flash placeholder for future Google models.",
    homepage: "https://deepmind.google/technologies/gemini/flash/",
  },
];
