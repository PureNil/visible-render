import { VisibleRender } from '../src';
import './style.css';

// 创建容器样式
const style = document.createElement('style');
style.textContent = `
  .container {
    height: 500px;
    overflow: auto;
    border: 1px solid #ccc;
  }
  .row {
    box-sizing: border-box;
    padding: 8px;
    width: 100%;
  }
`;
document.head.appendChild(style);

// 创建虚拟滚动实例
const demo = document.getElementById('demo');
if (demo) {
  demo.innerHTML = `
    <div id="scroll-container" class="container">
      <div id="content"></div>
    </div>
  `;

  const container = document.getElementById('scroll-container');
  if (container) {
    new VisibleRender(container, {
      container,
      rowCount: 10000
    });
  }
}

// 支持热更新
if (import.meta.hot) {
  import.meta.hot.accept();
} 