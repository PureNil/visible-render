import { greet } from '../src';

const demo = document.getElementById('demo');
if (demo) {
  demo.textContent = greet('Vite');
}

// 热更新支持
if (import.meta.hot) {
  import.meta.hot.accept();
} 