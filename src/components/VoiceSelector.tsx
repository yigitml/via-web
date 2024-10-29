'use client'

import { useState } from 'react'
import { VideoTemplate } from '@/lib/videoTemplates'

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
      <label className="block text-sm font-medium">Select Voice</label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {template.voicePresets.map((voice) => (
          <button
            key={voice.id}
            onClick={() => handleVoiceChange(voice.id)}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              selectedVoice === voice.id
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <h3 className="font-medium">{voice.name}</h3>
            <p className="text-sm text-gray-400">{voice.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
