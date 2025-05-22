import { PageManager } from './page-manager';

/**
 * 滚动行为管理类
 * 负责检测和分析滚动行为，优化滚动性能
 */
export class ScrollManager {
  /** 上次滚动时间戳 */
  private lastScrollTime: number = 0;
  /** 快速滚动的时间阈值（毫秒） */
  private readonly scrollThreshold: number = 100;
  /** 长距离滚动的距离阈值（像素） */
  private readonly longScrollThreshold: number;
  /** 滚动速度（像素/毫秒） */
  private scrollSpeed: number = 0;
  /** 滚动方向（1：向下，-1：向上，0：静止） */
  private scrollDirection: number = 0;
  /** 上次滚动位置 */
  private lastScrollPosition: number = 0;

  private scrollTop: number = 0;
  private isScrolling: boolean = false;
  private scrollTimeout: number | null = null;
  private scrollHandler: (() => void) | null = null;

  constructor(
    private container: HTMLElement,
    private pageManager: PageManager
  ) {
    // 设置长距离滚动阈值为容器高度的2倍
    this.longScrollThreshold = this.container.clientHeight * 2;
    this.initScrollListener();
  }

  /**
   * 初始化滚动监听器
   */
  private initScrollListener(): void {
    this.scrollHandler = () => {
      const newScrollTop = this.container.scrollTop;
      const scrollDistance = Math.abs(newScrollTop - this.scrollTop);
      this.scrollTop = newScrollTop;

      if (scrollDistance > this.longScrollThreshold) {
        this.handleLongScroll();
      } else {
        this.handleNormalScroll();
      }
    };
    this.container.addEventListener('scroll', this.scrollHandler);
  }

  /**
   * 处理长距离滚动
   */
  private handleLongScroll(): void {
    // 获取当前可见页
    const currentPage = this.pageManager.getPageAtPosition(this.scrollTop);
    if (currentPage) {
      // 计算需要更新的页面范围
      const startIndex = Math.max(0, currentPage.start - 2);
      const endIndex = currentPage.end + 2;
      // 通知 pageManager 重新计算页面
      this.pageManager.updatePages(startIndex, endIndex);
    }
    this.updateScrollState();
  }

  /**
   * 处理普通滚动
   */
  private handleNormalScroll(): void {
    this.updateScrollState();
  }

  /**
   * 更新滚动状态
   */
  private updateScrollState(): void {
    // 设置滚动状态
    this.isScrolling = true;
    if (this.scrollTimeout) {
      window.clearTimeout(this.scrollTimeout);
    }
    this.scrollTimeout = window.setTimeout(() => {
      this.isScrolling = false;
      this.scrollTimeout = null;
    }, 150);

    // 更新滚动状态
    const now = performance.now();
    const timeDiff = now - this.lastScrollTime;
    const posDiff = this.scrollTop - this.lastScrollPosition;

    // 计算滚动速度（像素/毫秒）
    this.scrollSpeed = Math.abs(posDiff) / (timeDiff || 1);
    
    // 确定滚动方向
    this.scrollDirection = Math.sign(posDiff);
    
    // 更新状态
    this.lastScrollTime = now;
    this.lastScrollPosition = this.scrollTop;
  }

  /**
   * 获取当前滚动位置
   */
  getScrollTop(): number {
    return this.scrollTop;
  }

  /**
   * 设置滚动位置
   * @param top - 目标滚动位置
   */
  scrollTo(top: number): void {
    this.container.scrollTop = top;
  }

  /**
   * 滚动到指定行
   * @param index - 行索引
   */
  scrollToRow(index: number): void {
    const page = this.pageManager.getPageAtIndex(index);
    if (page) {
      this.scrollTo(page.top);
    }
  }

  /**
   * 销毁滚动管理器
   */
  destroy(): void {
    if (this.scrollTimeout) {
      window.clearTimeout(this.scrollTimeout);
    }
    if (this.scrollHandler) {
      this.container.removeEventListener('scroll', this.scrollHandler);
    }
  }

  /**
   * 检查滚动速度
   * 通过计算两次滚动事件的时间间隔来判断是否为快速滚动
   * @returns 包含开始时间和是否快速滚动的对象
   */
  checkScrollSpeed(): {
    startTime: number;
    isQuickScroll: boolean;
  } {
    const now = performance.now();
    const scrollTimeDiff = now - this.lastScrollTime;
    this.lastScrollTime = now;

    return {
      startTime: now,
      isQuickScroll: scrollTimeDiff < this.scrollThreshold
    };
  }

  /**
   * 获取上次滚动时间
   * @returns 上次滚动的时间戳
   */
  getLastScrollTime(): number {
    return this.lastScrollTime;
  }

  /**
   * 获取当前滚动速度
   * @returns 滚动速度（像素/毫秒）
   */
  getScrollSpeed(): number {
    return this.scrollSpeed;
  }

  /**
   * 获取当前滚动方向
   * @returns 滚动方向（1：向下，-1：向上，0：静止）
   */
  getScrollDirection(): number {
    return this.scrollDirection;
  }

  /**
   * 重置滚动状态
   */
  reset(): void {
    this.lastScrollTime = 0;
    this.scrollSpeed = 0;
    this.scrollDirection = 0;
    this.lastScrollPosition = 0;
  }
} 