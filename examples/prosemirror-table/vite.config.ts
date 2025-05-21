import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    port: 3000
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  },
  resolve: {
    alias: {
      'prosemirror-view': path.resolve(__dirname, 'src/prosemirror-view/src/index'),
      // 'prosemirror-state': path.resolve(__dirname, 'src/prosemirror-state/src/index'),
      // 'prosemirror-model': path.resolve(__dirname, 'src/prosemirror-model/src/index'),
      // 'prosemirror-transform': path.resolve(__dirname, 'src/prosemirror-transform/src/index'),
      'prosemirror-tables': path.resolve(__dirname, 'src/prosemirror-tables/src/index'),
      // 'prosemirror-keymap': path.resolve(__dirname, 'src/prosemirror-keymap/src/keymap'),
      // 'prosemirror-schema-basic': path.resolve(__dirname, 'src/prosemirror-schema-basic/src/schema-basic'),
      // 'prosemirror-schema-list': path.resolve(__dirname, 'src/prosemirror-schema-list/src/schema-list'),
      // 'prosemirror-example-setup': path.resolve(__dirname, 'src/prosemirror-example-setup/src/index'),
      // 'prosemirror-history': path.resolve(__dirname, 'src/prosemirror-history/src/history'),
      // 'prosemirror-commands': path.resolve(__dirname, 'src/prosemirror-commands/src/commands'),
      // 'prosemirror-dropcursor': path.resolve(__dirname, 'src/prosemirror-dropcursor/src/dropcursor'),
      // 'prosemirror-gapcursor': path.resolve(__dirname, 'src/prosemirror-gapcursor/src/index'),
      // 'prosemirror-inputrules': path.resolve(__dirname, 'src/prosemirror-inputrules/src/inputrules'),
      // 'prosemirror-menu': path.resolve(__dirname, 'src/prosemirror-menu/src/menu')
    }
  }
}); 