# jQuery UI 替换方案

> 本文档分析 Luckysheet 中 jQuery UI 的使用情况，并提供基于原生 DOM 的 TypeScript 替换实现。

---

## 1. jQuery UI 使用分析

### 1.1 当前状态

经过完整代码扫描，jQuery UI 在 Luckysheet 业务代码中的直接使用情况如下：

| jQuery UI 组件 | 业务代码中使用次数 | 说明 |
|---------------|-------------------|------|
| `.draggable()` | 0 | 未使用 |
| `.resizable()` | 0 | 未使用 |
| `.sortable()` | 0 | 未使用 |
| `.dialog()` | 0 | 未使用 |
| `.tabs()` | 0 | 未使用 |
| `.datepicker()` | 0 | 未使用 |
| `.autocomplete()` | 0 | 未使用 |
| `.button()` | 0 | 未使用 |
| `.slider()` | 0 | 未使用 |

**结论**：jQuery UI 库（`plugins/js/jquery-ui.min.js`）在业务代码中**未被直接调用**。它主要作为 spectrum-colorpicker 的间接依赖存在。

### 1.2 间接依赖

jQuery UI 被引入的原因：
1. **Spectrum 颜色选择器** — 依赖 jQuery UI 的部分功能（如 `$.widget`、`$.ui.keyCode` 等）
2. **历史遗留** — 早期版本可能使用过 jQuery UI 组件，后续已移除

### 1.3 迁移策略

当 Spectrum 被替换为无 jQuery 依赖的方案后，jQuery UI 可完全移除。但考虑到 DDD 重构后可能需要类似功能（对话框、拖拽、缩放等），本文件提供原生 TypeScript 实现，供未来使用。

---

## 2. Modal/Dialog 组件

### 2.1 TypeScript 实现

```typescript
export interface ModalOptions {
  id?: string;
  title?: string;
  content?: string;
  className?: string;
  closable?: boolean;
  maskClosable?: boolean;
  width?: string;
  height?: string;
  onOpen?: () => void;
  onClose?: () => void;
  onConfirm?: () => boolean | void;
  onCancel?: () => void;
  footer?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export class Modal {
  private container: HTMLElement;
  private mask: HTMLElement;
  private dialog: HTMLElement;
  private options: Required<ModalOptions>;

  private static defaultOptions: Required<ModalOptions> = {
    id: `modal-${Date.now()}`,
    title: '',
    content: '',
    className: '',
    closable: true,
    maskClosable: true,
    width: 'auto',
    height: 'auto',
    onOpen: () => {},
    onClose: () => {},
    onConfirm: () => true,
    onCancel: () => {},
    footer: true,
    confirmText: '确认',
    cancelText: '取消',
  };

  constructor(options: ModalOptions) {
    this.options = { ...Modal.defaultOptions, ...options };

    this.mask = document.createElement('div');
    this.mask.className = 'luckysheet-modal-mask';
    this.mask.style.display = 'none';

    this.dialog = document.createElement('div');
    this.dialog.className = `luckysheet-modal-dialog ${this.options.className}`;
    this.dialog.id = this.options.id;
    this.dialog.style.display = 'none';
    this.dialog.style.width = this.options.width;
    this.dialog.style.height = this.options.height;

    this.dialog.innerHTML = this.buildHTML();
    this.container = document.createElement('div');
    this.container.append(this.mask, this.dialog);
    document.body.appendChild(this.container);

    this.bindEvents();
  }

  private buildHTML(): string {
    const { title, content, closable, footer, confirmText, cancelText } = this.options;
    return `
      <div class="luckysheet-modal-dialog-header">
        <span class="luckysheet-modal-dialog-title">${title}</span>
        ${closable ? '<button class="luckysheet-modal-dialog-close" aria-label="关闭">&times;</button>' : ''}
      </div>
      <div class="luckysheet-modal-dialog-body">${content}</div>
      ${footer ? `
        <div class="luckysheet-modal-dialog-footer">
          <button class="luckysheet-modal-dialog-cancel">${cancelText}</button>
          <button class="luckysheet-modal-dialog-confirm">${confirmText}</button>
        </div>
      ` : ''}
    `;
  }

  private bindEvents(): void {
    const closeBtn = this.dialog.querySelector('.luckysheet-modal-dialog-close');
    const cancelBtn = this.dialog.querySelector('.luckysheet-modal-dialog-cancel');
    const confirmBtn = this.dialog.querySelector('.luckysheet-modal-dialog-confirm');

    closeBtn?.addEventListener('click', () => this.close());
    cancelBtn?.addEventListener('click', () => {
      this.options.onCancel();
      this.close();
    });
    confirmBtn?.addEventListener('click', () => {
      const result = this.options.onConfirm();
      if (result !== false) {
        this.close();
      }
    });

    if (this.options.maskClosable) {
      this.mask.addEventListener('click', () => this.close());
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.options.closable) {
        this.close();
      }
    });
  }

  open(): void {
    this.mask.style.display = '';
    this.dialog.style.display = '';
    this.options.onOpen();
  }

  close(): void {
    this.mask.style.display = 'none';
    this.dialog.style.display = 'none';
    this.options.onClose();
  }

  setContent(html: string): void {
    const body = this.dialog.querySelector('.luckysheet-modal-dialog-body');
    if (body) body.innerHTML = html;
  }

  setTitle(text: string): void {
    const titleEl = this.dialog.querySelector('.luckysheet-modal-dialog-title');
    if (titleEl) titleEl.textContent = text;
  }

  destroy(): void {
    this.container.remove();
  }

  getElement(): HTMLElement {
    return this.dialog;
  }
}
```

