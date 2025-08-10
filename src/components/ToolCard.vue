<template>
  <div class="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg">
    <div class="flex items-start space-x-4">
      <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <component :is="icon" class="h-6 w-6" />
      </div>
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-card-foreground">{{ title }}</h3>
        <p class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
        <div class="mt-3 flex flex-wrap gap-1">
          <span
            v-for="tag in tags"
            :key="tag"
            class="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
    <div class="absolute inset-0 rounded-lg border-2 border-transparent transition-colors group-hover:border-primary/20"></div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  title: string
  description: string
  icon: Component
  tags: string[]
  href?: string
}

defineProps<Props>()
</script>