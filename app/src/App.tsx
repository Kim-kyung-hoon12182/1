import { useState } from 'react'

export default function App() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function checkConnection() {
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: '한 문장으로 인사해 줘.' }),
      })
      const data = (await res.json()) as { text?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? '연결에 실패했어요.')
      setStatus('ok')
      setMessage(data.text ?? '')
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : '연결에 실패했어요.')
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-xl px-6 py-20">
        <p className="text-sm text-stone-500">준비 중</p>
        <h1 className="mt-2 text-2xl font-semibold">반복 업무 AI 템플릿</h1>
        <p className="mt-3 text-stone-600">
          반복하는 일을 한 번 등록하면, 쓸수록 믿을 만해지는 AI 템플릿을 만들어 드려요.
        </p>

        <button
          type="button"
          onClick={checkConnection}
          disabled={status === 'loading'}
          className="mt-10 rounded-lg bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {status === 'loading' ? '확인 중…' : 'AI 연결 확인'}
        </button>

        {message && (
          <p
            className={`mt-4 rounded-lg p-3 text-sm ${
              status === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  )
}
