import { useEffect } from 'react'

const APP_NAME = '또시켰네'

// 브라우저 탭 제목을 화면에 맞게 바꾼다
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
  }, [title])
}
