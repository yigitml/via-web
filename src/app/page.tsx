// app/page.tsx
'use client'

import { useState } from 'react'
import { videoTemplates } from '@/lib/VideoTemplate'
import VoiceSelector from '@/components/VoiceSelector'

export default function Home() {
  const [content, setContent] = useState('')
  const [templateId, setTemplateId] = useState('tiktok-story')
  const [voiceId, setVoiceId] = useState('MIyORLtrtKBPcRoq8h51')
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
          content: content,
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
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">URL to Video AI</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Custom Prompt Input */}
        <div>
          <label className="block text-sm mb-2">Custom Prompt</label>
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full p-2 rounded border bg-transparent"
            placeholder="Enter your custom prompt here..."
            required
          />
        </div>

        {/* Template Selection */}
        <div>
          <label className="block text-sm mb-2">Video Template</label>
          <select
            value={templateId}
            onChange={e => setTemplateId(e.target.value)}
            className="w-full p-2 rounded border bg-transparent"
          >
            {videoTemplates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </div>

        {/* Voice Selection */}
        <VoiceSelector 
          template={selectedTemplate}
          onVoiceSelect={setVoiceId}
        />

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full bg-emerald-500 text-white py-2 rounded-full disabled:opacity-50"
        >
          {isGenerating ? 'Generating Video...' : 'Generate Video'}
        </button>
      </form>
    </main>
  )
}
