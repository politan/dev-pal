<template>
  <div class="space-y-8">
    <div class="text-center">
      <h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
        DevPal
      </h1>
      <p class="mt-6 text-lg leading-8 text-muted-foreground">
        Your AI-Powered Developer Sidekick
      </p>
      <p class="mt-2 text-base text-muted-foreground">
        Streamline your workflow with essential utilities and specialized AI tools
      </p>
    </div>

    <!-- Core Developer Utilities -->
    <section>
      <h2 class="mb-6 text-2xl font-semibold text-foreground flex items-center">
        <Settings class="mr-3 h-6 w-6" />
        Core Developer Utilities
      </h2>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ToolCard
          v-for="tool in coreTools"
          :key="tool.title"
          :title="tool.title"
          :description="tool.description"
          :icon="tool.icon"
          :tags="tool.tags"
        />
      </div>
    </section>

    <!-- Code & Text Tools -->
    <section>
      <h2 class="mb-6 text-2xl font-semibold text-foreground flex items-center">
        <Code class="mr-3 h-6 w-6" />
        Code & Text Tools
      </h2>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ToolCard
          v-for="tool in codeTools"
          :key="tool.title"
          :title="tool.title"
          :description="tool.description"
          :icon="tool.icon"
          :tags="tool.tags"
        />
      </div>
    </section>

    <!-- AI Toolkit -->
    <section>
      <h2 class="mb-6 text-2xl font-semibold text-foreground flex items-center">
        <Bot class="mr-3 h-6 w-6" />
        Specialized AI Toolkit
      </h2>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ToolCard
          v-for="tool in aiTools"
          :key="tool.title"
          :title="tool.title"
          :description="tool.description"
          :icon="tool.icon"
          :tags="tool.tags"
        />
      </div>
    </section>

    <!-- API & Integration Tools -->
    <section>
      <h2 class="mb-6 text-2xl font-semibold text-foreground flex items-center">
        <Plug class="mr-3 h-6 w-6" />
        API & Integration Tools
      </h2>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ToolCard
          v-for="tool in apiTools"
          :key="tool.title"
          :title="tool.title"
          :description="tool.description"
          :icon="tool.icon"
          :tags="tool.tags"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { 
  Settings, 
  Code, 
  Bot, 
  Plug,
  DollarSign,
  Clock,
  Fingerprint,
  Hash,
  FileText,
  Link,
  Calendar,
  Braces,
  TestTube,
  Diff,
  Type,
  MessageSquare,
  Coins,
  Database,
  Calculator,
  Globe,
  Webhook
} from 'lucide-vue-next'
import ToolCard from './ToolCard.vue'

const coreTools = [
  {
    title: 'Currency Converter',
    description: 'Check latest exchange rates for fiat and crypto currencies',
    icon: DollarSign,
    tags: ['Finance', 'API', 'Real-time']
  },
  {
    title: 'Timezone Converter',
    description: 'Visual tool to compare time across multiple global locations',
    icon: Clock,
    tags: ['Time', 'Global', 'Visual']
  },
  {
    title: 'UUID/GUID Generator',
    description: 'Generate various versions of UUIDs, individually or in batches',
    icon: Fingerprint,
    tags: ['Generator', 'Batch', 'UUID']
  },
  {
    title: 'Hash Generator',
    description: 'Calculate MD5, SHA-1, SHA-256, and SHA-512 hashes for text and files',
    icon: Hash,
    tags: ['Security', 'Hashing', 'Files']
  },
  {
    title: 'Base64 Encoder/Decoder',
    description: 'Effortlessly handle Base64 encoding for text and files',
    icon: FileText,
    tags: ['Encoding', 'Text', 'Files']
  },
  {
    title: 'URL Encoder/Decoder',
    description: 'Quickly encode or decode URL components',
    icon: Link,
    tags: ['URL', 'Web', 'Encoding']
  },
  {
    title: 'Unix Timestamp Converter',
    description: 'Switch between human-readable dates and Unix timestamps',
    icon: Calendar,
    tags: ['Time', 'Unix', 'Converter']
  }
]

const codeTools = [
  {
    title: 'JSON Formatter & Validator',
    description: 'Beautify, minify, and validate JSON data with syntax highlighting',
    icon: Braces,
    tags: ['JSON', 'Format', 'Validate']
  },
  {
    title: 'Live Regex Tester',
    description: 'Test regular expressions in real-time with clear match highlighting',
    icon: TestTube,
    tags: ['Regex', 'Testing', 'Live']
  },
  {
    title: 'Text Diff Checker',
    description: 'Compare two blocks of text or code to see differences',
    icon: Diff,
    tags: ['Diff', 'Compare', 'Code']
  },
  {
    title: 'Lorem Ipsum Generator',
    description: 'Create placeholder text for your mockups',
    icon: Type,
    tags: ['Text', 'Generator', 'Placeholder']
  }
]

const aiTools = [
  {
    title: 'Prompt Sandbox',
    description: 'Test and refine prompts across different LLMs with side-by-side comparison',
    icon: MessageSquare,
    tags: ['AI', 'Prompts', 'LLM', 'Compare']
  },
  {
    title: 'Tokenizer',
    description: 'Visualize text tokenization and get accurate token counts for API costs',
    icon: Coins,
    tags: ['AI', 'Tokens', 'Cost', 'Visualize']
  },
  {
    title: 'Synthetic Data Generator',
    description: 'Use AI to instantly create mock data in JSON or CSV format',
    icon: Database,
    tags: ['AI', 'Data', 'Generator', 'Mock']
  },
  {
    title: 'Semantic Similarity Calculator',
    description: 'Calculate cosine similarity scores between text embeddings',
    icon: Calculator,
    tags: ['AI', 'Embeddings', 'Similarity', 'Analysis']
  }
]

const apiTools = [
  {
    title: 'Simple API Client',
    description: 'Lightweight client for making HTTP requests and inspecting responses',
    icon: Globe,
    tags: ['HTTP', 'API', 'Client', 'Testing']
  },
  {
    title: 'Real-time Webhook Tester',
    description: 'Generate temporary URLs to receive and inspect webhook payloads',
    icon: Webhook,
    tags: ['Webhooks', 'Testing', 'Real-time', 'Debug']
  }
]
</script>