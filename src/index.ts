/**
 * A simple example function
 * @param name - The name to greet
 * @returns A greeting message
 */
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Add more exports here as needed
export * from './types';

export { VisibleRender } from './core/visible-render';
export type { VisibleRenderOptions, PerformanceData } from './types';