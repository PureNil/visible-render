import {EditorView} from "prosemirror-view"
import {forceRenderRow} from "./table-cell-view"

// 引入全局 cellRenderMap
import { cellRenderMap } from "./table-cell-view"

// 创建控制面板
export function createControlPanel(view: EditorView) {
  const panel = document.createElement('div');
  panel.className = 'visibility-control-panel';
  
  // 添加单元格序号输入框
  const cellInput = document.createElement('input');
  cellInput.type = 'number';
  cellInput.min = '1';
  cellInput.placeholder = '行号';
  cellInput.style.width = '80px';
  cellInput.style.marginRight = '5px';
  cellInput.value = '2';
  
  // 添加切换渲染模式按钮
  const toggleRenderModeButton = document.createElement('button');
  toggleRenderModeButton.textContent = '渲染模式';
  toggleRenderModeButton.onclick = () => {
    const rowIndex = parseInt(cellInput.value);
    if (isNaN(rowIndex) || rowIndex < 1) {
      console.log('请输入有效的行号');
      return;
    }

    // 获取所有表格行
    const rows = view.dom.querySelectorAll('tr');
    if (rowIndex > rows.length) {
      console.log('行号超出范围');
      return;
    }

    // 获取指定行
    const targetRow = rows[rowIndex - 1];
    if (!targetRow) {
      console.log('未找到目标行');
      return;
    }

    // 获取行的viewDesc
    const rowViewDesc = targetRow.pmViewDesc;
    if (!rowViewDesc) {
      console.log('未找到行的viewDesc');
      return;
    }

    // 获取行的node
    const rowNode = rowViewDesc.node;
    if (!rowNode) {
      console.log('未找到行的node');
      return;
    }

    // 获取第一个单元格的viewDesc来检查当前渲染状态
    const firstCellViewDesc = rowViewDesc.children[0];
    if (!firstCellViewDesc) {
      console.log('未找到单元格的viewDesc');
      return;
    }

    // 通过 getPos() 获取唯一 key，从全局 cellRenderMap 读取 shouldRender
    const getPos = firstCellViewDesc.spec.getPos;
    let shouldRender = false;
    if (typeof getPos === 'function') {
      const pos = getPos();
      if (typeof pos === 'number') {
        shouldRender = !(cellRenderMap.get(pos));
      }
    }

    forceRenderRow(rowViewDesc, shouldRender, view);
  };
  
  panel.appendChild(cellInput);
  panel.appendChild(toggleRenderModeButton);
  
  return panel;
}

// 添加样式
const style = document.createElement('style');
style.textContent = `
  .visibility-control-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 1000;
  }

  .visibility-control-panel button {
    padding: 4px 8px;
    background: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 3px;
    cursor: pointer;
  }

  .visibility-control-panel button:hover {
    background: #e0e0e0;
  }

  .visibility-control-panel input {
    padding: 4px;
    border: 1px solid #ddd;
    border-radius: 3px;
  }
`;
document.head.appendChild(style);