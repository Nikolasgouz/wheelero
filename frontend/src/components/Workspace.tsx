import { useLayoutEffect, useRef, type ReactNode } from 'react'

// Measure actual chrome, including translated headings, instead of assuming a fixed header height.
export function Workspace({ screen, children }: { screen: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const workspace = ref.current!
    function resize() {
      const available = Math.max(
        360,
        innerHeight - workspace.getBoundingClientRect().top - scrollY - 16,
      )
      const heading = workspace.querySelector('.wheel-top')!.getBoundingClientRect().height
      const bottom = workspace.querySelector('.wheel-bottom')!.getBoundingClientRect().height
      workspace.style.setProperty('--tool-height', `${available}px`)
      workspace.style.setProperty(
        '--wheel-diameter',
        `${Math.max(240, available - heading - bottom - 24)}px`,
      )
    }
    const observer = new ResizeObserver(resize)
    for (const element of document.querySelectorAll(
      '.topbar, .site-intro, .tool-navigation, .number-range, .wheel-top, .wheel-bottom',
    ))
      observer.observe(element)
    window.addEventListener('resize', resize)
    resize()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [screen])
  return (
    <div ref={ref} className={`workspace mobile-${screen}`}>
      {children}
    </div>
  )
}
