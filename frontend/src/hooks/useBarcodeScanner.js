import { useEffect, useRef, useCallback } from 'react'

/**
 * Global barcode scanner hook.
 *
 * USB HID scanners type characters very fast (all chars within ~50ms)
 * then send an Enter keystroke. Human typing is much slower (>50ms between keys).
 *
 * This hook listens globally on `window`, buffers keystrokes, and fires
 * `onScan(barcode)` when a complete scan is detected.
 *
 * @param {function} onScan   - called with the scanned barcode string
 * @param {boolean}  enabled  - set false to pause listening
 */
export function useBarcodeScanner(onScan, enabled = true) {
  const bufferRef   = useRef('')       // accumulated characters
  const lastKeyRef  = useRef(0)        // timestamp of last keydown
  const timerRef    = useRef(null)     // flush timeout

  // Min chars for a valid barcode (our format: "TSH-0002|TSH-0002-XXXL" = 22 chars)
  const MIN_LENGTH  = 6
  // Max ms between keystrokes to be considered a scanner (not human)
  const SCAN_SPEED  = 50

  const flush = useCallback(() => {
    const value = bufferRef.current.trim()
    bufferRef.current = ''
    if (value.length >= MIN_LENGTH) {
      onScan(value)
    }
  }, [onScan])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input / textarea / contenteditable
      // EXCEPT on the New Sale page search input — that handles itself
      const tag = document.activeElement?.tagName?.toLowerCase()
      const isEditable = (
        (tag === 'input' && document.activeElement?.type !== 'submit') ||
        tag === 'textarea' ||
        document.activeElement?.isContentEditable
      )

      // If user is typing in any input that is NOT the new-sale search,
      // don't intercept — let the input handle it normally.
      // We only want to intercept when no input is focused (scanner fires
      // into the void) OR when we're already on the new-sale page (handled
      // by the page itself).
      if (isEditable) return

      const now = Date.now()
      const gap = now - lastKeyRef.current
      lastKeyRef.current = now

      // If gap is too large, this is a new sequence — reset buffer
      if (gap > SCAN_SPEED * 3 && bufferRef.current.length > 0) {
        bufferRef.current = ''
      }

      if (e.key === 'Enter') {
        // Scanner finished — flush immediately
        clearTimeout(timerRef.current)
        flush()
        return
      }

      // Only accumulate printable single characters
      if (e.key.length === 1) {
        bufferRef.current += e.key
      }

      // Auto-flush after 100ms of silence (handles scanners without Enter)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(flush, 100)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timerRef.current)
    }
  }, [enabled, flush])
}
