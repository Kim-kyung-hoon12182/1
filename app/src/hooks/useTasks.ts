import { useState } from 'react'
import { createDemoTask } from '@/data/sampleTasks'
import { loadDemo, loadTasks, saveDemo, saveTasks } from '@/lib/storage'
import type { Rule, Run, Task } from '@/types/task'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [demo, setDemo] = useState<Task>(() => loadDemo() ?? createDemoTask())
  const [saveFailed, setSaveFailed] = useState(false)

  function addTask(task: Task) {
    const next = [...tasks, task]
    setTasks(next)
    setSaveFailed(!saveTasks(next))
  }

  function resetDemo() {
    const fresh = createDemoTask()
    setDemo(fresh)
    setSaveFailed(!saveDemo(fresh))
  }

  // 실행 기록 확정 (F-06). 체험용 작업의 기록은 실제 작업과 섞이지 않게 체험용 저장소에만 남긴다.
  function addRun(taskId: string, run: Run) {
    if (taskId === demo.id) {
      const next = { ...demo, runs: [...demo.runs, run] }
      setDemo(next)
      setSaveFailed(!saveDemo(next))
      return
    }
    const next = tasks.map((task) => (task.id === taskId ? { ...task, runs: [...task.runs, run] } : task))
    setTasks(next)
    setSaveFailed(!saveTasks(next))
  }

  // 작업 하나를 고쳐 저장한다. 체험용 작업은 체험용 저장소에만 쓴다.
  function updateTask(taskId: string, change: (task: Task) => Task) {
    if (taskId === demo.id) {
      const next = change(demo)
      setDemo(next)
      setSaveFailed(!saveDemo(next))
      return
    }
    const next = tasks.map((task) => (task.id === taskId ? change(task) : task))
    setTasks(next)
    setSaveFailed(!saveTasks(next))
  }

  // 규칙 보기·고치기 (S6)와 고친 내용에서 만든 규칙 추가 (S4, F-05)
  const addRule = (taskId: string, rule: Rule) => updateTask(taskId, (task) => ({ ...task, rules: [...task.rules, rule] }))
  const updateRule = (taskId: string, ruleId: string, text: string) =>
    updateTask(taskId, (task) => ({ ...task, rules: task.rules.map((rule) => (rule.id === ruleId ? { ...rule, text } : rule)) }))
  const removeRule = (taskId: string, ruleId: string) =>
    updateTask(taskId, (task) => ({ ...task, rules: task.rules.filter((rule) => rule.id !== ruleId) }))

  // 직접 만든 작업만 지운다. 체험용 작업은 [체험 초기화]로 되돌린다.
  function removeTask(taskId: string) {
    const next = tasks.filter((task) => task.id !== taskId)
    setTasks(next)
    setSaveFailed(!saveTasks(next))
  }

  const findTask = (id: string) => (id === demo.id ? demo : tasks.find((task) => task.id === id))

  return { tasks, demo, saveFailed, addTask, addRun, addRule, updateRule, removeRule, removeTask, resetDemo, findTask }
}
