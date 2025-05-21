/**
 * 滚动行为管理类
 * 负责检测和分析滚动行为，优化滚动性能
 */
export class ScrollManager {
  /** 上次滚动时间戳 */
  private lastScrollTime: number = 0;
  /** 快速滚动的时间阈值（毫秒） */
  private readonly scrollThreshold: number = 100;
  /** 滚动速度（像素/毫秒） */
  private scrollSpeed: number = 0;
  /** 滚动方向（1：向下，-1：向上，0：静止） */
  private scrollDirection: number = 0;
  /** 上次滚动位置 */
  private lastScrollPosition: number = 0;

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
   * 更新滚动状态
   * @param currentPosition - 当前滚动位置
   */
  updateScrollState(currentPosition: number): void {
    const now = performance.now();
    const timeDiff = now - this.lastScrollTime;
    const posDiff = currentPosition - this.lastScrollPosition;

    // 计算滚动速度（像素/毫秒）
    this.scrollSpeed = Math.abs(posDiff) / (timeDiff || 1);
    
    // 确定滚动方向
    this.scrollDirection = Math.sign(posDiff);
    
    // 更新状态
    this.lastScrollTime = now;
    this.lastScrollPosition = currentPosition;
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