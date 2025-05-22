import { DataSource } from '../types';
// import { EditorView } from 'prosemirror-view';

export function forceRenderRow(rowViewDesc: any, shouldRender: boolean, view: any) {
  rowViewDesc.children.forEach((viewDesc: any) => {
    viewDesc.spec.setShouldRender(shouldRender);
    viewDesc.markDirty(1, viewDesc.node.nodeSize - 1);    
  });
  rowViewDesc.updateChildren(view, rowViewDesc.posAtStart);
}

/**
 * DOM渲染管理类
 * 负责处理DOM元素的渲染和内容更新
 */
export class DOMRenderer {
  /**
   * 创建DOM渲染管理实例
   * @param container - 外层容器元素
   * @param dataSource - 数据源
   */
  constructor(
    private container: HTMLElement,
    private contentContainer: HTMLElement,
    private dataSource: DataSource,
    private view: any,
  ) {
    this.dataSource = dataSource;
  }

  /**
   * 初始化渲染器
   * 设置内容容器的总高度
   * @returns 容器的可视高度
   */
  initialize(): number {
    const totalHeight = this.dataSource.items.map(item => item.height).reduce((a, b) => a + b, 0);
    this.contentContainer.style.height = `${totalHeight}px`;
    return this.container.clientHeight;
  }

  /**
   * 渲染指定行的内容
   * @param index - 行索引
   * @param content - 行内容
   */
  renderRow(index: number) {
    const rowDom = this.getRowElement(index);
    if (rowDom) {
      forceRenderRow(rowDom.pmViewDesc, true, this.view);
    }
  }

  /**
   * 清除指定行的内容
   * @param index - 行索引
   */
  clearRow(index: number) {
    const rowDom = this.getRowElement(index);
    if (rowDom) {
      forceRenderRow(rowDom.pmViewDesc, false, this.view);
    }
  }

  /**
   * 获取指定行的元素
   * @param index - 行索引
   * @returns 行元素或null
   */
  getRowElement(index: number): HTMLElement | null {
    return this.contentContainer.children[index] as HTMLElement || null;
  }
} 