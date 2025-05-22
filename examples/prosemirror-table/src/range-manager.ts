import { Transform } from 'prosemirror-transform';
import { Plugin, PluginKey } from 'prosemirror-state';

// 范围接口定义
interface Range {
  start: number;  // 起始位置（全局 pos）
  end: number;    // 结束位置（全局 pos）
}

// 类型别名
type RangeKey = string;
type Position = number;

// 创建 PluginKey
export const rangeManagerKey = new PluginKey('rangeManager');

export class RangeManager {
  // 修改为 Map<string, Range[]>，一个 key 对应多个范围
  private rangeMap: Map<RangeKey, Range[]>;

  static key = rangeManagerKey;

  // 从编辑器状态中获取 RangeManager 实例
  static getFromState(state: any): RangeManager {
    return this.key.getState(state);
  }

  constructor() {
    this.rangeMap = new Map<RangeKey, Range[]>();
  }

  // 验证范围参数
  private validateRange(start: Position, end: Position): void {
    if (start > end) {
      throw new Error(`Invalid range: start (${start}) cannot be greater than end (${end})`);
    }
    if (start < 0 || end < 0) {
      throw new Error(`Invalid range: positions cannot be negative`);
    }
  }

  // 检查两个范围是否交叉
  private isRangesOverlap(range1: Range, range2: Range): boolean {
    return !(range1.end < range2.start || range1.start > range2.end);
  }

  // 合并两个范围
  private mergeRanges(range1: Range, range2: Range): Range {
    return {
      start: Math.min(range1.start, range2.start),
      end: Math.max(range1.end, range2.end)
    };
  }

  // 合并范围数组中的交叉范围
  private mergeOverlappingRanges(ranges: Range[]): Range[] {
    if (ranges.length <= 1) return ranges;

    // 按起始位置排序
    const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);
    const merged: Range[] = [];
    let current = sortedRanges[0];

    for (let i = 1; i < sortedRanges.length; i++) {
      const next = sortedRanges[i];
      if (this.isRangesOverlap(current, next)) {
        current = this.mergeRanges(current, next);
      } else {
        merged.push(current);
        current = next;
      }
    }
    merged.push(current);

    return merged;
  }

  // 移除指定区域内的范围，保留区域外的部分
  // 例如：对于范围 [0-100, 200-300]，移除区域 50-250 后，会得到 [0-49, 251-300]
  removeRangeInRegion(key: RangeKey, start: Position, end: Position) {
    this.validateRange(start, end);
    
    const ranges = this.rangeMap.get(key);
    if (!ranges) return;

    const newRanges: Range[] = [];
    const clearRange = { start, end };

    for (const range of ranges) {
      // 如果范围完全在清理范围内，跳过
      if (range.start >= clearRange.start && range.end <= clearRange.end) {
        continue;
      }
      
      // 如果范围与清理范围有交叉
      if (this.isRangesOverlap(range, clearRange)) {
        // 如果范围开始于清理范围之前
        if (range.start < clearRange.start) {
          newRanges.push({
            start: range.start,
            end: clearRange.start - 1
          });
        }
        // 如果范围结束于清理范围之后
        if (range.end > clearRange.end) {
          newRanges.push({
            start: clearRange.end + 1,
            end: range.end
          });
        }
      } else {
        // 如果范围与清理范围没有交叉，保留原范围
        newRanges.push(range);
      }
    }

    if (newRanges.length > 0) {
      this.rangeMap.set(key, newRanges);
    } else {
      this.rangeMap.delete(key);
    }
  }

  // 设置范围
  setRange(key: RangeKey, start: Position, end: Position) {
    this.validateRange(start, end);
    
    const newRange = { start, end };
    const existingRanges = this.rangeMap.get(key) || [];
    
    // 添加新范围
    const updatedRanges = [...existingRanges, newRange];
    
    // 合并交叉的范围
    const mergedRanges = this.mergeOverlappingRanges(updatedRanges);
    
    // 更新范围
    this.rangeMap.set(key, mergedRanges);
  }

  // 获取指定 key 的所有范围
  getRanges(key: RangeKey): Range[] | undefined {
    return this.rangeMap.get(key);
  }

  // 清除指定 key 的所有范围
  clearRange(key: RangeKey) {
    this.rangeMap.delete(key);
  }

  // 清除所有范围
  clearAll() {
    this.rangeMap.clear();
  }

  // 获取所有范围
  getAllRanges(): Map<RangeKey, Range[]> {
    return this.rangeMap;
  }

  // 根据位置判断是否在范围内
  isInRange(pos: Position): boolean {
    for (const ranges of this.rangeMap.values()) {
      for (const range of ranges) {
        if (pos >= range.start && pos <= range.end) {
          return true;
        }
      }
    }
    return false;
  }

  // 更新范围位置
  updateRanges(transform: Transform) {
    const newRangeMap = new Map<RangeKey, Range[]>();
    
    for (const [key, ranges] of this.rangeMap) {
      const newRanges: Range[] = [];
      
      for (const range of ranges) {
        // 使用 transform 的 mapping 来获取新的位置
        const newStart = transform.mapping.map(range.start);
        const newEnd = transform.mapping.map(range.end);
        
        // 只有当范围仍然有效时才保存
        if (newStart !== null && newEnd !== null) {
          newRanges.push({
            start: newStart,
            end: newEnd
          });
        }
      }
      
      if (newRanges.length > 0) {
        newRangeMap.set(key, newRanges);
      }
    }
    
    this.rangeMap = newRangeMap;
  }

  // 创建 Plugin
  static createPlugin(): Plugin {
    return new Plugin({
      key: rangeManagerKey,
      state: {
        init: () => new RangeManager(),
        apply: (tr, oldState) => {
          const manager = oldState as RangeManager;
          manager.updateRanges(tr);
          return manager;
        }
      }
    });
  }
} 