### 2.2 滑入式面板（Slider Panel）

Luckysheet 中大量使用侧边滑入面板（如搜索替换、条件格式等），对应 `utils/dialogUtils.js` 中的 `createDialog`：

```typescript
export interface SliderPanelOptions {
  id: string;
  title: string;
  content: string;
  addclass?: string;
  botton?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

export class SliderPanel {
  private element: HTMLElement;
  private mask: HTMLElement;
  private options: SliderPanelOptions;

  constructor(options: SliderPanelOptions) {
    this.options = options;

    this.element = document.createElement('div');
    this.element.id = options.id;
    this.element.className = `luckysheet-modal-dialog-slider ${options.addclass || ''}`;
    this.element.style.display = 'none';
    this.element.innerHTML = `
      <div class="luckysheet-modal-dialog-slider-title">${options.title}</div>
      <div class="luckysheet-modal-dialog-slider-content">${options.content}</div>
      <div class="luckysheet-modal-dialog-slider-footer">${options.botton || ''}</div>
    `;

    this.mask = document.createElement('div');
    this.mask.id = 'luckysheet-modal-dialog-mask';
    this.mask.style.display = 'none';

    document.body.append(this.element, this.mask);
    this.bindEvents();
  }

  private bindEvents(): void {
    const closeBtn = this.element.querySelector('.luckysheet-modal-dialog-slider-close');
    closeBtn?.addEventListener('click', () => this.close());

    this.mask.addEventListener('click', () => this.close());
  }

  open(): void {
    this.element.style.display = '';
    this.mask.style.display = '';
    this.options.onOpen?.();
  }

  close(): void {
    this.element.style.display = 'none';
    this.mask.style.display = 'none';
    this.options.onClose?.();
  }

  getElement(): HTMLElement {
    return this.element;
  }

  destroy(): void {
    this.element.remove();
    this.mask.remove();
  }
}
```

---

## 3. Draggable 拖拽组件

### 3.1 TypeScript 实现

