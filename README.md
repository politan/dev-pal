# DevPal

> Your AI-Powered Developer Sidekick.

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg) ![Status](https://img.shields.io/badge/status-in%20development-orange.svg)

DevPal is a versatile, all-in-one desktop application built to streamline a developer's daily workflow. It combines essential utilities with powerful, specialized tools for AI development, putting everything you need right at your fingertips.

Whether you need to quickly generate a UUID, format a messy JSON, or experiment with language model prompts, DevPal is designed to be your go-to productivity booster.

---

## ✨ Features

DevPal is organized into logical modules to help you find the right tool for the job instantly.

### 🔧 Core Developer Utilities
- **Currency Converter:** Check the latest exchange rates for fiat and crypto currencies.
- **Timezone Converter:** A visual tool to compare time across multiple global locations.
- **UUID/GUID Generator:** Generate various versions of UUIDs, individually or in batches.
- **Hash Generator:** Calculate MD5, SHA-1, SHA-256, and SHA-512 hashes for text and files.
- **Base64 Encoder/Decoder:** Effortlessly handle Base64 encoding for text and files.
- **URL Encoder/Decoder:** Quickly encode or decode URL components.
- **Unix Timestamp Converter:** Switch between human-readable dates and Unix timestamps.

### 📝 Code & Text Tools
- **JSON Formatter & Validator:** Beautify, minify, and validate your JSON data with syntax highlighting.
- **Live Regex Tester:** Test your regular expressions in real-time with clear match highlighting.
- **Text Diff Checker:** Compare two blocks of text or code to see the differences, just like `git diff`.
- **Lorem Ipsum Generator:** Create placeholder text for your mockups.

### 🤖 Specialized AI Toolkit
- **Prompt Sandbox:** A playground to test and refine prompts across different LLMs (e.g., OpenAI, Gemini). Compare outputs side-by-side and tweak parameters like `temperature`.
- **Tokenizer:** Visualize how text is split into tokens by popular models and get an accurate token count to manage API costs and context limits.
- **Synthetic Data Generator:** Use AI to instantly create mock data in JSON or CSV format for testing and development.
- **Semantic Similarity Calculator:** Input two pieces of text and see their cosine similarity score, providing an intuitive feel for how embeddings work.

### 🔌 API & Integration Tools
- **Simple API Client:** A lightweight client for making quick HTTP requests (GET, POST, etc.) and inspecting responses.
- **Real-time Webhook Tester:** Generate a temporary URL to receive and inspect webhook payloads for easy debugging of integrations.

---

## 💻 Tech Stack

- **Frontend:** Astro with Vue 3 islands architecture
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **Build Tool:** Vite
- **Language:** TypeScript

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18.x or later)
- npm or yarn

### Installation

1. Clone the repo:
   ```sh
   git clone https://github.com/your-username/devpal.git
   cd devpal
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:4321`

### Available Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |

---

## 📁 Project Structure

```
src/
├── components/          # Reusable Vue components
├── layouts/            # Astro layout templates
├── pages/              # Astro pages (file-based routing)
├── stores/             # Vue state management
├── utils/              # Utility functions
└── styles/             # Global styles and Tailwind config
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.