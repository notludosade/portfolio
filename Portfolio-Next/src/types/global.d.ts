export {}

declare global {
  interface Window {
    setStarBrightness: (b: number) => void
    updateStarMouseTarget: (x: number, y: number) => void
    setSnow: (on: boolean) => void
  }
}
