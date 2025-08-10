<template>
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-foreground mb-4">
        Welcome to DevPal
      </h1>
      <p class="text-xl text-muted-foreground mb-2">
        Your AI-Powered Developer Sidekick
      </p>
      <p class="text-muted-foreground">
        Select a tool from the sidebar to get started
      </p>
    </div>

    <div class="grid gap-8 md:grid-cols-2">
      <!-- Categories Overview -->
      <div class="space-y-6">
        <div class="bg-card border rounded-lg p-6">
          <div class="flex items-center mb-4">
            <Settings class="w-6 h-6 text-primary mr-3" />
            <h3 class="text-lg font-semibold">Core Utilities</h3>
          </div>
          <p class="text-sm text-muted-foreground mb-3">
            Essential developer tools for everyday tasks
          </p>
          <div class="text-xs text-muted-foreground">
            Currency conversion, UUID generation, hashing, encoding
          </div>
        </div>

        <div class="bg-card border rounded-lg p-6">
          <div class="flex items-center mb-4">
            <Code class="w-6 h-6 text-primary mr-3" />
            <h3 class="text-lg font-semibold">Code & Text Tools</h3>
          </div>
          <p class="text-sm text-muted-foreground mb-3">
            Format, validate, and manipulate text and code
          </p>
          <div class="text-xs text-muted-foreground">
            JSON formatting, regex testing, text comparison
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-card border rounded-lg p-6">
          <div class="flex items-center mb-4">
            <Bot class="w-6 h-6 text-primary mr-3" />
            <h3 class="text-lg font-semibold">AI Toolkit</h3>
          </div>
          <p class="text-sm text-muted-foreground mb-3">
            Specialized AI-powered tools for modern development
          </p>
          <div class="text-xs text-muted-foreground">
            Prompt testing, tokenization, data generation, similarity analysis
          </div>
        </div>

        <div class="bg-card border rounded-lg p-6">
          <div class="flex items-center mb-4">
            <Plug class="w-6 h-6 text-primary mr-3" />
            <h3 class="text-lg font-semibold">API & Integration</h3>
          </div>
          <p class="text-sm text-muted-foreground mb-3">
            Test and debug API integrations
          </p>
          <div class="text-xs text-muted-foreground">
            HTTP client, webhook testing
          </div>
        </div>
      </div>
    </div>

    <div class="mt-12 text-center">
      <div class="inline-flex items-center px-4 py-2 bg-secondary rounded-lg">
        <ArrowLeft class="w-4 h-4 mr-2" />
        <span class="text-sm text-secondary-foreground">
          Choose a tool from the sidebar to begin
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Settings, Code, Bot, Plug, ArrowLeft } from 'lucide-vue-next'
</script>