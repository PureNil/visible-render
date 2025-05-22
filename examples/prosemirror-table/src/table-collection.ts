import { NodeView } from 'prosemirror-view';
import { RenderCollection } from '../../../src/types/renderer';
import { LayoutItem } from '../../../src/types/layout-cache';

interface TableRowViewDesc {
  node: { attrs: { height: number } };
  dom: HTMLElement;
}

interface TableNodeView extends NodeView {
  children: TableRowViewDesc[];
}

export function createTableCollection(node: TableNodeView): RenderCollection<LayoutItem> {
  return {
    items: node.children.map(childViewDesc => ({
      layoutPredictor: () => ({
        height: childViewDesc.node.attrs.height
      }),
      getRealLayout: () => ({ 
        height: childViewDesc.dom.offsetHeight
      })
    }))
  };
}
