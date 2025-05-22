export interface LayoutRect {
    height: number;
}

export interface LayoutItem {
    layoutPredictor: () => LayoutRect;  // 预测高度
    getRealLayout: () => LayoutRect;  // 获取真实高度
}


export interface LayoutCache<T> {
    get(item: T): LayoutRect;
    setReal(item: T, layout: LayoutRect): void;
    hasReal(item: T): boolean;
    clear(): void;
}