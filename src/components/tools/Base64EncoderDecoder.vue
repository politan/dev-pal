<template>
  <div class="space-y-6">
    <!-- Mode Selection -->
    <div class="flex items-center justify-center space-x-4">
      <button
        @click="mode = 'encode'"
        :class="[
          'px-6 py-2 rounded-md transition-colors font-medium',
          mode === 'encode' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        ]"
      >
        Encode to Base64
      </button>
      <button
        @click="mode = 'decode'"
        :class="[
          'px-6 py-2 rounded-md transition-colors font-medium',
          mode === 'decode' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        ]"
      >
        Decode from Base64
      </button>
    </div>

    <!-- Input Section -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-foreground">
        {{ mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode' }}
      </label>
      <textarea
        v-model="inputText"
        @input="processText"
        :placeholder="mode === 'encode' ? 'Enter text to convert to Base64...' : 'Enter Base64 text to decode...'"
        class="w-full min-h-32 p-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical font-mono text-sm"
        rows="6"
      ></textarea>
      <div class="flex items-center justify-between text-xs text-muted-foreground">
        <span>{{ inputText.length }} characters</span>
        <button
          @click="clearInput"
          :disabled="!inputText"
          class="text-destructive hover:text-destructive/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Output Section -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-foreground">
          {{ mode === 'encode' ? 'Base64 Output' : 'Decoded Text' }}
        </label>
        <div class="flex items-center space-x-2">
          <button
            v-if="outputText && !errorMessage"
            @click="copyToClipboard(outputText)"
            class="flex items-center px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            <Copy class="w-3 h-3 mr-1" />
            Copy
          </button>
          <button
            v-if="outputText && !errorMessage"
            @click="downloadResult"
            class="flex items-center px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            <Download class="w-3 h-3 mr-1" />
            Download
          </button>
        </div>
      </div>
      <div 
        :class="[
          'min-h-32 p-3 border rounded-md font-mono text-sm',
          errorMessage 
            ? 'bg-destructive/10 border-destructive text-destructive'
            : 'bg-card border-border text-card-foreground'
        ]"
      >
        <div v-if="errorMessage" class="flex items-center space-x-2 text-destructive">
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>
        <div v-else-if="outputText" class="whitespace-pre-wrap break-all">
          {{ outputText }}
        </div>
        <div v-else class="text-muted-foreground italic">
          {{ mode === 'encode' ? 'Base64 encoded text will appear here...' : 'Decoded text will appear here...' }}
        </div>
      </div>
      <div v-if="outputText && !errorMessage" class="flex items-center justify-between text-xs text-muted-foreground">
        <span>{{ outputText.length }} characters</span>
        <div class="flex items-center space-x-4">
          <span>{{ mode === 'encode' ? 'Encoded' : 'Decoded' }} successfully</span>
          <span v-if="mode === 'encode'">
            Size change: {{ Math.round((outputText.length / inputText.length) * 100) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Information Panel -->
    <div class="bg-card border rounded-lg p-4">
      <h3 class="text-sm font-medium text-card-foreground mb-3 flex items-center">
        <Info class="w-4 h-4 mr-2" />
        About Base64 {{ mode === 'encode' ? 'Encoding' : 'Decoding' }}
      </h3>
      <div class="text-sm text-muted-foreground space-y-2">
        <p v-if="mode === 'encode'">
          Base64 encoding converts binary data into ASCII characters using a 64-character alphabet (A-Z, a-z, 0-9, +, /).
          It's commonly used for encoding data in URLs, emails, and data transfer protocols.
        </p>
        <p v-else>
          Base64 decoding converts Base64-encoded text back into its original format.
          Invalid Base64 characters or incorrect padding will result in an error.
        </p>
        <div class="flex items-center space-x-4 text-xs pt-2 border-t border-border">
          <span class="flex items-center">
            <FileText class="w-3 h-3 mr-1" />
            UTF-8 encoding
          </span>
          <span class="flex items-center">
            <Shield class="w-3 h-3 mr-1" />
            Client-side only
          </span>
          <span class="flex items-center">
            <Clock class="w-3 h-3 mr-1" />
            Real-time processing
          </span>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div 
      v-if="showToast"
      class="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg transition-all duration-300"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useClipboard } from '@vueuse/core'
import { 
  Copy, 
  Download,
  AlertCircle,
  Info,
  FileText,
  Shield,
  Clock
} from 'lucide-vue-next'

// Reactive state
const mode = ref<'encode' | 'decode'>('encode')
const inputText = ref('')
const outputText = ref('')
const errorMessage = ref('')

// Toast notification
const showToast = ref(false)
const toastMessage = ref('')

// Clipboard functionality
const { copy, isSupported: clipboardSupported } = useClipboard()

// Watch for mode changes to clear content and re-process
watch(mode, () => {
  errorMessage.value = ''
  if (inputText.value) {
    processText()
  }
})

// Base64 processing
function processText() {
  errorMessage.value = ''
  
  if (!inputText.value.trim()) {
    outputText.value = ''
    return
  }

  try {
    if (mode.value === 'encode') {
      // Encode to Base64
      outputText.value = btoa(unescape(encodeURIComponent(inputText.value)))
    } else {
      // Decode from Base64
      outputText.value = decodeURIComponent(escape(atob(inputText.value.trim())))
    }
  } catch (_error) {
    outputText.value = ''
    if (mode.value === 'decode') {
      errorMessage.value = 'Invalid Base64 input. Please check your input and try again.'
    } else {
      errorMessage.value = 'Encoding failed. The input may contain unsupported characters.'
    }
  }
}

// Clear input
function clearInput() {
  inputText.value = ''
  outputText.value = ''
  errorMessage.value = ''
}

// Copy to clipboard
async function copyToClipboard(text: string) {
  if (clipboardSupported.value) {
    try {
      await copy(text)
      showToastMessage('Copied to clipboard!')
    } catch (_error) {
      showToastMessage('Failed to copy')
    }
  } else {
    // Fallback for unsupported browsers
    try {
      await navigator.clipboard.writeText(text)
      showToastMessage('Copied to clipboard!')
    } catch (_error) {
      showToastMessage('Failed to copy')
    }
  }
}

// Download result
function downloadResult() {
  if (!outputText.value) return

  const modeLabel = mode.value === 'encode' ? 'encoded' : 'decoded'
  const filename = `base64-${modeLabel}-${new Date().toISOString().split('T')[0]}.txt`
  const mimeType = 'text/plain'

  let url: string | null = null

  try {
    const blob = new Blob([outputText.value], { type: mimeType })
    url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToastMessage(`Downloaded ${modeLabel} text`)
  } catch (_error) {
    console.error('Failed to download:', _error)
    
    // Fallback: Open in new tab
    try {
      const dataUri = `data:${mimeType};charset=utf-8,${encodeURIComponent(outputText.value)}`
      const newWindow = window.open(dataUri, '_blank')
      if (newWindow) {
        showToastMessage(`Opened in new tab - use Save As to download`)
      } else {
        showToastMessage('Download failed. Please check browser settings.')
      }
    } catch (fallbackError) {
      console.error('All download methods failed:', fallbackError)
      showToastMessage('Download failed. Please try copying the text instead.')
    }
  } finally {
    if (url) {
      try {
        URL.revokeObjectURL(url)
      } catch (revokeError) {
        console.warn('Failed to revoke blob URL:', revokeError)
      }
    }
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

// Expose component properties and methods for testing
defineExpose({
  mode,
  inputText,
  outputText,
  errorMessage,
  showToast,
  toastMessage,
  processText,
  clearInput,
  copyToClipboard,
  downloadResult
})
</script>