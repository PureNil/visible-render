/**
 * 页面数据结构
 */
export interface Page {
    /** 页面起始行索引 */
    start: number;
    /** 页面结束行索引 */
    end: number;
    /** 页面顶部位置（像素） */
    top: number;
    /** 页面底部位置（像素） */
    bottom: number;
} 