```typescript
export interface DraggableOptions {
  handle?: string;
  containment?: HTMLElement | string;
  axis?: 'x' | 'y' | '';
  grid?: [number, number];
  onStart?: (position: { x: number; y: number }) => void;
  onDrag?: (position: { x: number; y: number }) => boolean | void;
  onEnd?: (position: { x: number; y: number }) => void;
}

export class Draggable {
  private element: HTMLElement;
  private handle: HTMLElement;
  private options: DraggableOptions;
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private startLeft = 0;
  private startTop = 0;
  private containmentRect: DOMRect | null = null;

  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;

  constructor(element: HTMLElement, options: DraggableOptions = {}) {
    this.element = element;
    this.options = options;
    this.handle = options.handle
      ? element.querySelector(options.handle) as HTMLElement || element
      : element;

    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);

    this.handle.addEventListener('pointerdown', this.boundPointerDown);
    this.handle.style.touchAction = 'none';
    this.handle.style.cursor = 'move';
  }

  private onPointerDown(e: PointerEvent): void {
    if (e.button !== 0) return;

    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;

    const rect = this.element.getBoundingClientRect();
    this.startLeft = rect.left;
    this.startTop = rect.top;

    if (this.options.containment) {
      const containment = typeof this.options.containment === 'string'
        ? document.querySelector(this.options.containment) as HTMLElement
        : this.options.containment;
      this.containmentRect = containment.getBoundingClientRect();
    }

    this.element.style.position = 'absolute';
    this.element.style.left = `${this.startLeft}px`;
    this.element.style.top = `${this.startTop}px`;
    this.element.style.zIndex = '10000';

    document.addEventListener('pointermove', this.boundPointerMove);
    document.addEventListener('pointerup', this.boundPointerUp);

    this.handle.setPointerCapture(e.pointerId);

    this.options.onStart?.({ x: this.startLeft, y: this.startTop });

    e.preventDefault();
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.isDragging) return;

    let deltaX = e.clientX - this.startX;
    let deltaY = e.clientY - this.startY;

    if (this.options.grid) {
      deltaX = Math.round(deltaX / this.options.grid[0]) * this.options.grid[0];
      deltaY = Math.round(deltaY / this.options.grid[1]) * this.options.grid[1];
    }

    let newLeft = this.startLeft + deltaX;
    let newTop = this.startTop + deltaY;

    if (this.containmentRect) {
      const elRect = this.element.getBoundingClientRect();
      newLeft = Math.max(this.containmentRect.left, Math.min(newLeft, this.containmentRect.right - elRect.width));
      newTop = Math.max(this.containmentRect.top, Math.min(newTop, this.containmentRect.bottom - elRect.height));
    }

    if (this.options.axis === 'x') {
      newTop = this.startTop;
    } else if (this.options.axis === 'y') {
      newLeft = this.startLeft;
    }

    const shouldContinue = this.options.onDrag?.({ x: newLeft, y: newTop });
    if (shouldContinue === false) return;

    this.element.style.left = `${newLeft}px`;
    this.element.style.top = `${newTop}px`;
  }

  private onPointerUp(e: PointerEvent): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    document.removeEventListener('pointermove', this.boundPointerMove);
    document.removeEventListener('pointerup', this.boundPointerUp);

    const left = parseInt(this.element.style.left);
    const top = parseInt(this.element.style.top);
    this.options.onEnd?.({ x: left, y: top });
  }

  destroy(): void {
    this.handle.removeEventListener('pointerdown', this.boundPointerDown);
    document.removeEventListener('pointermove', this.boundPointerMove);
    document.removeEventListener('pointerup', this.boundPointerUp);
  }
}
```

---

## 4. Resizable 缩放组件

### 4.1 TypeScript 实现

