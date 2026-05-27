import { describe, it, expect } from 'vitest';
import { FixedModelColor } from './presetData';

describe('presetData - 预设颜色数据', () => {
    describe('FixedModelColor', () => {
        it('应包含预设交替颜色方案数组', () => {
            expect(Array.isArray(FixedModelColor)).toBe(true);
            expect(FixedModelColor.length).toBeGreaterThan(0);
        });

        it('应包含24套预设色板', () => {
            expect(FixedModelColor.length).toBe(24);
        });

        it('每套方案应包含head、one、two、foot四个区域', () => {
            FixedModelColor.forEach((scheme, index) => {
                expect(scheme).toHaveProperty('head');
                expect(scheme).toHaveProperty('one');
                expect(scheme).toHaveProperty('two');
                expect(scheme).toHaveProperty('foot');
            });
        });

        it('每个区域应包含fc(字体颜色)和bc(背景颜色)属性', () => {
            FixedModelColor.forEach((scheme) => {
                ['head', 'one', 'two', 'foot'].forEach(area => {
                    expect(scheme[area]).toHaveProperty('fc');
                    expect(scheme[area]).toHaveProperty('bc');
                    expect(typeof scheme[area].fc).toBe('string');
                    expect(typeof scheme[area].bc).toBe('string');
                });
            });
        });

        it('颜色值应为有效的十六进制格式', () => {
            FixedModelColor.forEach((scheme) => {
                ['head', 'one', 'two', 'foot'].forEach(area => {
                    expect(scheme[area].fc).toMatch(/^#[0-9a-f]{3,6}$/i);
                    expect(scheme[area].bc).toMatch(/^#[0-9a-f]{3,6}$/i);
                });
            });
        });

        it('第一套方案应为灰白色系', () => {
            const first = FixedModelColor[0];
            expect(first.head.bc).toBe('#bfbdbe');
            expect(first.one.bc).toBe('#ffffff');
            expect(first.two.bc).toBe('#f8f3f7');
            expect(first.foot.bc).toBe('#dde2de');
        });

        it('第二套方案应为蓝色系', () => {
            const second = FixedModelColor[1];
            expect(second.head.bc).toBe('#4bd4e7');
            expect(second.one.bc).toBe('#ffffff');
        });
    });
});
