import { DataSource, DataItem } from '../types';

/**
 * 默认数据源实现
 * 提供基础的数据管理功能
 */
export class DefaultDataSource implements DataSource {
  /** 数据数组 */
  private data: DataItem[] = [];
  /** 数据总数 */
  readonly totalCount: number;
  /** 所有行的高度数组 */
  readonly rowHeights: number[] = [];

  constructor(totalCount: number = 10000) {
    this.totalCount = totalCount;
    this.initializeData();
  }

  /**
   * 初始化数据
   * @private
   */
  private initializeData() {
    this.data = new Array(this.totalCount).fill(null).map((_, index) => ({
      id: index,
      content: `这是第 ${index + 1} 行的内容`,
      height: Math.floor(Math.random() * 30) + 30 // 30-60px的随机高度
    }));
    this.rowHeights.length = 0; // 清空数组
    this.rowHeights.push(...this.data.map(item => item.height));
  }

  /**
   * 获取指定索引的数据
   * @param index - 数据索引
   * @returns 数据项
   */
  getData(index: number): DataItem {
    if (index < 0 || index >= this.totalCount) {
      throw new Error(`索引 ${index} 超出范围`);
    }
    return this.data[index];
  }

  /**
   * 更新指定索引的数据
   * @param index - 数据索引
   * @param data - 新数据
   */
  updateData(index: number, data: DataItem): void {
    if (index < 0 || index >= this.totalCount) {
      throw new Error(`索引 ${index} 超出范围`);
    }
    this.data[index] = { ...data };
    this.rowHeights[index] = data.height;
  }

  /**
   * 刷新数据
   * 重新初始化所有数据
   */
  refresh(): void {
    this.initializeData();
  }
} 