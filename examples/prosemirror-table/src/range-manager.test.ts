import { RangeManager } from './range-manager';
import { Transform } from 'prosemirror-transform';

describe('RangeManager', () => {
  let rangeManager: RangeManager;

  beforeEach(() => {
    rangeManager = new RangeManager();
  });

  describe('setRange', () => {
    it('应该正确设置单个范围', () => {
      rangeManager.setRange('test', 0, 100);
      const ranges = rangeManager.getRanges('test');
      expect(ranges).toHaveLength(1);
      expect(ranges![0]).toEqual({ start: 0, end: 100 });
    });

    it('应该合并交叉的范围', () => {
      rangeManager.setRange('test', 0, 100);
      rangeManager.setRange('test', 50, 150);
      const ranges = rangeManager.getRanges('test');
      expect(ranges).toHaveLength(1);
      expect(ranges![0]).toEqual({ start: 0, end: 150 });
    });

    it('应该保持不交叉的范围分开', () => {
      rangeManager.setRange('test', 0, 100);
      rangeManager.setRange('test', 200, 300);
      const ranges = rangeManager.getRanges('test');
      expect(ranges).toHaveLength(2);
      expect(ranges![0]).toEqual({ start: 0, end: 100 });
      expect(ranges![1]).toEqual({ start: 200, end: 300 });
    });

    it('应该验证范围参数', () => {
      expect(() => rangeManager.setRange('test', 100, 0)).toThrow('Invalid range');
      expect(() => rangeManager.setRange('test', -1, 100)).toThrow('Invalid range');
    });
  });

  describe('removeRangeInRegion', () => {
    it('应该完全移除区域内的范围', () => {
      rangeManager.setRange('test', 0, 100);
      rangeManager.removeRangeInRegion('test', 0, 100);
      expect(rangeManager.getRanges('test')).toBeUndefined();
    });

    it('应该保留区域外的部分', () => {
      rangeManager.setRange('test', 0, 100);
      rangeManager.removeRangeInRegion('test', 50, 150);
      const ranges = rangeManager.getRanges('test');
      expect(ranges).toHaveLength(1);
      expect(ranges![0]).toEqual({ start: 0, end: 49 });
    });

    it('应该正确处理多个范围', () => {
      rangeManager.setRange('test', 0, 100);
      rangeManager.setRange('test', 200, 300);
      rangeManager.removeRangeInRegion('test', 50, 250);
      const ranges = rangeManager.getRanges('test');
      expect(ranges).toHaveLength(2);
      expect(ranges![0]).toEqual({ start: 0, end: 49 });
      expect(ranges![1]).toEqual({ start: 251, end: 300 });
    });

    it('应该验证范围参数', () => {
      expect(() => rangeManager.removeRangeInRegion('test', 100, 0)).toThrow('Invalid range');
      expect(() => rangeManager.removeRangeInRegion('test', -1, 100)).toThrow('Invalid range');
    });
  });

  describe('isInRange', () => {
    it('应该正确判断位置是否在范围内', () => {
      rangeManager.setRange('test', 0, 100);
      expect(rangeManager.isInRange(50)).toBe(true);
      expect(rangeManager.isInRange(150)).toBe(false);
    });

    it('应该处理多个范围', () => {
      rangeManager.setRange('test1', 0, 100);
      rangeManager.setRange('test2', 200, 300);
      expect(rangeManager.isInRange(50)).toBe(true);
      expect(rangeManager.isInRange(150)).toBe(false);
      expect(rangeManager.isInRange(250)).toBe(true);
    });
  });

  describe('clearRange', () => {
    it('应该清除指定 key 的所有范围', () => {
      rangeManager.setRange('test1', 0, 100);
      rangeManager.setRange('test2', 200, 300);
      rangeManager.clearRange('test1');
      expect(rangeManager.getRanges('test1')).toBeUndefined();
      expect(rangeManager.getRanges('test2')).toBeDefined();
    });
  });

  describe('clearAll', () => {
    it('应该清除所有范围', () => {
      rangeManager.setRange('test1', 0, 100);
      rangeManager.setRange('test2', 200, 300);
      rangeManager.clearAll();
      expect(rangeManager.getRanges('test1')).toBeUndefined();
      expect(rangeManager.getRanges('test2')).toBeUndefined();
    });
  });

  describe('updateRanges', () => {
    it('应该正确更新范围位置', () => {
      rangeManager.setRange('test', 0, 100);
      
      // 模拟 Transform
      const transform = {
        mapping: {
          map: (pos: number) => pos + 50 // 所有位置向后移动 50
        }
      } as unknown as Transform;

      rangeManager.updateRanges(transform);
      const ranges = rangeManager.getRanges('test');
      expect(ranges![0]).toEqual({ start: 50, end: 150 });
    });

    it('应该处理无效的位置映射', () => {
      rangeManager.setRange('test', 0, 100);
      
      // 模拟 Transform，返回 null 表示位置无效
      const transform = {
        mapping: {
          map: () => null
        }
      } as unknown as Transform;

      rangeManager.updateRanges(transform);
      expect(rangeManager.getRanges('test')).toBeUndefined();
    });
  });

  describe('Plugin', () => {
    it('应该正确创建插件', () => {
      const plugin = RangeManager.createPlugin();
      expect(plugin).toBeDefined();
      expect(plugin.key).toBeDefined();
    });

    it('应该正确初始化插件状态', () => {
      const plugin = RangeManager.createPlugin();
      const state = plugin.state.init();
      expect(state).toBeInstanceOf(RangeManager);
    });
  });
});
