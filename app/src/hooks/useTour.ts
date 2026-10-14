import { useEffect, useState } from 'react'
import { loadOnboarded, saveOnboarded, type Onboarded } from '@/lib/storage'
import { TOUR_LOST_MS, TOUR_STEPS, type TourScreen } from '@/lib/tour'

// 안내 모드의 진행 상태. index가 null이면 꺼짐, 단계 수와 같으면 마무리 카드.
export function useTour(screen: TourScreen | 'create' | 'history') {
  const [status, setStatus] = useState<Onboarded | null>(() => loadOnboarded())
  const [index, setIndex] = useState<number | null>(null)
  const running = index !== null
  const step = index !== null ? (TOUR_STEPS[index] ?? null) : null
  const atEnd = index === TOUR_STEPS.length

  const start = () => setIndex(0)
  const next = () => setIndex((i) => (i === null ? null : i + 1))

  const stop = (result: Onboarded) => {
    setIndex(null)
    setStatus(result)
    saveOnboarded(result)
  }

  // 지금 단계의 요소를 사용자가 누르면 다음 단계로. 화면의 누름 동작이 끝난 뒤에 넘어간다.
  useEffect(() => {
    // 키로 넘어가는 단계(입력칸)는 클릭으로 넘기지 않는다. 입력칸을 눌러 커서를 두는 건 자연스러운 동작이다.
    if (!step || step.advanceKey || step.manual) return
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest(step.advanceOn ?? step.target)) {
        window.setTimeout(() => setIndex((i) => (i === null ? null : i + 1)), 0)
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [step])

  // 입력칸 단계에서 칸이 다른 길로 닫히면(바깥을 누르는 등 포커스가 빠진 경우) Enter를 기다리지 않고 다음 단계로 넘어간다.
  // 칸이 사라진 채로 두면 안내가 가리킬 곳을 잃고 끝내야 하는 상태가 된다.
  useEffect(() => {
    if (!step?.advanceKey) return
    const { target } = step
    let missing = 0
    const timer = window.setInterval(() => {
      missing = document.querySelector(target) ? 0 : missing + 1
      if (missing >= 2) setIndex((i) => (i === null ? null : i + 1))
    }, 250)
    return () => window.clearInterval(timer)
  }, [step])

  // 입력칸처럼 누를 곳이 없는 단계는 정해 둔 키로 넘어간다
  useEffect(() => {
    if (!step?.advanceKey) return
    const { advanceKey, target } = step
    const onKey = (event: KeyboardEvent) => {
      if (event.key === advanceKey && !event.isComposing && event.target instanceof Element && event.target.closest(target)) {
        window.setTimeout(() => setIndex((i) => (i === null ? null : i + 1)), 0)
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [step])

  useEffect(() => {
    if (!running) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') stop('skipped')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [running])

  // 안내하는 화면이 아닌 곳에 오래 있으면(뒤로가기, 주소 바꾸기) 안내를 끝낸다
  useEffect(() => {
    if (!step || screen === step.screen) return
    const timer = window.setTimeout(() => stop('skipped'), TOUR_LOST_MS / 2)
    return () => window.clearTimeout(timer)
  }, [step, screen])

  return { status, running, step, atEnd, index, total: TOUR_STEPS.length, start, next, stop }
}
