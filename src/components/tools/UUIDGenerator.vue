<template>
  <div class="space-y-6">
    <!-- Configuration Panel -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">UUID Version</label>
        <select 
          v-model="options.version" 
          class="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        >
          <option value="v4">Version 4 (Random)</option>
          <option value="v1">Version 1 (Timestamp)</option>
          <option value="v7">Version 7 (Ordered)</option>
        </select>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">Case Format</label>
        <select 
          v-model="options.format" 
          class="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        >
          <option value="lowercase">Lowercase</option>
          <option value="uppercase">Uppercase</option>
          <option value="mixedcase">Mixed Case</option>
        </select>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">Format Options</label>
        <div class="flex items-center space-x-3">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input 
              v-model="options.includeDashes" 
              type="checkbox" 
              class="w-4 h-4 text-primary bg-background border border-input rounded focus:ring-2 focus:ring-ring"
            >
            <span class="text-sm text-foreground">Include Dashes</span>
          </label>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">Bulk Generation</label>
        <div class="flex space-x-2">
          <input 
            v-model.number="bulkCount" 
            type="number" 
            min="1" 
            max="1000" 
            class="flex-1 px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="Count"
          >
          <button
            @click="generateBulkUUIDs"
            class="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Hash class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Generation Controls -->
    <div class="flex items-center space-x-4">
      <button
        @click="generateSingleUUID"
        class="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        <Plus class="w-4 h-4 mr-2" />
        Generate UUID
      </button>

      <button
        @click="clearAll"
        :disabled="generatedUUIDs.length === 0"
        class="flex items-center px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 class="w-4 h-4 mr-2" />
        Clear All
      </button>

      <div class="flex items-center space-x-2 text-sm text-muted-foreground">
        <Database class="w-4 h-4" />
        <span>{{ generatedUUIDs.length }} UUIDs generated</span>
        <span v-if="collisionCount > 0" class="text-orange-500">
          ({{ collisionCount }} collisions avoided)
        </span>
      </div>
    </div>

    <!-- Preview Area -->
    <div v-if="currentUUID" class="bg-card border rounded-lg p-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-medium text-card-foreground">Latest Generated UUID</h3>
        <button
          @click="copyToClipboard(currentUUID.formatted)"
          class="flex items-center px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          <Copy class="w-3 h-3 mr-1" />
          Copy
        </button>
      </div>
      <div class="bg-background border rounded p-3 font-mono text-sm">
        {{ currentUUID.formatted }}
      </div>
      <div class="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
        <span>Version: {{ currentUUID.version.toUpperCase() }}</span>
        <span>Format: {{ formatDisplayName(currentUUID.format) }}</span>
        <span>Dashes: {{ currentUUID.includeDashes ? 'Yes' : 'No' }}</span>
        <span>Generated: {{ formatTime(currentUUID.timestamp) }}</span>
      </div>
    </div>

    <!-- Generated UUIDs List -->
    <div v-if="generatedUUIDs.length > 0" class="bg-card border rounded-lg">
      <div class="p-4 border-b border-border">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-card-foreground">Generated UUIDs</h3>
          <div class="flex items-center space-x-2">
            <button
              @click="exportUUIDs('json')"
              class="flex items-center px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Download class="w-3 h-3 mr-1" />
              Export JSON
            </button>
            <button
              @click="exportUUIDs('csv')"
              class="flex items-center px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Download class="w-3 h-3 mr-1" />
              Export CSV
            </button>
            <button
              @click="copyAllToClipboard"
              class="flex items-center px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Copy class="w-3 h-3 mr-1" />
              Copy All
            </button>
          </div>
        </div>
      </div>
      <div class="max-h-96 overflow-y-auto">
        <div 
          v-for="uuid in reversedUUIDs" 
          :key="uuid.id"
          class="flex items-center justify-between p-3 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors"
        >
          <div class="flex-1 min-w-0">
            <div class="font-mono text-sm text-foreground mb-1">
              {{ uuid.formatted }}
            </div>
            <div class="flex items-center space-x-3 text-xs text-muted-foreground">
              <span>{{ uuid.version.toUpperCase() }}</span>
              <span>{{ formatDisplayName(uuid.format) }}</span>
              <span>{{ formatTime(uuid.timestamp) }}</span>
            </div>
          </div>
          <button
            @click="copyToClipboard(uuid.formatted)"
            class="ml-3 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy class="w-4 h-4" />
          </button>
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
import { ref, computed, reactive, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'
import { 
  Plus, 
  Copy, 
  Download, 
  Database, 
  Trash2, 
  Hash 
} from 'lucide-vue-next'
import { 
  generateUUID, 
  type UUIDOptions, 
  type GeneratedUUID, 
  type UUIDFormat,
  type UUIDVersion
} from '../../utils/uuid'

// Reactive state
const options = reactive<UUIDOptions>({
  format: 'lowercase',
  version: 'v4',
  includeDashes: true
})

const generatedUUIDs = ref<GeneratedUUID[]>([])
const currentUUID = ref<GeneratedUUID | null>(null)
const existingUUIDs = ref<Set<string>>(new Set())
const collisionCount = ref(0)
const bulkCount = ref(10)

// Toast notification
const showToast = ref(false)
const toastMessage = ref('')

// Clipboard functionality
const { copy, isSupported: clipboardSupported } = useClipboard()

// Computed properties
const reversedUUIDs = computed(() => [...generatedUUIDs.value].reverse())

// Utility functions
function formatDisplayName(format: UUIDFormat): string {
  switch (format) {
    case 'uppercase': return 'Uppercase'
    case 'lowercase': return 'Lowercase'
    case 'mixedcase': return 'Mixed Case'
    default: return 'Lowercase'
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString()
}

// UUID generation
function generateSingleUUID() {
  const newUUID = generateUUID(options, existingUUIDs.value)
  
  // Track actual collisions from the generation process
  collisionCount.value += newUUID.collisions
  
  existingUUIDs.value.add(newUUID.original)
  generatedUUIDs.value.push(newUUID)
  currentUUID.value = newUUID
  
  showToastMessage(`UUID generated successfully!`)
}

function generateBulkUUIDs() {
  const count = Math.min(Math.max(bulkCount.value, 1), 1000)
  let generated = 0
  
  for (let i = 0; i < count; i++) {
    const newUUID = generateUUID(options, existingUUIDs.value)
    
    // Track actual collisions from the generation process
    collisionCount.value += newUUID.collisions
    
    existingUUIDs.value.add(newUUID.original)
    generatedUUIDs.value.push(newUUID)
    generated++
  }
  
  if (generated > 0) {
    currentUUID.value = generatedUUIDs.value[generatedUUIDs.value.length - 1]
  }
  
  showToastMessage(`Generated ${generated} UUIDs successfully!`)
}

// Clear functionality
function clearAll() {
  generatedUUIDs.value = []
  currentUUID.value = null
  existingUUIDs.value.clear()
  collisionCount.value = 0
  showToastMessage('All UUIDs cleared')
}

// Copy functionality
async function copyToClipboard(text: string) {
  if (clipboardSupported.value) {
    try {
      await copy(text)
      showToastMessage('UUID copied to clipboard!')
    } catch (error) {
      showToastMessage('Failed to copy UUID')
    }
  } else {
    // Fallback for unsupported browsers
    try {
      await navigator.clipboard.writeText(text)
      showToastMessage('UUID copied to clipboard!')
    } catch (error) {
      showToastMessage('Failed to copy UUID')
    }
  }
}

async function copyAllToClipboard() {
  const allUUIDs = generatedUUIDs.value.map(uuid => uuid.formatted).join('\n')
  await copyToClipboard(allUUIDs)
  showToastMessage(`Copied ${generatedUUIDs.value.length} UUIDs to clipboard!`)
}

// Export functionality
function exportUUIDs(format: 'json' | 'csv') {
  const data = generatedUUIDs.value
  let content: string
  let filename: string
  let mimeType: string

  if (format === 'json') {
    content = JSON.stringify(data, null, 2)
    filename = `uuids-${new Date().toISOString().split('T')[0]}.json`
    mimeType = 'application/json'
  } else {
    const headers = 'UUID,Version,Format,Dashes,Timestamp\n'
    const rows = data.map(uuid => 
      `"${uuid.formatted}","${uuid.version}","${uuid.format}","${uuid.includeDashes}","${uuid.timestamp.toISOString()}"`
    ).join('\n')
    content = headers + rows
    filename = `uuids-${new Date().toISOString().split('T')[0]}.csv`
    mimeType = 'text/csv'
  }

  let url: string | null = null

  try {
    const blob = new Blob([content], { type: mimeType })
    url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToastMessage(`Exported ${data.length} UUIDs as ${format.toUpperCase()}`)
  } catch (error) {
    console.error('Failed to export UUIDs via programmatic download:', error)
    
    // Fallback 1: Try Web Share API if available
    if (navigator.share && 'canShare' in navigator) {
      const file = new File([content], filename, { type: mimeType })
      if (navigator.canShare({ files: [file] })) {
        try {
          navigator.share({
            title: `UUID Export - ${format.toUpperCase()}`,
            text: `Exported ${data.length} UUIDs`,
            files: [file]
          })
          showToastMessage(`Shared ${data.length} UUIDs via system share`)
          return
        } catch (shareError) {
          console.error('Web Share API failed:', shareError)
        }
      }
    }
    
    // Fallback 2: Open in new window/tab for manual save
    try {
      const dataUri = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`
      const newWindow = window.open(dataUri, '_blank')
      if (newWindow) {
        showToastMessage(`Opened ${format.toUpperCase()} in new tab - use browser's Save As to download`)
      } else {
        throw new Error('Popup blocked')
      }
    } catch (fallbackError) {
      console.error('All export methods failed:', fallbackError)
      showToastMessage(`Export failed. Please check browser settings and try again.`)
    }
  } finally {
    // Clean up the blob URL only if it was created
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

// Generate initial UUID on mount
onMounted(() => {
  generateSingleUUID()
})

// Expose component properties and methods for testing
defineExpose({
  generatedUUIDs,
  currentUUID,
  existingUUIDs,
  collisionCount,
  bulkCount,
  showToast,
  toastMessage,
  formatDisplayName,
  formatTime,
  exportUUIDs,
  generateSingleUUID,
  generateBulkUUIDs,
  clearAll
})
</script>