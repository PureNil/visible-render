import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';
import { tableNodes } from 'prosemirror-tables';
import { VisibleRender } from '../../src/core/visible-render';
import { DefaultDataSource } from '../../src/core/default-data-source';
import { createTable } from './src/table-utils';
import { createTableCellView } from './src/table-cell-view';
import { createControlPanel } from './src/control-panel';

// 创建表格节点配置
const tableNodesSpec = tableNodes({
  tableGroup: 'block',
  cellContent: 'block+',
  cellAttributes: {
    background: {
      default: null,
      getFromDOM(dom: HTMLElement) {
        return dom.style.backgroundColor || null;
      },
      setDOMAttr(value: unknown, attrs: { style?: string }) {
        if (value) {
          attrs.style = value as string;
        }
      }
    }
  }
});

// 合并 schema
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block')
    .addToEnd('table', tableNodesSpec.table)
    .addToEnd('table_row', tableNodesSpec.table_row)
    .addToEnd('table_cell', tableNodesSpec.table_cell)
    .addToEnd('table_header', tableNodesSpec.table_header),
  marks: schema.spec.marks
});

// 创建编辑器状态
const state = EditorState.create({
  schema: mySchema,
  doc: createTable(mySchema, 1000, 10),
  plugins: exampleSetup({ schema: mySchema })
});

// 创建编辑器视图
const view = new EditorView(document.querySelector('#editor'), {
  state,
  nodeViews: {
    table_cell: createTableCellView
  }
});

// 添加控制面板
const controlPanel = createControlPanel(view as any);
document.body.appendChild(controlPanel);

// 初始化VisibleRender
const container = document.querySelector('#editor') as HTMLElement;
const dataSource = new DefaultDataSource(1000); // 1000行数据

export const visibleRender = new VisibleRender(container, {
  container,
  dataSource,
  enablePerformanceMonitor: true,
  enableFastScroll: true,
  rowCount: 1000
});