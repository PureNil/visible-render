import {EditorView} from "./prosemirror-view/src/index"
import {NodeViewDesc} from "./prosemirror-view/src/viewdesc"

// 创建控制面板
export function createControlPanel(view: EditorView) {
  const panel = document.createElement('div');
  panel.className = 'visibility-control-panel';
  
  // 添加单元格序号输入框
  const cellInput = document.createElement('input');
  cellInput.type = 'number';
  cellInput.min = '1';
  cellInput.placeholder = '单元格序号';
  cellInput.style.width = '80px';
  cellInput.style.marginRight = '5px';
  cellInput.value = '12';
  
  // 添加切换渲染模式按钮
  const toggleRenderModeButton = document.createElement('button');
  toggleRenderModeButton.textContent = '渲染模式';
  toggleRenderModeButton.onclick = () => {
    const cellIndex = parseInt(cellInput.value);
    if (isNaN(cellIndex) || cellIndex < 1) {
      console.log('请输入有效的单元格序号');
      return;
    }

    // 获取所有表格单元格
    const cells = view.dom.querySelectorAll('td');
    if (cellIndex > cells.length) {
      console.log('单元格序号超出范围');
      return;
    }

    // 获取指定序号的单元格
    const targetCell = cells[cellIndex - 1];
    const nodeView = targetCell?.pmViewDesc;
    console.log('Current node view:', nodeView);
    
    if (nodeView instanceof NodeViewDesc) {
      const shouldRender = (nodeView as any).spec.shouldRender;

      (nodeView as any).spec.setShouldRender(!shouldRender);
      nodeView.markDirty(1, nodeView.node.nodeSize - 1);

      const parentNodeView = nodeView.parent as (NodeViewDesc | undefined);
      
      parentNodeView?.updateChildren(view, parentNodeView.posAtStart);
    } else {
      console.log('未找到有效的节点视图');
    }
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