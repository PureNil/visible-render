import { LayoutItem, LayoutCache } from './layout-cache';

export type RenderItem<T extends LayoutItem> = T;
export interface RenderCollection<T extends LayoutItem> {
  items: RenderItem<T>[]
}
export interface RendererConstructor {
  new (renderCollection: RenderCollection<LayoutItem>, layoutCache: LayoutCache<LayoutItem>): Renderer; 
}

/**
 * 渲染器接口
 * 负责内容的渲染和更新
 */
export interface Renderer {
  /** 渲染指定行 */
  renderItem(index: number): void;
  /** 清除指定行 */
  clearItem(index: number): void;
  /** 获取行元素 */
  getItemElement(index: number): HTMLElement | null;
  /** 获取行高度 */
  getItemHeight(index: number): number;
} 