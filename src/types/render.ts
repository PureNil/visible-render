/**
 * 渲染器接口
 * 负责内容的渲染和更新
 */
export interface Renderer {
  /** 初始化渲染器，返回容器高度 */
  initialize(): number;
  /** 渲染指定行的内容 */
  renderRow(index: number, content: string): void;
  /** 清除指定行的内容 */
  clearRow(index: number): void;
  /** 更新指定行的内容 */
  updateRow(index: number, content: string): void;
  /** 获取行元素 */
  getRowElement(index: number): HTMLElement | null;
}

/**
 * 滚动事件处理器
 */
export interface ScrollHandler {
  /** 处理滚动事件 */
  handleScroll: () => void;
  /** 处理快速滚动事件 */
  handleFastScroll?: () => void;
} 