```typescript
export interface ResizableOptions {
  handles?: ('n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw')[];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  grid?: [number, number];
  onStart?: () => void;
  onResize?: (size: { width: number; height: number }) => boolean | void;
  onEnd?: (size: { width: number; height: number }) => void;
}

export class Resizable {
  private element: HTMLElement;
  private options: ResizableOptions;
  private handles: Map<string, HTMLElement> = new Map();
  private isResizing = false;
  private activeHandle = '';
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;
  private startLeft = 0;
  private startTop = 0;

  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;

  constructor(element: HTMLElement, options: ResizableOptions = {}) {
    this.element = element;
    this.options = {
      handles: options.handles || ['se'],
      minWidth: options.minWidth || 20,
      minHeight: options.minHeight || 20,
      maxWidth: options.maxWidth || Infinity,
      maxHeight: options.maxHeight || Infinity,
      grid: options.grid || [1, 1],
      ...options,
    };

    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);

    this.createHandles();
  }

  private createHandles(): void {
    for (const direction of this.options.handles!) {
      const handle = document.createElement('div');
      handle.className = `luckysheet-resizable-handle luckysheet-resizable-${direction}`;
      handle.dataset.direction = direction;
      handle.addEventListener('pointerdown', this.boundPointerDown);
      this.element.appendChild(handle);
      this.handles.set(direction, handle);
    }

    this.element.style.position = 'relative';
  }

  private onPointerDown(e: PointerEvent): void {
    const target = e.target as HTMLElement;
    this.activeHandle = target.dataset.direction || '';
    if (!this.activeHandle) return;

    this.isResizing = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startWidth = this.element.offsetWidth;
    this.startHeight = this.element.offsetHeight;
    this.startLeft = this.element.offsetLeft;
    this.startTop = this.element.offsetTop;

    document.addEventListener('pointermove', this.boundPointerMove);
    document.addEventListener('pointerup', this.boundPointerUp);
    target.setPointerCapture(e.pointerId);

    this.options.onStart?.();
    e.preventDefault();
    e.stopPropagation();
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.isResizing) return;

    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;

    let newWidth = this.startWidth;
    let newHeight = this.startHeight;
    let newLeft = this.startLeft;
    let newTop = this.startTop;

    const dir = this.activeHandle;

    if (dir.includes('e')) newWidth = this.startWidth + deltaX;
    if (dir.includes('w')) { newWidth = this.startWidth - deltaX; newLeft = this.startLeft + deltaX; }
    if (dir.includes('s')) newHeight = this.startHeight + deltaY;
    if (dir.includes('n')) { newHeight = this.startHeight - deltaY; newTop = this.startTop + deltaY; }

    if (this.options.grid) {
      newWidth = Math.round(newWidth / this.options.grid[0]) * this.options.grid[0];
      newHeight = Math.round(newHeight / this.options.grid[1]) * this.options.grid[1];
    }

    newWidth = Math.max(this.options.minWidth!, Math.min(this.options.maxWidth!, newWidth));
    newHeight = Math.max(this.options.minHeight!, Math.min(this.options.maxHeight!, newHeight));

    const shouldContinue = this.options.onResize?.({ width: newWidth, height: newHeight });
    if (shouldContinue === false) return;

    this.element.style.width = `${newWidth}px`;
    this.element.style.height = `${newHeight}px`;

    if (dir.includes('w')) this.element.style.left = `${newLeft}px`;
    if (dir.includes('n')) this.element.style.top = `${newTop}px`;
  }

  private onPointerUp(): void {
    if (!this.isResizing) return;
    this.isResizing = false;
    document.removeEventListener('pointermove', this.boundPointerMove);
    document.removeEventListener('pointerup', this.boundPointerUp);

    this.options.onEnd?.({
      width: this.element.offsetWidth,
      height: this.element.offsetHeight,
    });
  }

  destroy(): void {
    for (const [, handle] of this.handles) {
      handle.removeEventListener('pointerdown', this.boundPointerDown);
      handle.remove();
    }
    this.handles.clear();
    document.removeEventListener('pointermove', this.boundPointerMove);
    document.removeEventListener('pointerup', this.boundPointerUp);
  }
}
```

---

## 5. Sortable 排序组件

### 5.1 TypeScript 实现

