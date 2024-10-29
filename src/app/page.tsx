// app/page.tsx
'use client'

import { useState } from 'react'
import { videoTemplates } from '@/lib/VideoTemplate'
import VoiceSelector from '@/components/VoiceSelector'
import { formatText } from '@/components/formatText'

export default function Home() {
  const [content, setContent] = useState('')
  const [templateId, setTemplateId] = useState('short-story')
  const [voiceId, setVoiceId] = useState('Ee5YWIlXJUU6vS43Ogfs')
  const [isGenerating, setIsGenerating] = useState(false) 
  
  const selectedTemplate = videoTemplates.find(t => t.id === templateId)!

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/create-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: formatText(content),
          templateId,
          voiceId,
        }),
      })
      
      const data = await response.json();

      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        console.error('No URL returned', data);
      } 
    } catch (error) {
      console.error('Create video error', error);
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-8 min-h-screen">
      <h1 className="text-4xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light">
        Via: Your AI Content Creator
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium mb-2 text-secondary">Custom Prompt</label>
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full p-4 rounded-lg border border-primary bg-white/50 dark:bg-black/50 focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-colors"
            placeholder="Enter your custom prompt here..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Video Template</label>
          <select
            value={templateId}
            onChange={e => setTemplateId(e.target.value)}
            className="w-full p-4 rounded-lg border border-primary bg-white/50 dark:bg-black/50 focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-colors"
          >
            {videoTemplates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </div>

        <VoiceSelector 
          template={selectedTemplate}
          onVoiceSelect={(voice) => {
            setVoiceId(voice);
            event?.preventDefault();
          }}
        />

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full bg-primary text-white py-4 rounded-lg font-medium hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-8 shadow-lg shadow-primary/20"
        >
          {isGenerating ? 'Generating Video...' : 'Generate Video'}
        </button>
      </form>
    </main>
  )
}
