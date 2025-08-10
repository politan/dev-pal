<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-8">
      <div class="flex items-center mb-4">
        <component :is="icon" class="w-8 h-8 text-primary mr-4" />
        <div>
          <h1 class="text-3xl font-bold text-foreground">{{ title }}</h1>
          <p class="text-muted-foreground mt-1">{{ description }}</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-2" v-if="tags.length > 0">
        <span
          v-for="tag in tags"
          :key="tag"
          class="inline-flex items-center px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <div class="bg-card border rounded-lg">
      <div v-if="comingSoon" class="p-12 text-center">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <component :is="icon" class="w-8 h-8 text-primary" />
        </div>
        <h2 class="text-xl font-semibold text-card-foreground mb-2">Coming Soon</h2>
        <p class="text-muted-foreground mb-6">This tool is currently under development.</p>
        <div class="text-sm text-muted-foreground">
          <p>Expected features:</p>
          <ul class="list-disc list-inside mt-2 space-y-1">
            <li v-for="feature in expectedFeatures" :key="feature">{{ feature }}</li>
          </ul>
        </div>
      </div>
      <div v-else class="p-6">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  title: string
  description: string
  icon: Component
  tags?: string[]
  comingSoon?: boolean
  expectedFeatures?: string[]
}

const { 
  title, 
  description, 
  icon, 
  tags = [], 
  comingSoon = false, 
  expectedFeatures = [] 
} = defineProps<Props>()
</script>