# SoloBooks AI — Ollama & Local Model Setup

SoloBooks AI is built to give solo entrepreneurs complete financial privacy. We utilize local open-weight instruction models via Ollama.

---

## 1. Supported Open-Weight Models & Licenses

| Model Identifier | Parameter Count | Disk Size | Context Window | License Type | Recommended Hardware |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`qwen2.5:3b`** (Recommended) | 3.09B | ~1.9 GB | 32k | **Apache 2.0** (Permissive Open Source) | 8GB RAM, integrated GPU or CPU |
| **`llama3:latest`** | 8.03B | ~4.7 GB | 8k | **Meta Llama 3 Community License** (Open Weight) | 16GB RAM or 6GB+ VRAM |
| **`llama3.2:3b`** | 3.21B | ~2.0 GB | 128k | **Meta Llama 3.2 Community License** (Open Weight) | 8GB RAM |

> **Note on Terminology:**  
> - `qwen2.5:3b` is released under the **Apache 2.0 License**, which is an OSI-approved open-source license.
> - `llama3:latest` is released under the **Meta Llama 3 Community License**, which is an open-weight model with acceptable use conditions. SoloBooks AI clearly labels licensing terms in the application Settings.

---

## 2. Ollama Installation & Verification

1. **Download Ollama:**  
   Visit [https://ollama.com/download](https://ollama.com/download) and install for Windows, macOS, or Linux.

2. **Start the Ollama daemon:**
   ```bash
   ollama serve
   ```
   *By default, Ollama binds to `http://127.0.0.1:11434`.*

3. **Pull the target model:**
   ```bash
   ollama pull qwen2.5:3b
   # Or for Llama 3:
   ollama pull llama3:latest
   ```

4. **Verify via CLI:**
   ```bash
   ollama list
   ```

5. **Test Structured Output via Curl:**
   ```bash
   curl http://localhost:11434/api/generate -d "{\"model\": \"llama3:latest\", \"prompt\": \"Return JSON: {\\\"status\\\": \\\"ready\\\"}\", \"stream\": false, \"format\": \"json\"}"
   ```

---

## 3. Dynamic Model Switching & Fallback

In SoloBooks AI, navigate to **Settings & Privacy**:
- **Connection Indicator:** Shows whether `http://127.0.0.1:11434` is active.
- **Auto-Discovery:** Automatically queries `/api/tags` to list all locally installed models on your machine.
- **Model Selector:** Choose which model to use for document extraction and the assistant.
- **Offline Fallback:** If Ollama is offline or uninstalled, the app gracefully marks AI status as disconnected, allows manual document entry and non-AI management, and provides one-click troubleshooting instructions.
