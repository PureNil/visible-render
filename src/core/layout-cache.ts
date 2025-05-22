import { LayoutCache, LayoutRect, LayoutItem } from '../types/layout-cache';
import { RenderCollection } from '../types/renderer';

/**
 * 布局缓存
 * 缓存项目的布局信息
 */
export class DefaultLayoutCache implements LayoutCache<LayoutItem> {
  private cache: Map<LayoutItem, LayoutRect> = new Map();
  private realCache: Map<LayoutItem, LayoutRect> = new Map();

  constructor(private renderCollection: RenderCollection<LayoutItem>) {}

  /**
   * 获取指定项的布局信息
   * 优先从真实缓存中读取，如果没有则从预测缓存中读取
   * @param item - 布局项
   */
  getLayout(item: LayoutItem): LayoutRect {
    return this.realCache.get(item) || this.cache.get(item) || { height: 0 };
  }

  /**
   * 获取指定项的布局信息
   * @param item - 布局项
   */
  get(item: LayoutItem): LayoutRect {
    // 如果缓存中没有，则从渲染集合中获取
    if (!this.cache.has(item)) {
      this.cache.set(item, item.layoutPredictor());
    }
    return this.cache.get(item) || { height: 0 };
  }

  /**
   * 设置指定项的布局信息
   * @param item - 布局项
   * @param layout - 布局信息
   */
  set(item: LayoutItem, layout: LayoutRect): void {
    this.cache.set(item, layout);
  }

  /**
   * 获取指定项的真实布局信息
   * @param item - 布局项
   */
  getReal(item: LayoutItem): LayoutRect {
    if (!this.realCache.has(item)) {
      this.realCache.set(item, item.getRealLayout());
    }
    return this.realCache.get(item) || { height: 0 };
  }

  /**
   * 设置指定项的真实布局信息
   * @param item - 布局项
   * @param layout - 布局信息
   */
  setReal(item: LayoutItem, layout: LayoutRect): void {
    this.realCache.set(item, layout);
  }

  /**
   * 检查是否有真实布局信息
   * @param item - 布局项
   */
  hasReal(item: LayoutItem): boolean {
    return this.realCache.has(item);
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.realCache.clear();
  }

  /**
   * 更新指定项的布局信息
   * @param index - 项索引
   */
  updateLayout(index: number): void {
    const item = this.renderCollection.items[index];
    if (item) {
      this.set(item, item.layoutPredictor());
      this.setReal(item, item.getRealLayout());
    }
  }
} 

export { LayoutCache };
