const MODEL = 'gemini-3.8-flash'
const MAX_INPUT_CHARS = 8000

type GenerateBody = {
  prompt?: unknown
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return json(500, { error: 'GEMINI_API_KEY가 설정되지 않았어요.' })
  }

  let body: GenerateBody
  try {
    body = (await request.json()) as GenerateBody
  } catch {
    return json(400, { error: '요청 형식이 올바르지 않아요.' })
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  if (!prompt) {
    return json(400, { error: '내용을 입력해 주세요.' })
  }
  if (prompt.length > MAX_INPUT_CHARS) {
    return json(400, { error: `입력은 ${MAX_INPUT_CHARS}자까지 가능해요.` })
  }

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    },
  )

  if (upstream.status === 429) {
    return json(429, { error: '지금 사용하는 사람이 많아요. 1분 뒤에 다시 시도해 주세요.' })
  }
  if (!upstream.ok) {
    const detail = await upstream.text()
    console.error('Gemini error', upstream.status, detail)
    return json(502, { error: 'AI 응답을 받지 못했어요. 잠시 뒤 다시 시도해 주세요.' })
  }

  const data = (await upstream.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('') ?? ''

  return json(200, { text })
}
