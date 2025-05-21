import { DataSource, DataItem } from '../types';

/**
 * DOM渲染管理类
 * 负责处理DOM元素的渲染和内容更新
 */
export class DOMRenderer {
  /** 内容容器元素 */
  private content: HTMLElement;
  /** 数据源 */
  private dataSource: DataSource;

  /**
   * 创建DOM渲染管理实例
   * @param container - 外层容器元素
   * @param dataSource - 数据源
   */
  constructor(
    private container: HTMLElement,
    dataSource: DataSource
  ) {
    // 获取已存在的内容容器
    const contentElement = container.querySelector('#content') as HTMLElement;
    if (!contentElement) {
      throw new Error('未找到内容容器元素 #content');
    }
    this.content = contentElement;
    this.dataSource = dataSource;
  }

  /**
   * 初始化渲染器
   * 设置内容容器的总高度
   * @returns 容器的可视高度
   */
  initialize(): number {
    const totalHeight = this.dataSource.rowHeights.reduce((a, b) => a + b, 0);
    this.content.style.height = `${totalHeight}px`;
    return this.container.clientHeight;
  }

  /**
   * 渲染指定行的内容
   * @param index - 行索引
   * @param content - 行内容
   */
  renderRow(index: number, content: string) {
    const row = this.content.children[index] as HTMLElement;
    if (row && !row.innerHTML) {
      row.innerHTML = content;
    }
  }

  /**
   * 更新指定行的内容
   * @param index - 行索引
   * @param content - 新内容
   */
  updateRow(index: number, content: string) {
    const row = this.content.children[index] as HTMLElement;
    if (row) {
      row.innerHTML = content;
    }
  }

  /**
   * 清除指定行的内容
   * @param index - 行索引
   */
  clearRow(index: number) {
    const row = this.content.children[index] as HTMLElement;
    if (row) {
      row.innerHTML = '';
    }
  }

  /**
   * 获取指定行的元素
   * @param index - 行索引
   * @returns 行元素或null
   */
  getRowElement(index: number): HTMLElement | null {
    return this.content.children[index] as HTMLElement || null;
  }
} 