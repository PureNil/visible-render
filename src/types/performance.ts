/**
 * 性能监控数据
 */
export interface PerformanceData {
  /** 当前FPS */
  fps: number;
  /** 观察器数量 */
  observerCount: number;
  /** 渲染行数 */
  renderedRows: number;
  /** 内存使用量 */
  memoryUsage?: number;
}

/**
 * 性能监控阈值配置
 */
export interface PerformanceThresholds {
  /** 最大内存使用量（字节） */
  maxMemoryUsage?: number;
  /** 最小FPS */
  minFPS?: number;
  /** 最大渲染时间（毫秒） */
  maxRenderTime?: number;
  /** 最大观察器数量 */
  maxObserverCount?: number;
  /** 内存泄漏检测阈值（字节/秒） */
  memoryLeakThreshold?: number;
}

/**
 * 性能警告信息
 */
export interface PerformanceWarning {
  /** 警告类型 */
  type: 'memory' | 'fps' | 'render' | 'observer' | 'leak';
  /** 警告消息 */
  message: string;
  /** 当前值 */
  value: number;
  /** 阈值 */
  threshold: number;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 性能指标数据
 */
export interface PerformanceMetrics {
  /** 滚动时间 */
  scrollTime: number;
  /** 观察行数 */
  observedRows: number;
  /** 总行数 */
  totalRows: number;
  /** 当前页 */
  currentPage: number;
  /** 当前FPS */
  fps: number;
  /** 内存使用量 */
  memoryUsage?: number;
  /** 渲染时间 */
  renderTime: number;
  /** 内存增长率 */
  memoryGrowth: number;
  /** 警告列表 */
  warnings: PerformanceWarning[];
} 