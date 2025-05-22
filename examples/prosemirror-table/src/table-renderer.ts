import { EditorView } from 'prosemirror-view';
import { RangeManager, rangeManagerKey } from './range-manager';
import { Renderer } from '../../../src/types/renderer';

// 表格渲染范围的 key 前缀
const TABLE_RENDER_KEY_PREFIX = 'table-render';

/**
 * 表格渲染器
 * 负责处理 ProseMirror 表格的渲染和内容更新
 */
export class TableRenderer implements Renderer {
  constructor(
    private view: EditorView,
    private container: HTMLElement,
    private contentContainer: HTMLElement
  ) {}

  /**
   * 渲染指定行
   * @param index - 行索引
   */
  renderItem(index: number): void {
    this.updateRowRenderState(index, true);
  }

  /**
   * 清除指定行
   * @param index - 行索引
   */
  clearItem(index: number): void {
    this.updateRowRenderState(index, false);
  }

  /**
   * 获取行元素
   * @param index - 行索引
   * @returns 行元素或 null
   */
  getItemElement(index: number): HTMLElement | null {
    const rows = this.contentContainer.querySelectorAll('tr');
    return rows[index] as HTMLElement || null;
  }

  /**
   * 获取行高度
   * @param index - 行索引
   * @returns 行高度
   */
  getItemHeight(index: number): number {
    const rowElement = this.getItemElement(index);
    if (!rowElement) return 0;
    return rowElement.offsetHeight;
  }

  /**
   * 更新行的渲染状态
   * @param index - 行索引
   * @param shouldRender - 是否应该渲染
   * @private
   */
  private updateRowRenderState(index: number, shouldRender: boolean): void {
    const rowElement = this.getItemElement(index);
    if (!rowElement) return;

    const rowViewDesc = rowElement.pmViewDesc;
    if (!rowViewDesc) return;

    const startPos = rowViewDesc.posAtStart;
    const endPos = rowViewDesc.posAtEnd;
    const key = TABLE_RENDER_KEY_PREFIX;

    const rangeManager = rangeManagerKey.getState(this.view.state) as RangeManager;
    if (!rangeManager) return;

    if (shouldRender) {
      rangeManager.setRange(key, startPos, endPos);
    } else {
      rangeManager.removeRangeInRegion(key, startPos, endPos);
    }

    // 更新所有子节点
    rowViewDesc.children.forEach((viewDesc: any) => {
      viewDesc.markDirty(1, viewDesc.node.nodeSize - 1);    
    });
    (rowViewDesc as any).updateChildren(this.view, rowViewDesc.posAtStart);
  }
} 