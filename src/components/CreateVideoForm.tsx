

// components/CreateVideoForm.tsx
import { FormEvent } from "react"

interface CreateVideoFormProps {
  url: string
  onUrlChange: (url: string) => void
  onSubmit: (ev: FormEvent) => void
}

export default function CreateVideoForm({ url, onUrlChange, onSubmit }: CreateVideoFormProps) {
  return (
    <form onSubmit={onSubmit} className="grid gap-2">
      <input
        className="border-2 rounded-full bg-transparent text-white px-4 py-2 grow"
        value={url}
        onChange={ev => onUrlChange(ev.target.value)}
        type="url" 
        placeholder="https://..."
      />
      <button
        className="bg-emerald-500 text-white px-4 py-2 rounded-full uppercase"
        type="submit"
      >
        Create&nbsp;video
      </button>
    </form>
  )
}
