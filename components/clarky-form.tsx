'use client'

import { useEffect, useRef } from 'react'

interface ClarkyFormProps {
  formId: string
}

export function ClarkyForm({ formId }: ClarkyFormProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    const container = containerRef.current
    if (!container) return

    // Clarky's CSS for the form
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://clarky.ai/form/${formId}/embed.css`
    document.head.appendChild(link)

    // Clarky's embed script, told which container to inject into
    const script = document.createElement('script')
    script.src = `https://clarky.ai/form/${formId}/embed.js`
    script.setAttribute('data-container', container.id)
    script.async = true
    container.appendChild(script)

    return () => {
      loadedRef.current = false
      link.remove()
      script.remove()
      if (container) container.innerHTML = ''
    }
  }, [formId])

  return <div id={`clarky-form-${formId}`} ref={containerRef} className="w-full" />
}
