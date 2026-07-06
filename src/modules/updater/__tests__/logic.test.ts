/**
 * Updater Logic — Unit Tests
 *
 * Tests for pure utility functions: formatBytes, formatProgress, statusMessage.
 */
import { describe, it, expect } from 'vitest'
import { formatBytes, formatProgress, statusMessage } from '../logic'

describe('formatBytes', () => {
  it('returns "0 B" for zero', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('returns "0 B" for negative values', () => {
    expect(formatBytes(-1)).toBe('0 B')
    expect(formatBytes(-100)).toBe('0 B')
  })

  it('formats bytes without decimal', () => {
    expect(formatBytes(1)).toBe('1 B')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1023)).toBe('1023 B')
  })

  it('formats KB with one decimal', () => {
    expect(formatBytes(1024)).toBe('1.0 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(10240)).toBe('10.0 KB')
  })

  it('formats MB with one decimal', () => {
    expect(formatBytes(1048576)).toBe('1.0 MB')
    expect(formatBytes(10485760)).toBe('10.0 MB')
    expect(formatBytes(15728640)).toBe('15.0 MB')
  })

  it('formats GB with one decimal', () => {
    expect(formatBytes(1073741824)).toBe('1.0 GB')
    expect(formatBytes(2147483648)).toBe('2.0 GB')
  })

  it('caps at GB for very large values', () => {
    const terabytes = 1099511627776 // 1 TB
    expect(formatBytes(terabytes)).toBe('1024.0 GB')
  })
})

describe('formatProgress', () => {
  it('returns 0 for zero total', () => {
    expect(formatProgress(0, 0)).toBe(0)
    expect(formatProgress(50, 0)).toBe(0)
  })

  it('returns 0 for negative downloaded', () => {
    expect(formatProgress(-1, 100)).toBe(0)
  })

  it('returns 0 at start', () => {
    expect(formatProgress(0, 100)).toBe(0)
  })

  it('returns 50 at halfway', () => {
    expect(formatProgress(50, 100)).toBe(50)
  })

  it('returns 100 at completion', () => {
    expect(formatProgress(100, 100)).toBe(100)
  })

  it('rounds to nearest integer', () => {
    expect(formatProgress(333, 1000)).toBe(33)
    expect(formatProgress(667, 1000)).toBe(67)
  })

  it('clamps to 0-100 range', () => {
    expect(formatProgress(200, 100)).toBe(100)
    expect(formatProgress(-10, 100)).toBe(0)
  })
})

describe('statusMessage', () => {
  it('returns empty string for idle', () => {
    expect(statusMessage('idle')).toBe('')
  })

  it('returns expected messages for each status', () => {
    expect(statusMessage('checking')).toBe('Checking for updates...')
    expect(statusMessage('up-to-date')).toBe('Up to Date')
    expect(statusMessage('update-available')).toBe('Update Available')
    expect(statusMessage('downloading')).toBe('Downloading...')
    expect(statusMessage('ready-to-install')).toBe('Ready to Install')
    expect(statusMessage('installing')).toBe('Installing...')
    expect(statusMessage('error')).toBe('Update Error')
  })
})
