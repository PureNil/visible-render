import { LayoutCache, LayoutItem } from '../types/layout-cache';
import { RenderCollection } from '../types/renderer';

/**
 * 页面数据结构
 * 定义了一个页面的基本属性
 */
export interface Page {
  /** 页面起始行索引 */
  start: number;
  /** 页面结束行索引 */
  end: number;
  /** 页面顶部位置（像素） */
  top: number;
  /** 页面底部位置（像素） */
  bottom: number;
}

/**
 * 页面变化事件
 */
export interface PageChangeEvent {
  /** 当前可见页索引 */
  visiblePage: number;
  /** 页面列表 */
  pages: Page[];
}

/**
 * 页面管理器
 * 负责管理页面的布局和渲染
 */
export class PageManager {
  private pages: Page[] = [];
  private pageChangeListeners: Set<(event: PageChangeEvent) => void> = new Set();
  private _visiblePage: number = -1;

  constructor(
    private renderCollection: RenderCollection<LayoutItem>,
    private layoutCache: LayoutCache<LayoutItem>,
    private containerHeight: number
  ) {
    this.calculatePages();
  }

  /**
   * 获取页面列表
   */
  getPages(): Page[] {
    return this.pages;
  }

  /**
   * 更新页面布局
   * @param startIndex - 起始索引
   * @param endIndex - 结束索引
   */
  updatePages(startIndex: number, endIndex: number): void {
    this.pages = [];
    let currentTop = 0;

    for (let i = startIndex; i <= endIndex; i++) {
      const item = this.renderCollection.items[i];
      if (!item) continue;

      const layout = this.layoutCache.get(item);
      const page: Page = {
        start: i,
        end: i,
        top: currentTop,
        bottom: currentTop + layout.height
      };
      this.pages.push(page);
      currentTop = page.bottom;
    }
  }

  /**
   * 获取指定位置所在的页面
   * @param position - 位置（像素）
   */
  getPageAtPosition(position: number): Page | null {
    return this.pages.find(page => 
      position >= page.top && position <= page.bottom
    ) || null;
  }

  /**
   * 获取指定索引所在的页面
   * @param index - 索引
   */
  getPageAtIndex(index: number): Page | null {
    return this.pages.find(page => 
      index >= page.start && index <= page.end
    ) || null;
  }

  /**
   * 清除所有页面
   */
  clear(): void {
    this.pages = [];
  }

  /**
   * 添加页面变化监听器
   * @param listener - 监听器函数
   */
  addPageChangeListener(listener: (event: PageChangeEvent) => void): void {
    this.pageChangeListeners.add(listener);
  }

  /**
   * 移除页面变化监听器
   * @param listener - 监听器函数
   */
  removePageChangeListener(listener: (event: PageChangeEvent) => void): void {
    this.pageChangeListeners.delete(listener);
  }

  /**
   * 触发页面变化事件
   */
  private notifyPageChange(): void {
    const event: PageChangeEvent = {
      visiblePage: this._visiblePage,
      pages: this.pages
    };
    this.pageChangeListeners.forEach(listener => listener(event));
  }

  /**
   * 计算页面分布
   * 根据容器高度和行高计算内容的分页情况
   * @private
   */
  private calculatePages() {
    let currentHeight = 0;
    let pageStart = 0;
    // 设置页面高度为容器高度的1.5倍，提供缓冲区
    const pageHeight = this.containerHeight * 1.5;

    for (let i = 0; i < this.renderCollection.items.length; i++) {
      const item = this.renderCollection.items[i];
      if (!item) continue;

      const layout = this.layoutCache.get(item);
      currentHeight += layout.height;
      
      if (currentHeight >= pageHeight || i === this.renderCollection.items.length - 1) {
        this.pages.push({
          start: pageStart,
          end: i,
          top: this.getRowTop(pageStart),
          bottom: this.getRowTop(i) + layout.height
        });
        pageStart = i + 1;
        currentHeight = 0;
      }
    }
  }

  /**
   * 获取指定行的顶部位置
   * @param index - 行索引
   * @returns 行顶部的像素位置
   */
  getRowTop(index: number): number {
    let top = 0;
    for (let i = 0; i < index; i++) {
      const item = this.renderCollection.items[i];
      if (!item) continue;
      top += this.layoutCache.get(item).height;
    }
    return top;
  }

  /**
   * 获取当前可见页的索引
   * @param scrollTop - 滚动位置
   * @returns 当前可见页的索引
   */
  getCurrentPage(scrollTop: number): number {
    return this.pages.findIndex(page => 
      scrollTop >= page.top && scrollTop < page.bottom);
  }

  /**
   * 获取指定行所在的页面索引
   * @param rowIndex - 行索引
   * @returns 页面索引
   */
  getPageIndexForRow(rowIndex: number): number {
    return this.pages.findIndex(page => 
      rowIndex >= page.start && rowIndex <= page.end);
  }

  /**
   * 获取指定行的背景色
   * 用于视觉区分不同页面
   * @param rowIndex - 行索引
   * @returns 背景色
   */
  getPageColor(rowIndex: number): string {
    const pageIndex = this.getPageIndexForRow(rowIndex);
    const colors = ['#f0f0f0', '#e0e0e0', '#d0d0d0'];
    return colors[pageIndex % colors.length];
  }

  /**
   * 获取缓冲区范围
   * 返回当前可见页的前后页索引范围
   * @param visiblePage - 当前可见页索引
   * @returns 缓冲区范围，如果visiblePage无效则返回null
   */
  getBufferRange(visiblePage: number): { start: number; end: number } | null {
    if (visiblePage === -1) return null;
    return {
      start: Math.max(0, visiblePage - 1),
      end: Math.min(this.pages.length - 1, visiblePage + 1)
    };
  }

  /**
   * 获取指定索引的页面信息
   * @param index - 页面索引
   * @returns 页面信息
   */
  getPage(index: number): Page {
    return this.pages[index];
  }

  /**
   * 处理滚动事件
   * 更新可见页并触发事件
   * @param scrollTop - 滚动位置
   */
  updateVisiblePage(scrollTop: number) {
    const newVisiblePage = this.getCurrentPage(scrollTop);
    if (newVisiblePage !== this._visiblePage) {
      this._visiblePage = newVisiblePage;
      this.notifyPageChange();
    }
  }
} 