import { Schema } from 'prosemirror-model';

// 创建表头行
function createHeaderRow(schema: Schema, cols: number) {
  const headerRow = [];
  for (let j = 0; j < cols; j++) {
    const headerCell = schema.nodes.table_header.create(
      { 
        background: j % 2 === 0 ? '#f0f0f0' : '#e0e0e0',
        colwidth: [100 + Math.floor(Math.random() * 50)] // 100-150px的随机宽度
      },
      schema.nodes.paragraph.create(null, [
        schema.text(`列 ${j + 1}`, [
          schema.marks.strong.create()
        ])
      ])
    );
    headerRow.push(headerCell);
  }
  return schema.nodes.table_row.create(null, headerRow);
}

// 创建简单内容（第1行）
function createSimpleContent(schema: Schema, index: number) {
  return schema.nodes.paragraph.create(null, [
    schema.text(`#${index + 1} `, [
      schema.marks.strong.create()
    ]),
    schema.text(`[${index % 2 === 0 ? '进行中' : '已完成'}]`)
  ]);
}

// 创建中等内容（第2行）
function createMediumContent(schema: Schema) {
  return schema.nodes.paragraph.create(null, [
    schema.text('进度：', [
      schema.marks.strong.create()
    ]),
    schema.text(`${Math.floor(Math.random() * 100)}%\n`),
    schema.text('负责人：张三\n'),
    schema.text('预计完成：2024-03-15')
  ]);
}

// 创建较复杂内容（第3行）
function createComplexContent(schema: Schema) {
  return schema.nodes.bullet_list.create(null, [
    schema.nodes.list_item.create(null, [
      schema.nodes.paragraph.create(null, [
        schema.text('完成需求分析')
      ])
    ]),
    schema.nodes.list_item.create(null, [
      schema.nodes.paragraph.create(null, [
        schema.text('编写技术文档')
      ])
    ])
  ]);
}

// 创建复杂内容（第4行）
function createVeryComplexContent(schema: Schema) {
  return schema.nodes.bullet_list.create(null, [
    schema.nodes.list_item.create(null, [
      schema.nodes.paragraph.create(null, [
        schema.text('前端开发')
      ])
    ]),
    schema.nodes.list_item.create(null, [
      schema.nodes.paragraph.create(null, [
        schema.text('React')
      ])
    ]),
    schema.nodes.list_item.create(null, [
      schema.nodes.paragraph.create(null, [
        schema.text('TypeScript')
      ])
    ]),
    schema.nodes.list_item.create(null, [
      schema.nodes.paragraph.create(null, [
        schema.text('Vue')
      ])
    ])
  ]);
}

// 创建最复杂内容（第5行）
function createMostComplexContent(schema: Schema) {
  return schema.nodes.paragraph.create(null, [
    schema.text('项目详情：\n', [
      schema.marks.strong.create()
    ]),
    schema.text('1. 需求分析\n'),
    schema.text('2. 开发实现\n'),
    schema.text('3. 测试验证\n'),
    schema.text('4. 部署上线\n'),
    schema.text('5. 运维支持\n'),
    schema.text('\n负责人：李四\n'),
    schema.text('预计完成：2024-04-01')
  ]);
}

// 根据行号创建单元格内容
function createCellContent(schema: Schema, rowIndex: number) {
  if (rowIndex % 5 === 0) {
    return createSimpleContent(schema, rowIndex);
  } else if (rowIndex % 5 === 1) {
    return createMediumContent(schema);
  } else if (rowIndex % 5 === 2) {
    return createComplexContent(schema);
  } else if (rowIndex % 5 === 3) {
    return createVeryComplexContent(schema);
  } else {
    return createMostComplexContent(schema);
  }
}

// 创建表格
export function createTable(schema: Schema, rows: number, cols: number) {
  const cells = [];
  
  // 添加表头行
  cells.push(createHeaderRow(schema, cols));

  // 创建数据行
  for (let i = 0; i < rows - 1; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      const content = createCellContent(schema, i);
      
      // 随机添加背景色
      const background = Math.random() > 0.9 ? '#f8f8f8' : null;
      
      // 设置单元格宽度
      const colwidth = [100 + Math.floor(Math.random() * 50)]; // 100-150px的随机宽度
      
      const cell = schema.nodes.table_cell.create(
        { 
          background,
          colwidth
        },
        content
      );
      row.push(cell);
    }
    cells.push(schema.nodes.table_row.create(null, row));
  }

  const table = schema.nodes.table.create(null, cells);
  return schema.nodes.doc.create(null, [table]);
} 