import { vi } from 'vitest'

global.jQuery = vi.fn(() => ({
  on: vi.fn(),
  off: vi.fn(),
  bind: vi.fn(),
  unbind: vi.fn(),
  trigger: vi.fn(),
  addClass: vi.fn(),
  removeClass: vi.fn(),
  css: vi.fn(),
  attr: vi.fn(),
  prop: vi.fn(),
  val: vi.fn(),
  html: vi.fn(),
  text: vi.fn(),
  append: vi.fn(),
  remove: vi.fn(),
  show: vi.fn(),
  hide: vi.fn(),
  each: vi.fn(),
  find: vi.fn(),
  closest: vi.fn(),
  parent: vi.fn(),
  children: vi.fn(),
  siblings: vi.fn(),
  data: vi.fn(),
  width: vi.fn(),
  height: vi.fn(),
  offset: vi.fn(() => ({ top: 0, left: 0 })),
  position: vi.fn(() => ({ top: 0, left: 0 })),
  scrollTop: vi.fn(),
  scrollLeft: vi.fn(),
  get: vi.fn(() => []),
  length: 0,
  0: undefined,
}))

global.$ = global.jQuery

class MockCanvas {
  constructor() {
    this.getContext = vi.fn(() => ({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: [] })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({ data: [] })),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      rect: vi.fn(),
      clip: vi.fn(),
      font: '',
      fillStyle: '',
      strokeStyle: '',
      textAlign: '',
      textBaseline: '',
      globalAlpha: 1,
      lineWidth: 1,
      lineCap: '',
      lineJoin: '',
    }))
    this.width = 0
    this.height = 0
    this.style = {}
    this.toDataURL = vi.fn(() => '')
    this.addEventListener = vi.fn()
    this.removeEventListener = vi.fn()
  }
}

HTMLCanvasElement.prototype.getContext = function () {
  if (!this._context) {
    this._context = new MockCanvas().getContext()
  }
  return this._context
}
