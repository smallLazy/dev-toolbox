export interface ToolAction {
  id: string
  label: string
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  busy?: boolean
  shortcut?: string
  ariaLabel?: string
}
