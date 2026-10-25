export function freezeWheel(svg: SVGSVGElement): number {
  const matrix = new DOMMatrixReadOnly(getComputedStyle(svg).transform)
  const angle = ((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI + 360) % 360
  svg.getAnimations().forEach((animation) => animation.cancel())
  svg.style.transform = `rotate(${angle}deg)`
  return angle
}