```typescript
export interface SortableOptions {
  handle?: string;
  placeholder?: string;
  axis?: 'x' | 'y';
  onStart?: (element: HTMLElement, index: number) => void;
  onMove?: (element: HTMLElement, fromIndex: number, toIndex: number) => boolean | void;
  onEnd?: (element: HTMLElement, fromIndex: number, toIndex: number) => void;
}

export class Sortable {
  private container: HTMLElement;
  private options: SortableOptions;
  private dragElement: HTMLElement | null = null;
  private placeholder: HTMLElement | null = null;
  private startIndex = -1;
  private currentIndex = -1;

  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;

  constructor(container: HTMLElement, options: SortableOptions = {}) {
    this.container = container;
    this.options = options;

    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);

    this.container.addEventListener('pointerdown', this.boundPointerDown);
  }

  private onPointerDown(e: PointerEvent): void {
    const target = e.target as HTMLElement;
    const handle = this.options.handle
      ? target.closest(this.options.handle)
      : target.closest('[data-sortable-item]');

    if (!handle) return;

    const item = handle.closest('[data-sortable-item]') as HTMLElement;
    if (!item) return;

    this.dragElement = item;
    this.startIndex = this.getItemIndex(item);
    this.currentIndex = this.startIndex;

    this.createPlaceholder(item);
    item.classList.add('luckysheet-sortable-dragging');
    item.style.position = 'relative';
    item.style.zIndex = '10000';
    item.style.opacity = '0.8';
    item.style.width = `${item.offsetWidth}px`;

    document.addEventListener('pointermove', this.boundPointerMove);
    document.addEventListener('pointerup', this.boundPointerUp);

    this.options.onStart?.(item, this.startIndex);
    e.preventDefault();
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.dragElement || !this.placeholder) return;

    const items = this.getSortableItems();
    const rect = this.container.getBoundingClientRect();

    for (const item of items) {
      if (item === this.dragElement) continue;

      const itemRect = item.getBoundingClientRect();
      const isAfter = this.options.axis === 'y'
        ? e.clientY > itemRect.top + itemRect.height / 2
        : e.clientX > itemRect.left + itemRect.width / 2;

      if (isAfter) {
        this.container.insertBefore(this.placeholder, item.nextSibling);
      } else {
        this.container.insertBefore(this.placeholder, item);
      }
    }

    const newIndex = this.getPlaceholderIndex();
    if (newIndex !== this.currentIndex) {
      const shouldMove = this.options.onMove?.(
        this.dragElement,
        this.currentIndex,
        newIndex
      );
      if (shouldMove !== false) {
        this.currentIndex = newIndex;
      }
    }
  }

  private onPointerUp(): void {
    if (!this.dragElement || !this.placeholder) return;

    this.container.insertBefore(this.dragElement, this.placeholder);
    this.placeholder.remove();
    this.placeholder = null;

    this.dragElement.classList.remove('luckysheet-sortable-dragging');
    this.dragElement.style.position = '';
    this.dragElement.style.zIndex = '';
    this.dragElement.style.opacity = '';
    this.dragElement.style.width = '';

    document.removeEventListener('pointermove', this.boundPointerMove);
    document.removeEventListener('pointerup', this.boundPointerUp);

    this.options.onEnd?.(this.dragElement, this.startIndex, this.currentIndex);

    this.dragElement = null;
    this.startIndex = -1;
    this.currentIndex = -1;
  }

  private createPlaceholder(item: HTMLElement): void {
    this.placeholder = document.createElement('div');
    this.placeholder.className = this.options.placeholder || 'luckysheet-sortable-placeholder';
    this.placeholder.style.height = `${item.offsetHeight}px`;
    this.placeholder.style.width = `${item.offsetWidth}px`;
    this.container.insertBefore(this.placeholder, item.nextSibling);
  }

  private getSortableItems(): HTMLElement[] {
    return Array.from(
      this.container.querySelectorAll('[data-sortable-item]')
    ).filter(
      (el) => el !== this.dragElement && el !== this.placeholder
    ) as HTMLElement[];
  }

  private getItemIndex(item: HTMLElement): number {
    return Array.from(this.container.children).indexOf(item);
  }

  private getPlaceholderIndex(): number {
    if (!this.placeholder) return -1;
    return Array.from(this.container.children).indexOf(this.placeholder);
  }

  destroy(): void {
    this.container.removeEventListener('pointerdown', this.boundPointerDown);
    document.removeEventListener('pointermove', this.boundPointerMove);
    document.removeEventListener('pointerup', this.boundPointerUp);
  }
}
```

---

## 6. Tabs 标签页组件

### 6.1 TypeScript 实现

