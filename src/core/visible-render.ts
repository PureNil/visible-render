/**
 * 按需渲染模块
 * 通过监测元素可见性实现高性能的大数据渲染
 * @module visible-render
 */

import { PerformanceMonitor } from './performance-monitor';
import { PageManager } from './page-manager';
import { ObserverManager } from './observer-manager';
import { ScrollManager } from './scroll-manager';
import { DefaultLayoutCache } from './layout-cache';
import { LayoutItem, PerformanceData, PerformanceThresholds, RenderCollection, Renderer } from '../types';

export interface VisibleRenderOptions<T extends LayoutItem> {
  renderCollection: RenderCollection<T>;
  renderer: Renderer;
  enablePerformanceMonitor?: boolean;
  performanceThresholds?: PerformanceThresholds;
  enableFastScroll?: boolean;
}

// 扩展Performance接口以包含memory属性
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

/**
 * 按需渲染核心类
 * 负责协调各个功能模块，实现高效的按需渲染
 */
export class VisibleRender<T extends LayoutItem> {
  /** 性能监控实例 */
  private performanceMonitor: PerformanceMonitor;
  /** 页面管理实例 */
  private pageManager: PageManager;
  /** 观察器管理实例 */
  private observerManager: ObserverManager;
  /** 滚动管理实例 */
  private scrollManager: ScrollManager;
  /** 是否启用性能监控 */
  private enablePerformanceMonitor: boolean;
  /** 是否启用快速滚动优化 */
  private enableFastScroll: boolean;
  /** 配置选项 */
  private options: VisibleRenderOptions<T>;

  /**
   * 创建按需渲染实例
   * @param container - 容器元素，用于承载渲染内容
   * @param options - 配置选项
   */
  constructor(
    private container: HTMLElement,
    options: VisibleRenderOptions<T>,
  ) {
    this.options = options;
    this.enablePerformanceMonitor = options.enablePerformanceMonitor ?? true;
    this.enableFastScroll = options.enableFastScroll ?? true;

    // 初始化各个组件
    this.performanceMonitor = new PerformanceMonitor(container, options.performanceThresholds);
    const containerHeight = this.container.clientHeight;
    const layoutCache = new DefaultLayoutCache(options.renderCollection);
    this.pageManager = new PageManager(options.renderCollection, layoutCache, containerHeight);
    this.observerManager = new ObserverManager(container, options.renderer, this.pageManager, dataSource);
    this.scrollManager = new ScrollManager(container, this.pageManager);
    
    // 如果启用性能监控，显示FPS计数器
    if (this.enablePerformanceMonitor) {
      this.performanceMonitor.showFPSCounter();
    }
  }

  /**
   * 更新性能指标
   * @param scrollTime - 滚动处理耗时
   * @private
   */
  private updatePerformanceMetrics(scrollTime: number) {
    if (!this.enablePerformanceMonitor) return;

    const renderTime = performance.now() - this.scrollManager.getLastScrollTime();
    
    this.performanceMonitor.updateMetrics({
      scrollTime,
      renderTime,
      observedRows: this.observerManager.getObserverCount(),
      totalRows: this.options.renderCollection.items.length,
      currentPage: this.pageManager.getCurrentPage(this.container.scrollTop)
    });
  }

  /**
   * 销毁实例，清理资源
   */
  public destroy() {
    this.observerManager.cleanupAllObservers();
    this.performanceMonitor.destroy();
  }

  /**
   * 获取当前性能数据
   * @returns 性能数据对象
   */
  public getPerformanceData(): PerformanceData {
    return {
      fps: this.performanceMonitor.getCurrentFPS(),
      observerCount: this.observerManager.getObserverCount(),
      renderedRows: this.options.renderCollection.items.length,
      memoryUsage: performance.memory?.usedJSHeapSize
    };
  }
} 