import { PerformanceMetrics, PerformanceThresholds, PerformanceWarning } from '../types';

export class PerformanceMonitor {
  private performanceDiv: HTMLElement;
  private lastFrameTime: number = performance.now();
  private frameCount: number = 0;
  private fps: number = 0;
  private metrics: PerformanceMetrics = {
    scrollTime: 0,
    observedRows: 0,
    totalRows: 0,
    currentPage: 0,
    fps: 0,
    renderTime: 0,
    memoryGrowth: 0,
    warnings: []
  };
  private isVisible: boolean = false;
  private lastMemoryUsage: number = 0;
  private lastMemoryCheck: number = performance.now();
  private memorySamples: number[] = [];
  private readonly MEMORY_SAMPLE_SIZE = 10;
  private readonly MEMORY_CHECK_INTERVAL = 1000; // 1秒

  constructor(
    private container: HTMLElement,
    private thresholds: PerformanceThresholds = {
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      minFPS: 30,
      maxRenderTime: 16, // 约60fps
      maxObserverCount: 100,
      memoryLeakThreshold: 1024 * 1024 // 1MB/秒
    }
  ) {
    this.performanceDiv = this.createPerformanceDiv();
    this.startMonitoring();
  }

  private createPerformanceDiv(): HTMLElement {
    const div = document.createElement('div');
    div.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: monospace;
      z-index: 9999;
      display: none;
      font-size: 12px;
      line-height: 1.5;
      min-width: 200px;
    `;
    document.body.appendChild(div);
    return div;
  }

  private startMonitoring() {
    this.startFPSMonitoring();
    this.startMemoryMonitoring();
  }

  private startFPSMonitoring() {
    const checkFPS = () => {
      const now = performance.now();
      const elapsed = now - this.lastFrameTime;

      if (elapsed >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / elapsed);
        this.frameCount = 0;
        this.lastFrameTime = now;
        
        // 检查FPS警告
        if (this.thresholds.minFPS && this.fps < this.thresholds.minFPS) {
          this.addWarning('fps', `FPS过低: ${this.fps}`, this.fps, this.thresholds.minFPS);
      }
      }
      
      this.frameCount++;
      requestAnimationFrame(checkFPS);
    };

    requestAnimationFrame(checkFPS);
  }

  private startMemoryMonitoring() {
    setInterval(() => {
      if (!performance.memory) return;

      const currentMemory = performance.memory.usedJSHeapSize;
      const now = performance.now();
      const elapsed = now - this.lastMemoryCheck;
      
      // 计算内存增长率（字节/秒）
      const memoryGrowth = (currentMemory - this.lastMemoryUsage) / (elapsed / 1000);
      
      // 记录内存样本
      this.memorySamples.push(memoryGrowth);
      if (this.memorySamples.length > this.MEMORY_SAMPLE_SIZE) {
        this.memorySamples.shift();
  }

      // 计算平均内存增长率
      const avgMemoryGrowth = this.memorySamples.reduce((a, b) => a + b, 0) / this.memorySamples.length;
      
      // 检查内存使用警告
      if (this.thresholds.maxMemoryUsage && currentMemory > this.thresholds.maxMemoryUsage) {
        this.addWarning('memory', `内存使用过高: ${this.formatBytes(currentMemory)}`, currentMemory, this.thresholds.maxMemoryUsage);
      }
      
      // 检查内存泄漏警告
      if (this.thresholds.memoryLeakThreshold && avgMemoryGrowth > this.thresholds.memoryLeakThreshold) {
        this.addWarning('leak', `检测到可能的内存泄漏: ${this.formatBytes(avgMemoryGrowth)}/秒`, avgMemoryGrowth, this.thresholds.memoryLeakThreshold);
      }
      
      this.lastMemoryUsage = currentMemory;
      this.lastMemoryCheck = now;
      this.metrics.memoryUsage = currentMemory;
      this.metrics.memoryGrowth = avgMemoryGrowth;
      
    }, this.MEMORY_CHECK_INTERVAL);
  }

  private addWarning(type: PerformanceWarning['type'], message: string, value: number, threshold: number) {
    const warning: PerformanceWarning = {
      type,
      message,
      value,
      threshold,
      timestamp: performance.now()
    };
    
    this.metrics.warnings.push(warning);
    
    // 只保留最近10条警告
    if (this.metrics.warnings.length > 10) {
      this.metrics.warnings.shift();
    }
    
    // 在控制台输出警告
    console.warn(`[性能警告] ${message}`);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  public updateMetrics(metrics: Partial<PerformanceMetrics>) {
    this.metrics = { ...this.metrics, ...metrics };
    
    // 检查渲染时间警告
    if (this.thresholds.maxRenderTime && metrics.renderTime && metrics.renderTime > this.thresholds.maxRenderTime) {
      this.addWarning('render', `渲染时间过长: ${metrics.renderTime.toFixed(2)}ms`, metrics.renderTime, this.thresholds.maxRenderTime);
    }
    
    // 检查观察器数量警告
    if (this.thresholds.maxObserverCount && metrics.observedRows && metrics.observedRows > this.thresholds.maxObserverCount) {
      this.addWarning('observer', `观察器数量过多: ${metrics.observedRows}`, metrics.observedRows, this.thresholds.maxObserverCount);
    }
    
    this.render();
  }

  private render() {
    if (!this.isVisible) return;
    
    const warnings = this.metrics.warnings
      .slice(-3)
      .map(w => `<div style="color: #ff6b6b">${w.message}</div>`)
      .join('');
    
    this.performanceDiv.innerHTML = `
      FPS: ${this.metrics.fps}<br>
      内存使用: ${this.formatBytes(this.metrics.memoryUsage || 0)}<br>
      内存增长: ${this.formatBytes(this.metrics.memoryGrowth)}/秒<br>
      渲染时间: ${this.metrics.renderTime.toFixed(2)}ms<br>
      观察行数: ${this.metrics.observedRows}<br>
      总行数: ${this.metrics.totalRows}<br>
      当前页: ${this.metrics.currentPage}<br>
      ${warnings}
    `;
  }

  public showFPSCounter() {
    this.isVisible = true;
    this.performanceDiv.style.display = 'block';
  }

  public hideFPSCounter() {
    this.isVisible = false;
    this.performanceDiv.style.display = 'none';
  }

  public getCurrentFPS(): number {
    return this.fps;
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public destroy() {
    this.performanceDiv.remove();
  }
} 