```typescript
export interface TabsOptions {
  activeIndex?: number;
  onChange?: (fromIndex: number, toIndex: number) => void;
}

export class Tabs {
  private container: HTMLElement;
  private options: TabsOptions;
  private tabList: HTMLElement;
  private panels: HTMLElement[] = [];
  private tabs: HTMLElement[] = [];
  private activeIndex = 0;

  constructor(container: HTMLElement, options: TabsOptions = {}) {
    this.container = container;
    this.options = options;

    this.tabList = container.querySelector('[role="tablist"]') as HTMLElement;
    this.tabs = Array.from(this.tabList?.querySelectorAll('[role="tab"]') || []);
    this.panels = Array.from(container.querySelectorAll('[role="tabpanel"]'));

    this.bindEvents();

    if (options.activeIndex !== undefined) {
      this.setActive(options.activeIndex);
    } else {
      this.setActive(0);
    }
  }

  private bindEvents(): void {
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => this.setActive(index));
      tab.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            this.setActive((index + 1) % this.tabs.length);
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            this.setActive((index - 1 + this.tabs.length) % this.tabs.length);
            break;
          case 'Home':
            e.preventDefault();
            this.setActive(0);
            break;
          case 'End':
            e.preventDefault();
            this.setActive(this.tabs.length - 1);
            break;
        }
      });
    });
  }

  setActive(index: number): void {
    const oldIndex = this.activeIndex;
    this.activeIndex = index;

    this.tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    this.panels.forEach((panel, i) => {
      panel.style.display = i === index ? '' : 'none';
      panel.setAttribute('aria-hidden', String(i !== index));
    });

    if (oldIndex !== index) {
      this.options.onChange?.(oldIndex, index);
    }
  }

  getActiveIndex(): number {
    return this.activeIndex;
  }

  destroy(): void {
    this.tabs.forEach((tab) => {
      tab.replaceWith(tab.cloneNode(true));
    });
  }
}
```

---

## 7. CSS 样式

### 7.1 Modal 样式

```css
.luckysheet-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 10000;
}

.luckysheet-modal-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10001;
}

.luckysheet-modal-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
}

.luckysheet-modal-dialog-title {
  font-size: 14px;
  font-weight: 500;
}

.luckysheet-modal-dialog-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  padding: 0 4px;
}

.luckysheet-modal-dialog-close:hover {
  color: #333;
}

.luckysheet-modal-dialog-body {
  padding: 16px;
}

.luckysheet-modal-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e8e8e8;
}

.luckysheet-modal-dialog-confirm,
.luckysheet-modal-dialog-cancel {
  padding: 6px 16px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 13px;
}

.luckysheet-modal-dialog-confirm {
  background: #0188fb;
  color: #fff;
  border: 1px solid #0188fb;
}

.luckysheet-modal-dialog-cancel {
  background: #fff;
  color: #333;
  border: 1px solid #d9d9d9;
}
```

### 7.2 Slider Panel 样式

```css
.luckysheet-modal-dialog-slider {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  background: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 10001;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```

### 7.3 Resizable 样式

```css
.luckysheet-resizable-handle {
  position: absolute;
  z-index: 10;
}

.luckysheet-resizable-se {
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  cursor: se-resize;
}

.luckysheet-resizable-e {
  right: 0;
  top: 0;
  width: 6px;
  height: 100%;
  cursor: e-resize;
}

.luckysheet-resizable-s {
  bottom: 0;
  left: 0;
  width: 100%;
  height: 6px;
  cursor: s-resize;
}

.luckysheet-resizable-n {
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  cursor: n-resize;
}

.luckysheet-resizable-w {
  left: 0;
  top: 0;
  width: 6px;
  height: 100%;
  cursor: w-resize;
}
```

### 7.4 Sortable 样式

```css
.luckysheet-sortable-dragging {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.luckysheet-sortable-placeholder {
  background: #e6f7ff;
  border: 1px dashed #0188fb;
  border-radius: 2px;
}
```

---

## 8. 迁移检查清单

- [ ] 确认 Spectrum 替换完成后移除 jQuery UI 引用
- [ ] 移除 `plugins/js/jquery-ui.min.js`
- [ ] 移除 jQuery UI CSS 引用
- [ ] 检查代码中是否有 `$.ui`、`$.widget` 的引用
- [ ] 如需对话框功能，使用 `Modal` 类替代
- [ ] 如需侧边面板，使用 `SliderPanel` 类替代
- [ ] 如需拖拽功能，使用 `Draggable` 类替代
- [ ] 如需缩放功能，使用 `Resizable` 类替代
- [ ] 如需排序功能，使用 `Sortable` 类替代
- [ ] 如需标签页功能，使用 `Tabs` 类替代
- [ ] 添加对应的 CSS 样式文件
