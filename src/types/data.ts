/**
 * 数据项接口
 */
export interface DataItem {
  /** 行高度 */
  height: number;
}

/**
 * 数据源接口
 */
export interface DataSource {
  /** 所有行的高度数组 */
  readonly items: DataItem[];
}

/**
 * 页面数据结构
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