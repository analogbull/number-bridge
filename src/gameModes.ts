export type GameMode = 'SUM2' | 'ADD2_SUB2'

export const MODE_CONFIG: Record<GameMode, {
  requiredCount: number
  operators: ('+' | '-')[]
  label: string
  hudLabel: string
}> = {
  SUM2: { requiredCount: 2, operators: ['+'], label: '两块相加（a+b）', hudLabel: 'Mode: a+b' },
  ADD2_SUB2: { requiredCount: 4, operators: ['+', '-', '-'], label: '四块加减（a+b−c−d）', hudLabel: 'Mode: a+b−c−d' },
}
