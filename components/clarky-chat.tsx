'use client'

import { useEffect } from 'react'

export function ClarkyChat() {
  useEffect(() => {
    const existing = document.getElementById('clarky-chat-embed')
    if (existing) return

    const script = document.createElement('script')
    script.id = 'clarky-chat-embed'
    script.src = 'https://clarky.ai/embed/33ef37a6-c826-42de-b00c-bbd4b12bc167/chat.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  return null
}
