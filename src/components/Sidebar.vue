<template>
  <aside class="fixed left-0 top-0 h-full w-64 bg-card border-r border-border overflow-y-auto hidden md:block">
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-foreground">DevPal</h1>
        <p class="text-sm text-muted-foreground mt-1">Developer Toolkit</p>
      </div>

      <nav class="space-y-6" role="navigation" aria-label="DevPal tools navigation">
        <!-- Core Developer Utilities -->
        <div>
          <h2 id="core-utilities" class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center">
            <Settings class="w-4 h-4 mr-2" />
            Core Utilities
          </h2>
          <ul class="space-y-1" aria-labelledby="core-utilities">
            <li v-for="tool in coreTools" :key="tool.id">
              <a
                :href="`/tools/${tool.id}`"
                class="flex items-center px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                :class="{ 'bg-accent text-accent-foreground': currentTool === tool.id }"
                :aria-current="currentTool === tool.id ? 'page' : undefined"
              >
                <component :is="tool.icon" class="w-4 h-4 mr-3" />
                {{ tool.name }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Code & Text Tools -->
        <div>
          <h2 id="code-text" class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center">
            <Code class="w-4 h-4 mr-2" />
            Code & Text
          </h2>
          <ul class="space-y-1" aria-labelledby="code-text">
            <li v-for="tool in codeTools" :key="tool.id">
              <a
                :href="`/tools/${tool.id}`"
                class="flex items-center px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                :class="{ 'bg-accent text-accent-foreground': currentTool === tool.id }"
                :aria-current="currentTool === tool.id ? 'page' : undefined"
              >
                <component :is="tool.icon" class="w-4 h-4 mr-3" />
                {{ tool.name }}
              </a>
            </li>
          </ul>
        </div>

        <!-- AI Toolkit -->
        <div>
          <h2 id="ai-toolkit" class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center">
            <Bot class="w-4 h-4 mr-2" />
            AI Toolkit
          </h2>
          <ul class="space-y-1" aria-labelledby="ai-toolkit">
            <li v-for="tool in aiTools" :key="tool.id">
              <a
                :href="`/tools/${tool.id}`"
                class="flex items-center px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                :class="{ 'bg-accent text-accent-foreground': currentTool === tool.id }"
                :aria-current="currentTool === tool.id ? 'page' : undefined"
              >
                <component :is="tool.icon" class="w-4 h-4 mr-3" />
                {{ tool.name }}
              </a>
            </li>
          </ul>
        </div>

        <!-- API & Integration -->
        <div>
          <h2 id="api-integration" class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center">
            <Plug class="w-4 h-4 mr-2" />
            API & Integration
          </h2>
          <ul class="space-y-1" aria-labelledby="api-integration">
            <li v-for="tool in apiTools" :key="tool.id">
              <a
                :href="`/tools/${tool.id}`"
                class="flex items-center px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                :class="{ 'bg-accent text-accent-foreground': currentTool === tool.id }"
                :aria-current="currentTool === tool.id ? 'page' : undefined"
              >
                <component :is="tool.icon" class="w-4 h-4 mr-3" />
                {{ tool.name }}
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </aside>
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

interface Props {
  currentTool?: string
}

defineProps<Props>()

const coreTools = [
  { id: 'currency-converter', name: 'Currency Converter', icon: DollarSign },
  { id: 'timezone-converter', name: 'Timezone Converter', icon: Clock },
  { id: 'uuid-generator', name: 'UUID Generator', icon: Fingerprint },
  { id: 'hash-generator', name: 'Hash Generator', icon: Hash },
  { id: 'base64-encoder', name: 'Base64 Encoder', icon: FileText },
  { id: 'url-encoder', name: 'URL Encoder', icon: Link },
  { id: 'timestamp-converter', name: 'Timestamp Converter', icon: Calendar }
]

const codeTools = [
  { id: 'json-formatter', name: 'JSON Formatter', icon: Braces },
  { id: 'regex-tester', name: 'Regex Tester', icon: TestTube },
  { id: 'text-diff', name: 'Text Diff', icon: Diff },
  { id: 'lorem-generator', name: 'Lorem Generator', icon: Type }
]

const aiTools = [
  { id: 'prompt-sandbox', name: 'Prompt Sandbox', icon: MessageSquare },
  { id: 'tokenizer', name: 'Tokenizer', icon: Coins },
  { id: 'data-generator', name: 'Data Generator', icon: Database },
  { id: 'similarity-calc', name: 'Similarity Calculator', icon: Calculator }
]

const apiTools = [
  { id: 'api-client', name: 'API Client', icon: Globe },
  { id: 'webhook-tester', name: 'Webhook Tester', icon: Webhook }
]
</script>