# SoloBooks AI — Local Setup Guide

Follow this guide to run SoloBooks AI locally on your system.

---

## 1. Prerequisites

- **Node.js:** v20.x or v22.x LTS (Verified on Node v22.11.0 on Windows 11)
- **NPM:** v10.x or v11.x (Verified on npm 11.15.0)
- **Git:** Git 2.x+
- **Ollama:** Ollama local runner (Version 0.3+ / 0.18+ verified)
- **Disk Space:** ~500 MB for Node dependencies + ~2 GB to 4.7 GB for the local open-weight model weights.
- **Hardware:** 8GB RAM minimum (16GB recommended for 8B models like Llama 3; 3B models like Qwen2.5 3B run smoothly on 8GB laptops).

---

## 2. Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repo-url> solobooks-ai
   cd solobooks-ai
   ```

2. **Install application dependencies:**
   ```bash
   npm install
   ```

3. **Verify Ollama is installed and running:**
   ```bash
   # In a separate terminal or service:
   ollama serve
   ```

4. **Verify / pull your chosen local model:**
   ```bash
   # Recommended lightweight model (3B parameters, ~2GB disk):
   ollama pull qwen2.5:3b
   
   # Or pull Llama 3 (8B parameters, ~4.7GB disk):
   ollama pull llama3:latest
   ```

5. **Start the local development server:**
   ```bash
   npm run dev
   ```

6. **Open SoloBooks AI:**
   Navigate in your browser to:
   ```
   http://localhost:3000
   ```

---

## 3. Data Storage & Reset

All databases and uploaded receipts are stored in:
- `./data/solobooks.db` (SQLite database)
- `./data/documents/` (Raw uploaded receipts & invoices)

To start completely fresh:
- Click **"Reset Workspace"** in Settings inside the app, or
- Delete the `./data/` folder and restart the app. A clean database will be automatically provisioned on the next request.
