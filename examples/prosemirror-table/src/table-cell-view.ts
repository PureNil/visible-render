import { Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';
import { RangeManager, rangeManagerKey } from './range-manager';

// 表格渲染范围的 key 前缀
const TABLE_RENDER_KEY_PREFIX = 'table-render';

// 创建表格单元格视图
export class TableCellView implements NodeView {
  dom: HTMLElement;
  contentDOM: HTMLElement | null;
  node: ProseMirrorNode;
  view: EditorView;
  getPos: () => number | undefined;

  createPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.className = 'table-cell-placeholder';
    placeholder.style.width = '100%';
    placeholder.style.height = '100%';
    placeholder.style.backgroundColor = '#f0f0f0';
    return placeholder;
  }

  // 获取是否应该渲染
  private getShouldRender(): boolean {
    const pos = this.getPos();
    const rangeManager = rangeManagerKey.getState(this.view.state) as RangeManager;
    return pos !== undefined && rangeManager ? rangeManager.isInRange(pos) : false;
  }

  constructor(node: ProseMirrorNode, view: EditorView, getPos: () => number | undefined) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    // 创建外层容器（使用 td 元素）
    this.dom = document.createElement('td');
    this.dom.className = 'table-cell-container';
    
    // 设置单元格宽度
    if (node.attrs.colwidth) {
      const width = node.attrs.colwidth[0];
      if (width) {
        this.dom.style.width = `${width}px`;
      }
    }

    // 读取全局渲染状态
    const shouldRender = this.getShouldRender();
    
    if (shouldRender) {
      this.contentDOM = this.dom;
    } else {
      this.contentDOM = null;
      const holder = this.createPlaceholder();
      this.dom.appendChild(holder);
    }
  }

  // 更新节点
  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) return false;
    this.node = node;

    const shouldRender = this.getShouldRender();

    // 如果渲染状态发生变化，返回 false 让 ProseMirror 重新创建节点视图
    if (shouldRender !== (this.contentDOM !== null)) {
      return false;
    }

    return true;
  }
}

// 创建表格单元格视图工厂函数
export function createTableCellView(node: ProseMirrorNode, view: EditorView, getPos: () => number | undefined) {
  return new TableCellView(node, view, getPos);
}

export function forceRenderRow(rowViewDesc: any, shouldRender: boolean, view: EditorView) {
  const startPos = rowViewDesc.posAtStart;
  const endPos = rowViewDesc.posAtEnd;
  const key = TABLE_RENDER_KEY_PREFIX;

  const rangeManager = rangeManagerKey.getState(view.state) as RangeManager;
  if (!rangeManager) return;

  if (shouldRender) {
    // 设置范围
    rangeManager.setRange(key, startPos, endPos);
  } else {
    // 移除该行范围内的渲染状态，保留其他范围
    rangeManager.removeRangeInRegion(key, startPos, endPos);
  }

  // 更新所有子节点
  rowViewDesc.children.forEach((viewDesc: any) => {
    viewDesc.markDirty(1, viewDesc.node.nodeSize - 1);    
  });
  rowViewDesc.updateChildren(view, rowViewDesc.posAtStart);
}

// 添加样式
const style = document.createElement('style');
style.textContent = `
  .table-cell-container {
    position: relative;
    padding: 8px;
    border: 1px solid #ddd;
    vertical-align: top;
    min-width: 100px;
    height: 50px;
  }

  .table-cell-content {
    min-height: 20px;
  }

  .table-cell-placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #999;
  }
`;
document.head.appendChild(style);