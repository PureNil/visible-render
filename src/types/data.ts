/**
 * 数据项接口
 */
export interface DataItem {
  /** 数据项ID */
  id: number;
  /** 数据项内容 */
  content: string;
  /** 行高度 */
  height: number;
}

/**
 * 数据源接口
 */
export interface DataSource {
  /** 数据总数 */
  readonly totalCount: number;
  /** 所有行的高度数组 */
  readonly rowHeights: number[];
  /** 获取指定索引的数据 */
  getData(index: number): DataItem;
  /** 更新指定索引的数据 */
  updateData(index: number, data: DataItem): void;
  /** 刷新数据 */
  refresh(): void;
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