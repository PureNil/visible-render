import { DataSource, DataItem } from './data';
import { PerformanceThresholds } from './performance';

/**
 * VisibleRender的配置选项
 */
export interface VisibleRenderOptions {
  /** 容器元素 */
  container: HTMLElement;
  /** 总行数 */
  rowCount?: number;
  /** 是否启用性能监控 */
  enablePerformanceMonitor?: boolean;
  /** 是否启用快速滚动优化 */
  enableFastScroll?: boolean;
  /** 数据源 */
  dataSource?: DataSource;
  /** 数据更新回调 */
  onDataUpdate?: (index: number, data: DataItem) => void;
  /** 性能监控阈值配置 */
  performanceThresholds?: PerformanceThresholds;
} 