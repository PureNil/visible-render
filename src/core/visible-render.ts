/**
 * 按需渲染模块
 * 通过监测元素可见性实现高性能的大数据渲染
 * @module visible-render
 */

import { PerformanceMonitor } from './performance-monitor';
import { DOMRenderer } from './dom-renderer';
import { PageManager } from './page-manager';
import { ObserverManager } from './observer-manager';
import { ScrollManager } from './scroll-manager';
import { VisibleRenderOptions, PerformanceData, DataSource, DataItem } from '../types';
import { DefaultDataSource } from './default-data-source';

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
export class VisibleRender {
  /** 性能监控实例 */
  private performanceMonitor: PerformanceMonitor;
  /** DOM渲染管理实例 */
  private renderer: DOMRenderer;
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
  private options: VisibleRenderOptions;

  /**
   * 创建按需渲染实例
   * @param container - 容器元素，用于承载渲染内容
   * @param options - 配置选项
   */
  constructor(
    private container: HTMLElement,
    options: VisibleRenderOptions = { container: container }
  ) {
    this.options = options;
    this.enablePerformanceMonitor = options.enablePerformanceMonitor ?? true;
    this.enableFastScroll = options.enableFastScroll ?? true;

    // 初始化数据源
    const dataSource = options.dataSource || new DefaultDataSource(options.rowCount || 10000);

    // 初始化各个组件
    this.performanceMonitor = new PerformanceMonitor(container, options.performanceThresholds);
    this.renderer = new DOMRenderer(container, dataSource);
    const containerHeight = this.renderer.initialize();
    this.pageManager = new PageManager(containerHeight, dataSource);
    this.observerManager = new ObserverManager(container, this.renderer, this.pageManager, dataSource);
    this.scrollManager = new ScrollManager();

    this.setupScrollHandler();
    
    // 如果启用性能监控，显示FPS计数器
    if (this.enablePerformanceMonitor) {
      this.performanceMonitor.showFPSCounter();
    }
  }

  /**
   * 设置滚动事件处理
   * 包含防抖和快速滚动的优化处理
   * @private
   */
  private setupScrollHandler() {
    let scrollTimeout: number;
    const handleScroll = () => {
      const startTime = performance.now();
      
      if (this.enableFastScroll) {
        // 检查滚动速度
        const { startTime, isQuickScroll } = this.scrollManager.checkScrollSpeed();
        
        // 快速滚动时立即更新可见页
        if (isQuickScroll) {
          this.pageManager.handleFastScroll(this.container.scrollTop);
          return;
        }
      }
      
      // 使用防抖处理正常滚动
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        const scrollTime = performance.now() - startTime;
        this.updatePerformanceMetrics(scrollTime);
        this.pageManager.handleScroll(this.container.scrollTop);
      }, 150);
    };

    this.container.addEventListener('scroll', handleScroll);
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
      totalRows: this.options.dataSource?.totalCount || 0,
      currentPage: this.pageManager.getCurrentPage(this.container.scrollTop)
    });
  }

  /**
   * 销毁实例，清理资源
   */
  public destroy() {
    this.observerManager.cleanupAllObservers();
    this.performanceMonitor.destroy();
    // 移除滚动监听器
    this.container.removeEventListener('scroll', this.setupScrollHandler);
  }

  /**
   * 获取当前性能数据
   * @returns 性能数据对象
   */
  public getPerformanceData(): PerformanceData {
    return {
      fps: this.performanceMonitor.getCurrentFPS(),
      observerCount: this.observerManager.getObserverCount(),
      renderedRows: this.options.dataSource?.totalCount || 0,
      memoryUsage: performance.memory?.usedJSHeapSize
    };
  }

  /**
   * 更新指定行的数据
   * @param index - 行索引
   * @param data - 新数据
   */
  public updateRow(index: number, data: DataItem) {
    this.renderer.updateRow(index, data.content);
    if (this.options.onDataUpdate) {
      this.options.onDataUpdate(index, data);
    }
  }

  /**
   * 刷新所有数据
   */
  public refresh() {
    if (this.options.dataSource) {
      this.options.dataSource.refresh();
      this.observerManager.handleScroll();
    }
  }
} 