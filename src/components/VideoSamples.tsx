"use client"

import { useEffect, useState } from "react"

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

interface VideoSamplesProps {
  samples: string[]
}

export default function VideoSamples({ samples }: VideoSamplesProps) {
  const [activeSampleIndex, setActiveSampleIndex] = useState<number | null>(null)

  useEffect(() => {
    if (samples.length) {
      randomSample()
      const interval = setInterval(() => {
        randomSample()
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [samples])

  function randomSample() {
    const random = randomIntFromInterval(0, samples.length - 1)
    setActiveSampleIndex(random)
  }

  return (
    <div className="py-4">
      <div className="text-gray-500 w-[240px] h-[380px] relative">
        {samples?.length > 0 && samples.map((sample, samplesKey) => (
          <video
            key={sample}
            playsInline={true}
            muted={true}
            controls={false}
            loop={true}
            autoPlay={true}
            className="shadow-4xl shadow-sky-400 rounded-2xl overflow-hidden absolute top-2 transition-all duration-300"
            style={{
              opacity: samplesKey === activeSampleIndex ? "1" : "0",
              transform: "scaleX(1) scaleY(1) scaleZ(1) rotateX(0deg) rotateY(0deg) rotateZ(3deg) translateX(0px) translateY(0px) translateZ(0px) skewX(0deg) skewY(0deg)"
            }}
            src={`/videos/${sample}/final.mp4`}
          />
        ))}
      </div>
    </div>
  )
}