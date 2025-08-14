<template>
  <div class="space-y-6">
    <!-- Configuration Panel -->
    <div class="grid gap-6 md:grid-cols-3">
      <!-- Model Selection -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">Model</label>
        <select 
          v-model="selectedModel" 
          class="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          @change="reanalyzeText"
        >
          <optgroup label="OpenAI GPT-5 Models">
            <option value="gpt-5">GPT-5</option>
            <option value="gpt-5-pro">GPT-5 Pro</option>
            <option value="gpt-5-mini">GPT-5 Mini</option>
            <option value="gpt-5-nano">GPT-5 Nano</option>
          </optgroup>
          <optgroup label="Anthropic Claude 4 Models">
            <option value="claude-4-sonnet">Claude 4 Sonnet</option>
            <option value="claude-4-opus">Claude 4 Opus</option>
            <option value="claude-opus-4.1">Claude Opus 4.1</option>
          </optgroup>
          <optgroup label="Google Gemini 2.5 Models">
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
          </optgroup>
        </select>
      </div>

      <!-- Role Selection -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">Message Role</label>
        <select 
          v-model="selectedRole" 
          class="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          @change="reanalyzeText"
        >
          <option 
            v-for="role in MESSAGE_ROLES" 
            :key="role.type" 
            :value="role"
          >
            {{ role.label }}
          </option>
        </select>
      </div>

      <!-- Real-time Analysis Toggle -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">Analysis Mode</label>
        <div class="flex items-center space-x-3">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input 
              v-model="realTimeAnalysis" 
              type="checkbox" 
              class="w-4 h-4 text-primary bg-background border border-input rounded focus:ring-2 focus:ring-ring"
            >
            <span class="text-sm text-foreground">Real-time</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Text Input -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-foreground">Text to Analyze</label>
        <button
          v-if="inputText.length > 0"
          @click="clearText"
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>
      <textarea
        v-model="inputText"
        @input="handleTextInput"
        placeholder="Enter your text here to analyze token count and cost..."
        class="w-full h-40 px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-y font-mono text-sm"
      ></textarea>
    </div>

    <!-- Manual Analyze Button (shown when real-time is off) -->
    <div v-if="!realTimeAnalysis && inputText.length > 0" class="flex items-center space-x-4">
      <button
        @click="analyzeCurrentText"
        class="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        <Calculator class="w-4 h-4 mr-2" />
        Analyze Text
      </button>
    </div>

    <!-- Analysis Results -->
    <div v-if="currentAnalysis" class="space-y-6">
      <!-- Stats Panel -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div class="bg-card border rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-1">
            <Coins class="w-4 h-4 text-primary" />
            <span class="text-sm font-medium text-card-foreground">Tokens</span>
          </div>
          <div class="text-2xl font-bold text-card-foreground">{{ currentAnalysis.totalTokens.toLocaleString() }}</div>
          <div v-if="tokenLimitInfo.percentage > 0" class="text-xs text-muted-foreground mt-1">
            {{ tokenLimitInfo.percentage.toFixed(1) }}% of limit
          </div>
        </div>

        <div class="bg-card border rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-1">
            <Type class="w-4 h-4 text-blue-500" />
            <span class="text-sm font-medium text-card-foreground">Characters</span>
          </div>
          <div class="text-2xl font-bold text-card-foreground">{{ currentAnalysis.characterCount.toLocaleString() }}</div>
        </div>

        <div class="bg-card border rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-1">
            <FileText class="w-4 h-4 text-green-500" />
            <span class="text-sm font-medium text-card-foreground">Words</span>
          </div>
          <div class="text-2xl font-bold text-card-foreground">{{ currentAnalysis.wordCount.toLocaleString() }}</div>
        </div>

        <div class="bg-card border rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-1">
            <DollarSign class="w-4 h-4 text-yellow-500" />
            <span class="text-sm font-medium text-card-foreground">Est. Cost</span>
          </div>
          <div class="text-2xl font-bold text-card-foreground">${{ currentAnalysis.estimatedCost.toFixed(6) }}</div>
        </div>

        <div class="bg-card border rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-1">
            <Clock class="w-4 h-4 text-purple-500" />
            <span class="text-sm font-medium text-card-foreground">Analysis</span>
          </div>
          <div class="text-sm font-bold text-card-foreground">{{ formatTime(currentAnalysis.timestamp) }}</div>
          <div class="text-xs text-muted-foreground">{{ MODEL_CONFIGS[currentAnalysis.model].name }}</div>
        </div>
      </div>

      <!-- Token Limit Warning -->
      <div v-if="!tokenLimitInfo.isValid" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <div class="flex items-start space-x-3">
          <AlertTriangle class="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <h3 class="text-sm font-medium text-destructive">Token Limit Exceeded</h3>
            <p class="text-sm text-destructive/80 mt-1">
              Your text contains {{ currentAnalysis.totalTokens.toLocaleString() }} tokens, which exceeds the 
              {{ tokenLimitInfo.maxTokens.toLocaleString() }} token limit for {{ MODEL_CONFIGS[currentAnalysis.model].name }}.
              Consider breaking your text into smaller chunks.
            </p>
          </div>
        </div>
      </div>

      <!-- Claude Approximation Notice -->
      <div v-if="!MODEL_CONFIGS[currentAnalysis.model].supportsNativeTokenization" class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div class="flex items-start space-x-3">
          <Info class="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-600">Approximation Notice</h3>
            <p class="text-sm text-yellow-700 dark:text-yellow-600/80 mt-1">
              Token counts for Claude models are approximated using OpenAI's tokenizer. 
              Actual token usage may vary by ±5-10%.
            </p>
          </div>
        </div>
      </div>

      <!-- Token Visualization -->
      <div class="bg-card border rounded-lg">
        <div class="p-4 border-b border-border">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-card-foreground flex items-center">
              <Palette class="w-5 h-5 mr-2" />
              Token Breakdown
            </h3>
            <div class="flex items-center space-x-2">
              <button
                @click="copyTokensToClipboard"
                class="flex items-center px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                <Copy class="w-3 h-3 mr-1" />
                Copy Tokens
              </button>
              <button
                @click="exportAnalysis('json')"
                class="flex items-center px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                <Download class="w-3 h-3 mr-1" />
                Export
              </button>
            </div>
          </div>
          <p class="text-sm text-muted-foreground mt-1">
            Each colored segment represents a single token. Hover over tokens to see details.
          </p>
        </div>
        <div class="p-4">
          <div class="flex flex-wrap gap-1 leading-relaxed font-mono text-sm">
            <span
              v-for="token in currentAnalysis.tokens"
              :key="token.id"
              :style="{ backgroundColor: token.color, color: getContrastColor(token.color) }"
              :title="`Token #${token.index + 1}: '${token.text}' (ID: ${token.token})`"
              class="inline-block px-1 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity whitespace-pre"
              @click="showTokenDetails(token)"
            >{{ token.text }}</span>
          </div>
        </div>
      </div>

      <!-- Analysis History -->
      <div v-if="analysisHistory.length > 1" class="bg-card border rounded-lg">
        <div class="p-4 border-b border-border">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-card-foreground">Analysis History</h3>
            <button
              @click="clearHistory"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear History
            </button>
          </div>
        </div>
        <div class="max-h-64 overflow-y-auto">
          <div 
            v-for="analysis in reversedHistory" 
            :key="analysis.id"
            class="flex items-center justify-between p-3 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer"
            @click="loadAnalysis(analysis)"
          >
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-foreground mb-1">
                {{ MODEL_CONFIGS[analysis.model].name }} • {{ analysis.role.label }}
              </div>
              <div class="text-xs text-muted-foreground truncate">
                {{ analysis.text.substring(0, 100) }}{{ analysis.text.length > 100 ? '...' : '' }}
              </div>
              <div class="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                <span>{{ analysis.totalTokens }} tokens</span>
                <span>${{ analysis.estimatedCost.toFixed(6) }}</span>
                <span>{{ formatTime(analysis.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Token Detail Modal -->
    <div v-if="selectedToken" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="selectedToken = null">
      <div class="bg-card border rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-card-foreground">Token Details</h3>
          <button @click="selectedToken = null" class="text-muted-foreground hover:text-foreground">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium text-foreground">Token Text</label>
            <div class="bg-background border rounded p-2 font-mono text-sm mt-1">{{ selectedToken.text }}</div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm font-medium text-foreground">Position</label>
              <div class="bg-background border rounded p-2 text-sm mt-1">#{{ selectedToken.index + 1 }}</div>
            </div>
            <div>
              <label class="text-sm font-medium text-foreground">Token ID</label>
              <div class="bg-background border rounded p-2 text-sm mt-1">{{ selectedToken.token }}</div>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-foreground">Color</label>
            <div class="flex items-center space-x-2 mt-1">
              <div 
                :style="{ backgroundColor: selectedToken.color }" 
                class="w-8 h-8 rounded border"
              ></div>
              <span class="text-sm font-mono">{{ selectedToken.color }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div 
      v-if="showToast"
      class="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg transition-all duration-300 z-50"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, nextTick, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'
import { 
  Calculator,
  Coins,
  Type,
  FileText,
  DollarSign,
  Clock,
  Palette,
  Copy,
  Download,
  AlertTriangle,
  Info,
  X
} from 'lucide-vue-next'

import { 
  analyzeText,
  MESSAGE_ROLES,
  MODEL_CONFIGS,
  validateTokenLimit,
  type TokenizerOptions, 
  type TokenizedResult,
  type MessageRole,
  type SupportedModel,
  type TokenChunk
} from '../../utils/tokenizer'

// Reactive state
const selectedModel = ref<SupportedModel>('gpt-5-mini')
const selectedRole = ref<MessageRole>(MESSAGE_ROLES[1]) // Default to 'user'
const inputText = ref('')
const realTimeAnalysis = ref(true)
const currentAnalysis = ref<TokenizedResult | null>(null)
const analysisHistory = ref<TokenizedResult[]>([])
const selectedToken = ref<TokenChunk | null>(null)
const isAnalyzing = ref(false)

// Toast notification
const showToast = ref(false)
const toastMessage = ref('')

// Debounce timer for real-time analysis
let debounceTimer: NodeJS.Timeout | null = null

// Clipboard functionality
const { copy, isSupported: clipboardSupported } = useClipboard()

// Computed properties
const reversedHistory = computed(() => [...analysisHistory.value].reverse())

const tokenLimitInfo = computed(() => {
  if (!currentAnalysis.value) {
    return { isValid: true, maxTokens: 0, percentage: 0 }
  }
  return validateTokenLimit(currentAnalysis.value.totalTokens, currentAnalysis.value.model)
})

// Watchers
watch([selectedModel, selectedRole], reanalyzeText)

// Functions
function handleTextInput() {
  if (realTimeAnalysis.value && inputText.value.trim()) {
    // Debounce the analysis to avoid excessive API calls
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
      analyzeCurrentText()
    }, 300) // 300ms delay
  }
}

function analyzeCurrentText() {
  if (!inputText.value.trim()) {
    currentAnalysis.value = null
    return
  }

  isAnalyzing.value = true

  try {
    const options: TokenizerOptions = {
      model: selectedModel.value,
      role: selectedRole.value
    }

    const result = analyzeText(inputText.value, options)
    currentAnalysis.value = result
    
    // Add to history if it's not a duplicate
    const lastAnalysis = analysisHistory.value[analysisHistory.value.length - 1]
    if (!lastAnalysis || 
        lastAnalysis.text !== result.text || 
        lastAnalysis.model !== result.model || 
        lastAnalysis.role.type !== result.role.type) {
      analysisHistory.value.push(result)
      
      // Limit history to 20 items
      if (analysisHistory.value.length > 20) {
        analysisHistory.value.shift()
      }
    }
    
  } catch (error) {
    console.error('Error analyzing text:', error)
    showToastMessage('Error analyzing text. Please try again.')
  } finally {
    isAnalyzing.value = false
  }
}

function reanalyzeText() {
  if (inputText.value.trim() && (realTimeAnalysis.value || currentAnalysis.value)) {
    nextTick(() => {
      analyzeCurrentText()
    })
  }
}

function clearText() {
  inputText.value = ''
  currentAnalysis.value = null
  selectedToken.value = null
}

function clearHistory() {
  analysisHistory.value = []
  showToastMessage('Analysis history cleared')
}

function loadAnalysis(analysis: TokenizedResult) {
  inputText.value = analysis.text
  selectedModel.value = analysis.model
  selectedRole.value = analysis.role
  currentAnalysis.value = analysis
}

function showTokenDetails(token: TokenChunk) {
  selectedToken.value = token
}

function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Copy functionality
async function copyTokensToClipboard() {
  if (!currentAnalysis.value) return
  
  const tokensText = currentAnalysis.value.tokens.map(token => token.text).join('')
  
  if (clipboardSupported.value) {
    try {
      await copy(tokensText)
      showToastMessage('Tokens copied to clipboard!')
    } catch (_error) {
      showToastMessage('Failed to copy tokens')
    }
  }
}

// Export functionality
function exportAnalysis(format: 'json' | 'csv') {
  if (!currentAnalysis.value) return

  const data = currentAnalysis.value
  let content: string
  let filename: string
  let mimeType: string

  if (format === 'json') {
    content = JSON.stringify(data, null, 2)
    filename = `tokenizer-analysis-${new Date().toISOString().split('T')[0]}.json`
    mimeType = 'application/json'
  } else {
    const headers = 'Text,Model,Role,Tokens,Characters,Words,Cost,Timestamp\n'
    const row = `"${data.text.replace(/"/g, '""')}","${data.model}","${data.role.type}","${data.totalTokens}","${data.characterCount}","${data.wordCount}","${data.estimatedCost}","${data.timestamp.toISOString()}"`
    content = headers + row
    filename = `tokenizer-analysis-${new Date().toISOString().split('T')[0]}.csv`
    mimeType = 'text/csv'
  }

  try {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showToastMessage(`Analysis exported as ${format.toUpperCase()}`)
  } catch (error) {
    console.error('Failed to export analysis:', error)
    showToastMessage('Export failed. Please try again.')
  }
}

// Toast notification
function showToastMessage(message: string) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Initialize with sample text on mount
onMounted(() => {
  inputText.value = 'Hello! How can I help you today?'
  if (realTimeAnalysis.value) {
    nextTick(() => {
      analyzeCurrentText()
    })
  }
})

// Expose component properties for testing
defineExpose({
  selectedModel,
  selectedRole,
  inputText,
  currentAnalysis,
  analysisHistory,
  realTimeAnalysis,
  analyzeCurrentText,
  clearText,
  clearHistory,
  exportAnalysis
})
</script>