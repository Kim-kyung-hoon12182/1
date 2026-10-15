const MODEL = 'gemini-3.5-flash-lite'
// 자료 8,000자에 문장 번호, 규칙·질문 답변·예전 결과·고친 내용·지시 문장이 더해진 요청 전체의 한도(화면의 lib/limits.ts REQUEST_MAX_CHARS와 같은 값).
// 시험(docs/test-report.md 54번): 자료 8,000자 요청은 약 9,800자이고, 규칙을 많이 더해도 이 안에서 시간은 거의 늘지 않는다.
const MAX_INPUT_CHARS = 16000
// 구글이 느릴 때 화면이 계속 기다리지 않도록, 재시도까지 합쳐 이 시간 안에 끝낸다.
// 자료 8,000자를 문장마다 한 줄로 옮기면 약 24초가 걸리고 30초 제한에 걸려 실패하기도 했다(시험 54번). Vercel 함수 제한은 vercel.json의 60초다.
const TOTAL_TIMEOUT_MS = 50_000
// 수요가 몰려서(503) 또는 한도에 걸려서(429) 실패하면 잠깐 쉬었다가 다시 보낸다
const RETRY_STATUSES = [503, 429]
const RETRY_DELAYS_MS = [1000, 2000]

type GenerateBody = {
  prompt?: unknown
  json?: unknown
}

type ErrorCode = 'no_key' | 'rate_limit' | 'upstream' | 'bad_request'

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

const fail = (status: number, code: ErrorCode, error: string) => json(status, { error, code })

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return fail(500, 'no_key', 'GEMINI_API_KEY가 설정되지 않았어요.')
  }

  let body: GenerateBody
  try {
    body = (await request.json()) as GenerateBody
  } catch {
    return fail(400, 'bad_request', '요청 형식이 올바르지 않아요.')
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
  if (!prompt) {
    return fail(400, 'bad_request', '내용을 입력해 주세요.')
  }
  if (prompt.length > MAX_INPUT_CHARS) {
    return fail(400, 'bad_request', '요청이 너무 길어요. 자료나 규칙을 줄여 주세요.')
  }

  const deadline = Date.now() + TOTAL_TIMEOUT_MS
  const requestBody = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    ...(body.json === true && { generationConfig: { responseMimeType: 'application/json' } }),
  })

  let upstream: Response
  try {
    for (let attempt = 0; ; attempt++) {
      upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: requestBody,
        signal: AbortSignal.timeout(Math.max(deadline - Date.now(), 1)),
      })
      const delay = RETRY_DELAYS_MS[attempt]
      if (!RETRY_STATUSES.includes(upstream.status) || delay === undefined || Date.now() + delay >= deadline) break
      console.warn(`Gemini ${upstream.status}, retry ${attempt + 1} in ${delay}ms`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  } catch {
    return fail(504, 'upstream', 'AI 응답이 너무 늦어요. 잠시 뒤 다시 시도해 주세요.')
  }

  if (upstream.status === 429) {
    return fail(429, 'rate_limit', '지금 사용하는 사람이 많아요. 1분 뒤에 다시 시도해 주세요.')
  }
  if (!upstream.ok) {
    const detail = await upstream.text()
    console.error('Gemini error', upstream.status, detail)
    return fail(502, 'upstream', 'AI 응답을 받지 못했어요. 잠시 뒤 다시 시도해 주세요.')
  }

  let data: { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  try {
    data = (await upstream.json()) as typeof data
  } catch {
    return fail(504, 'upstream', 'AI 응답이 너무 늦어요. 잠시 뒤 다시 시도해 주세요.')
  }
  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('') ?? ''

  return json(200, { text })
}
