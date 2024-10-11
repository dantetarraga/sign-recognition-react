import { useState, useRef, useEffect } from 'react'
import { Camera, AlertCircle, MessageSquare } from 'lucide-react'

interface TranslationEntry {
  text: string;
  timestamp: Date;
}

function App() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recognitionSignal, setRecognitionSignal] = useState<boolean>(false)
  const [translationHistory, setTranslationHistory] = useState<TranslationEntry[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const startStream = async () => {
      try {
        const userMedia = await navigator.mediaDevices.getUserMedia({ video: true })
        setStream(userMedia)
      } catch (error) {
        console.error('Error accessing camera:', error)
      }
    }

    startStream()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Simulate recognition signal and add to history
  useEffect(() => {
    const interval = setInterval(() => {
      setRecognitionSignal(prev => !prev)
      const newEntry: TranslationEntry = {
        text: recognitionSignal ? 'Hello, how are you?' : 'Hola, ¿cómo estás?',
        timestamp: new Date()
      }
      setTranslationHistory(prev => [...prev, newEntry])
    }, 3000)

    return () => clearInterval(interval)
  }, [recognitionSignal])

  // Scroll to bottom of history when new entry is added
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [translationHistory])

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto rounded-lg"
            />
            <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-50 p-2 rounded-full">
              <Camera className="text-white" size={24} />
            </div>
            {recognitionSignal && (
              <div className="absolute bottom-4 right-4 bg-green-500 bg-opacity-75 p-2 rounded-full animate-pulse">
                <AlertCircle className="text-white" size={24} />
              </div>
            )}
          </div>
          <p className="text-white mt-4 text-center">
            {recognitionSignal ? 'Signal Detected' : 'No Signal'}
          </p>
        </div>
      </div>
      <div className="w-1/3 bg-gray-800 p-6 flex flex-col overflow-hidden">
        <h2 className="text-white text-2xl mb-4 flex items-center">
          <MessageSquare className="mr-2" />
          History
        </h2>
        <div ref={historyRef} className="flex-1 bg-gray-700 rounded-lg p-4 h-screen overflow-y-auto">
          {translationHistory.map((entry, index) => (
            <div key={index} className="mb-2 last:mb-0">
              <p className="text-white">{entry.text}</p>
              <p className="text-gray-400 text-xs">
                {entry.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App