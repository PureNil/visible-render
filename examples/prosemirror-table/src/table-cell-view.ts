import { Node as ProseMirrorNode } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';

// 全局 map，key 用 getPos() 的返回值（假设唯一）
export const cellRenderMap = new Map<number, boolean>();

export function forceRenderRow(rowViewDesc: any, shouldRender: boolean, view: EditorView) {
  console.log(111111, shouldRender)
  rowViewDesc.children.forEach((viewDesc: any) => {
    console.log(111111, viewDesc)
    viewDesc.spec.setShouldRender(shouldRender);
    viewDesc.markDirty(1, viewDesc.node.nodeSize - 1);    
  });
  rowViewDesc.updateChildren(view, rowViewDesc.posAtStart);
}

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

    // 读取全局 shouldRender 状态
    const pos = this.getPos();
    const shouldRender = pos !== undefined ? cellRenderMap.get(pos) : false;

    console.log(1111111, 'create', shouldRender)
    
    if (shouldRender) {
      this.contentDOM = this.dom;
    } else {
      this.contentDOM = null;
      const holder = this.createPlaceholder();
      this.dom.appendChild(holder);
    }
  }

  // shouldRender 不再挂在实例上

  setShouldRender(bool: boolean) {
    const pos = this.getPos();
    if (pos !== undefined) {
      cellRenderMap.set(pos, bool);
    }
    console.log(1111111, 'setShouldRender', bool)
  }

  // 更新节点
  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) return false;
    this.node = node;

    const pos = this.getPos();
    const shouldRender = pos !== undefined ? cellRenderMap.get(pos) : false;

    console.log(1111111, 'update', shouldRender)

    // // 更新单元格宽度
    // if (node.attrs.colwidth) {
    //   const width = node.attrs.colwidth[0];
    //   if (width) {
    //     this.dom.style.width = `${width}px`;
    //   }
    // }

    if (!shouldRender && this.contentDOM) {
      // this.contentDOM = null;
      return false;
    }

    if (shouldRender && !this.contentDOM) {
      // this.contentDOM = this.dom;
      // this.contentDOM.innerHTML = ''; // 清空内容
      return false
    }

    return true;
  }
}

// 创建表格单元格视图工厂函数
export function createTableCellView(node: ProseMirrorNode, view: EditorView, getPos: () => number | undefined) {
  return new TableCellView(node, view, getPos);
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