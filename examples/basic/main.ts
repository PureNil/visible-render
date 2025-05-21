import { VisibleRender } from '../../src/core/visible-render';
import { DefaultDataSource } from '../../src/core/default-data-source';

// 创建容器
const container = document.getElementById('container') as HTMLElement;
if (!container) {
    throw new Error('未找到容器元素 #container');
}

// 创建数据源
const dataSource = new DefaultDataSource(10000);

// 创建内容容器
const content = document.createElement('div');
content.id = 'content';
container.appendChild(content);

// 创建行元素
const totalCount = dataSource.totalCount;
for (let i = 0; i < totalCount; i++) {
    const row = document.createElement('div');
    row.className = 'row';
    row.style.height = `${dataSource.rowHeights[i]}px`;
    content.appendChild(row);
}

// 创建渲染实例
const renderer = new VisibleRender(container, {
    container,
    dataSource,
    enablePerformanceMonitor: true,
    enableFastScroll: true
}); 