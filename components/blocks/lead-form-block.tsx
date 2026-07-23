'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle } from 'lucide-react'
import type { BlockProps, LeadFormContent } from './types'

export function LeadFormBlock({ content, tenant }: BlockProps<LeadFormContent>) {
  const { heading, subheading, sourceKey, subjectTypes = [], showMessage = true } = content
  
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('loading')
    setErrorMessage('')
    
    const formData = new FormData(e.currentTarget)
    const data = {
      tenant_id: tenant.id,
      source: sourceKey,
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject_type: formData.get('subject_type'),
      message: formData.get('message'),
    }
    
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!res.ok) {
        throw new Error('Failed to submit form')
      }
      
      setFormState('success')
    } catch {
      setFormState('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }
  
  if (formState === 'success') {
    return (
      <section className="py-16 md:py-24 bg-[var(--color-surface)]">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 font-[var(--font-heading)] text-[var(--color-foreground)]">
              Thank You!
            </h2>
            <p className="text-[var(--color-muted)]">
              We&apos;ve received your information and will be in touch soon.
            </p>
          </div>
        </div>
      </section>
    )
  }
  
  return (
    <section className="py-16 md:py-24 bg-[var(--color-surface)]">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {(heading || subheading) && (
            <div className="text-center mb-8">
              {heading && (
                <h2 className="text-3xl font-bold mb-2 font-[var(--font-heading)] text-[var(--color-foreground)]">
                  {heading}
                </h2>
              )}
              {subheading && (
                <p className="text-[var(--color-muted)]">{subheading}</p>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                required
                className="bg-[var(--color-background)] border-[var(--color-border)]"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="bg-[var(--color-background)] border-[var(--color-border)]"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                className="bg-[var(--color-background)] border-[var(--color-border)]"
              />
            </div>
            
            {subjectTypes.length > 0 && (
              <div>
                <Label htmlFor="subject_type">I&apos;m interested in</Label>
                <select
                  id="subject_type"
                  name="subject_type"
                  className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
                >
                  <option value="">Select an option</option>
                  {subjectTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            )}
            
            {showMessage && (
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="bg-[var(--color-background)] border-[var(--color-border)]"
                />
              </div>
            )}
            
            {formState === 'error' && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
            
            <Button
              type="submit"
              disabled={formState === 'loading'}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white"
            >
              {formState === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
