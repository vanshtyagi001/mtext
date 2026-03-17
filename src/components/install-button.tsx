'use client'

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isIosDevice() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandaloneMode() {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIos(isIosDevice())
    setIsStandalone(isStandaloneMode())

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const onInstalled = () => {
      setDeferredPrompt(null)
      setIsInstallable(false)
      setIsStandalone(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (isStandalone) return null

  const onInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice

      if (choice.outcome === 'accepted') {
        setIsInstallable(false)
      }

      setDeferredPrompt(null)
      return
    }

    if (isIos) {
      alert('To install mText on iPhone/iPad: tap Share, then choose Add to Home Screen.')
    }
  }

  if (!isInstallable && !isIos) return null

  return (
    <button
      type="button"
      onClick={onInstallClick}
      className="fixed bottom-4 right-4 z-40 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--accent-strong)]"
      aria-label="Install mText"
    >
      Install App
    </button>
  )
}
