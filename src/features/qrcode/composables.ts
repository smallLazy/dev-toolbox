/**
 * QR Code Plugin — Vue Composable
 *
 * Bridges pure logic to Vue reactivity.
 * Generates PNG data URLs, supports copy image and download.
 * No Core/Registry/Service access.
 */

import { ref, computed } from 'vue'
import { createFeatureContext } from '@/sdk/feature'
import { QrcodeFeature } from './QrcodeFeature'
import { createToolbar } from './toolbar'
import {
  generateQrCode,
  validateQrInput,
  getQrStats,
  normalizeQrOptions,
  SAMPLE_INPUT,
} from './logic'
import { defaults } from './settings'
import type { QrcodeConfig, QrCodeOptions, QrCodeStats } from './types'

export function useQrcode() {
  // ── Context & Feature ──────────────────────────────────────────────
  const context = createFeatureContext<QrcodeConfig>({
    id: 'qrcode',
    name: 'QR Code',
    description: 'Generate QR codes from text, URLs, and other content.',
    icon: 'QrCode',
    version: '1.0.0',
    category: 'utility',
  })
  const feature = new QrcodeFeature(context)

  // ── Reactive State ──────────────────────────────────────────────────
  const input = ref('')
  const dataUrl = ref<string | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const stats = ref<QrCodeStats | null>(null)
  const options = ref<QrCodeOptions>({
    size: defaults.size,
    margin: defaults.margin,
    errorCorrectionLevel: defaults.errorCorrectionLevel,
  })

  // ── Toolbar ─────────────────────────────────────────────────────────
  const toolbar = createToolbar({
    async onCopy() {
      error.value = null
      if (!dataUrl.value) {
        error.value = 'No QR code to copy'
        return
      }
      try {
        if (!navigator.clipboard || !window.ClipboardItem) {
          error.value = 'Copy image is not supported in this environment.'
          return
        }
        const blob = await fetch(dataUrl.value).then(res => res.blob())
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to copy image'
      }
    },
    onClear() {
      input.value = ''
      dataUrl.value = null
      error.value = null
      stats.value = null
    },
    onSwap() { /* QR code is generator-only, no swap */ },
  })

  // ── Actions ─────────────────────────────────────────────────────────

  async function execute() {
    error.value = null
    dataUrl.value = null
    stats.value = null

    const validation = validateQrInput(input.value)
    if (!validation.valid) {
      error.value = validation.message
      return
    }

    loading.value = true
    try {
      const result = await generateQrCode(input.value, options.value)
      if (result.success && result.dataUrl) {
        dataUrl.value = result.dataUrl
        stats.value = getQrStats(input.value, options.value)
        feature.recordHistory()
      } else {
        error.value = result.error || 'Failed to generate QR code.'
      }
    } catch (e) {
      error.value = (e as Error).message || 'Failed to generate QR code.'
    } finally {
      loading.value = false
    }
  }

  function downloadPng() {
    if (!dataUrl.value) return
    const link = document.createElement('a')
    link.href = dataUrl.value
    link.download = 'qr-code.png'
    link.click()
  }

  function updateOption<K extends keyof QrCodeOptions>(key: K, value: QrCodeOptions[K]) {
    options.value = normalizeQrOptions({ ...options.value, [key]: value })
    // Re-generate if there's input
    if (input.value.trim()) {
      execute()
    }
  }

  function loadExample() {
    input.value = SAMPLE_INPUT
    dataUrl.value = null
    error.value = null
    stats.value = null
    execute()
  }

  // ── Lifecycle ───────────────────────────────────────────────────────
  async function init() {
    await feature.initialize()
    await feature.activate()
  }

  function dispose() {
    feature.deactivate()
  }

  return {
    // State
    input, dataUrl, error, loading, stats, options,
    // Toolbar
    toolbar,
    // Actions
    execute, downloadPng, updateOption, loadExample, init, dispose,
  }
}
