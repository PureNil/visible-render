import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
// import { exampleSetup } from 'prosemirror-example-setup';
import { tableNodes, tableEditing, columnResizing } from 'prosemirror-tables';
import { VisibleRender } from '../../src/core/visible-render';
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
    .append(tableNodesSpec),
  marks: schema.spec.marks
});
const tableData = createTable(mySchema, 1000, 10);

// 创建编辑器状态
const state = EditorState.create({
  schema: mySchema,
  doc: tableData,
  plugins: [
    tableEditing(),
    columnResizing()
  ]
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
const container = document.querySelector('#container') as HTMLElement;
// const contentContainer = document.querySelector('#editor') as HTMLElement;

const tableDom = document.querySelector('#editor table') as HTMLElement;
const tableViewDesc = tableDom.pmViewDesc;

const dataSource = {
  items: tableViewDesc?.children.map(item => {
    return {
      item,
      height: item.node?.attrs.height || 0,
    }
  }) || []
};

export const visibleRender = new VisibleRender(container, {
  contentContainer: tableDom,
  dataSource,
  enablePerformanceMonitor: true,
  enableFastScroll: true,
  view,
});