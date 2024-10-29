'use client'

import { useState } from 'react'
import { VideoTemplate } from '@/lib/VideoTemplate'

interface VoiceSelectorProps {
  template: VideoTemplate
  onVoiceSelect: (voiceId: string) => void
}

export default function VoiceSelector({ template, onVoiceSelect }: VoiceSelectorProps) {
  const defaultVoiceId = template?.voicePresets?.[0]?.id ?? '';
  const [selectedVoice, setSelectedVoice] = useState(defaultVoiceId);

  if (!template?.voicePresets?.length) {
    return null;
  }

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId)
    onVoiceSelect(voiceId)
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Select Voice</label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {template.voicePresets.map((voice) => (
          <button
            key={voice.id}
            onClick={() => handleVoiceChange(voice.id)}
            className={`p-4 rounded-lg border text-left transition-all duration-200 ${
              selectedVoice === voice.id
                ? 'border-primary bg-primary/20 shadow-lg shadow-primary/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-primary hover:bg-gray-50 dark:hover:bg-black/50'
            }`}
          >
            <h3 className="font-medium text-gray-900 dark:text-white">{voice.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{voice.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
