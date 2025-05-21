import { DataSource } from '../types';

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
  /** 缓冲区范围 */
  bufferRange: { start: number; end: number };
}

/**
 * 页面管理类
 * 负责管理内容的分页逻辑，优化渲染和滚动性能
 */
export class PageManager {
  /** 页面数组，存储所有分页信息 */
  private pages: Page[] = [];
  /** 当前可见页索引 */
  private _visiblePage: number = -1;
  /** 页面变化事件监听器 */
  private pageChangeListeners: Set<(event: PageChangeEvent) => void> = new Set();

  /**
   * 创建页面管理实例
   * @param containerHeight - 容器可视区域高度
   * @param dataSource - 数据源
   */
  constructor(
    private containerHeight: number,
    private dataSource: DataSource
  ) {
    this.calculatePages();
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

    for (let i = 0; i < this.dataSource.totalCount; i++) {
      currentHeight += this.dataSource.rowHeights[i];
      if (currentHeight >= pageHeight || i === this.dataSource.totalCount - 1) {
        this.pages.push({
          start: pageStart,
          end: i,
          top: this.getRowTop(pageStart),
          bottom: this.getRowTop(i) + this.dataSource.rowHeights[i]
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
      top += this.dataSource.rowHeights[i];
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
  handleScroll(scrollTop: number) {
    const newVisiblePage = this.getCurrentPage(scrollTop);
    if (newVisiblePage !== this._visiblePage) {
      this._visiblePage = newVisiblePage;
      this.notifyPageChange();
    }
  }

  /**
   * 处理快速滚动
   * 立即更新可见页并触发事件
   * @param scrollTop - 滚动位置
   */
  handleFastScroll(scrollTop: number) {
    const newVisiblePage = this.getCurrentPage(scrollTop);
    if (newVisiblePage !== this._visiblePage) {
      this._visiblePage = newVisiblePage;
      this.notifyPageChange();
    }
  }

  /**
   * 添加页面变化事件监听器
   * @param listener - 事件监听器
   */
  addPageChangeListener(listener: (event: PageChangeEvent) => void) {
    this.pageChangeListeners.add(listener);
  }

  /**
   * 移除页面变化事件监听器
   * @param listener - 事件监听器
   */
  removePageChangeListener(listener: (event: PageChangeEvent) => void) {
    this.pageChangeListeners.delete(listener);
  }

  /**
   * 通知页面变化事件
   * @private
   */
  private notifyPageChange() {
    const range = this.getBufferRange(this._visiblePage);
    if (!range) return;

    const event: PageChangeEvent = {
      visiblePage: this._visiblePage,
      bufferRange: range
    };

    this.pageChangeListeners.forEach(listener => listener(event));
  }
} 