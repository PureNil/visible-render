
import { Renderer } from '../types';
import { PageManager, PageChangeEvent } from './page-manager';

/**
 * 观察器管理类
 * 负责管理IntersectionObserver实例，处理元素的可见性变化
 */
export class ObserverManager {
  /** 容器观察器，用于监控容器是否可见 */
  private containerObserver!: IntersectionObserver;
  /** 行观察器，用于监控每一行的可见性 */
  private rowObserver!: IntersectionObserver;
  /** 存储当前被观察的行索引映射 */
  private observers: Map<number, boolean> = new Map();

  /**
   * 创建观察器管理实例
   * @param container - 容器元素
   * @param renderer - DOM渲染器实例
   * @param pageManager - 页面管理器实例
   * @param dataSource - 数据源
   */
  constructor(
    private container: HTMLElement,
    private renderer: Renderer,
    private pageManager: PageManager,
  ) {
    this.setupObservers();
    this.pageManager.addPageChangeListener(this.handlePageChange.bind(this));
  }

  /**
   * 初始化观察器
   * 设置容器观察器和行观察器
   * @private
   */
  private setupObservers() {
    this.setupContainerObserver();
    this.setupRowObserver();
  }

  /**
   * 设置容器观察器
   * 监控容器是否在视口内，优化性能
   * @private
   */
  private setupContainerObserver() {
    this.containerObserver = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) {
        this.cleanupAllObservers();
      }
    });
    this.containerObserver.observe(this.container);
  }

  /**
   * 设置行观察器
   * 监控每一行的可见性，按需渲染内容
   * @private
   */
  private setupRowObserver() {
    this.rowObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const row = entry.target as HTMLElement;
        const index = parseInt(row.dataset.index || '0');
        
        if (entry.isIntersecting) {
          this.renderer.renderItem(index);
          row.style.backgroundColor = this.pageManager.getPageColor(index);
        } else {
          const pageIndex = this.pageManager.getPageIndexForRow(index);
          const visiblePage = this.pageManager.getCurrentPage(this.container.scrollTop);
          if (Math.abs(pageIndex - visiblePage) > 1) {
            this.renderer.clearItem(index);
          }
        }
      });
    }, {
      root: this.container,
      threshold: 0
    });
  }

  /**
   * 处理页面变化事件
   * 更新观察器的观察范围
   * @param event - 页面变化事件
   * @private
   */
  private handlePageChange(event: PageChangeEvent) {
    const { bufferRange } = event;

    // 清理不在范围内的观察器
    this.observers.forEach((_, index) => {
      const pageIndex = this.pageManager.getPageIndexForRow(index);
      if (pageIndex < bufferRange.start || pageIndex > bufferRange.end) {
        this.clearRowObserver(index);
      }
    });

    // 添加新范围内的观察器
    for (let i = bufferRange.start; i <= bufferRange.end; i++) {
      const page = this.pageManager.getPage(i);
      for (let j = page.start; j <= page.end; j++) {
        if (!this.observers.has(j)) {
          this.observeRow(j);
        }
      }
    }
  }

  /**
   * 为指定行设置观察器
   * @param index - 行索引
   * @private
   */
  private observeRow(index: number) {
    const row = this.renderer.getItemElement(index);
    if (row) {
      this.rowObserver.observe(row);
      this.observers.set(index, true);
    }
  }

  /**
   * 清除指定行的观察器
   * @param index - 行索引
   * @private
   */
  private clearRowObserver(index: number) {
    const row = this.renderer.getItemElement(index);
    if (row) {
      this.rowObserver.unobserve(row);
      this.observers.delete(index);
      this.renderer.clearItem(index);
    }
  }

  /**
   * 清除所有观察器
   * 用于容器不可见时的性能优化
   */
  cleanupAllObservers() {
    this.observers.forEach((_, index) => {
      this.clearRowObserver(index);
    });
    this.observers.clear();
  }

  /**
   * 获取当前被观察的行数
   * @returns 被观察的行数
   */
  getObserverCount(): number {
    return this.observers.size;
  }
} 