export const SAVE_KEY = 'stark-academy-v1'

export function exportSave(): string {
  const data = localStorage.getItem(SAVE_KEY)
  if (!data) return ''
  return btoa(unescape(encodeURIComponent(data)))
}

export function importSave(encoded: string): boolean {
  try {
    const decoded = decodeURIComponent(escape(atob(encoded.trim())))
    const parsed = JSON.parse(decoded)
    if (!parsed?.state?.progress) return false
    localStorage.setItem(SAVE_KEY, decoded)
    return true
  } catch {
    return false
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
}
