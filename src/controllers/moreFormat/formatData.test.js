import { describe, it, expect } from 'vitest';
import { moneyFmtList, dateFmtList, numFmtList } from './formatData';

describe('formatData - 格式数据', () => {
    describe('moneyFmtList', () => {
        it('应包含货币格式列表', () => {
            expect(Array.isArray(moneyFmtList)).toBe(true);
            expect(moneyFmtList.length).toBeGreaterThan(0);
        });

        it('每个条目应包含name、pos和value属性', () => {
            moneyFmtList.forEach(item => {
                expect(item).toHaveProperty('name');
                expect(item).toHaveProperty('pos');
                expect(item).toHaveProperty('value');
            });
        });

        it('pos属性应为before或after', () => {
            moneyFmtList.forEach(item => {
                expect(['before', 'after']).toContain(item.pos);
            });
        });

        it('应包含人民币格式', () => {
            const rmb = moneyFmtList.find(item => item.value === '¥');
            expect(rmb).toBeDefined();
            expect(rmb.pos).toBe('before');
        });

        it('应包含美元格式', () => {
            const usd = moneyFmtList.find(item => item.value === '$');
            expect(usd).toBeDefined();
        });
    });

    describe('dateFmtList', () => {
        it('应包含日期格式列表', () => {
            expect(Array.isArray(dateFmtList)).toBe(true);
            expect(dateFmtList.length).toBeGreaterThan(0);
        });

        it('每个条目应包含name和value属性', () => {
            dateFmtList.forEach(item => {
                expect(item).toHaveProperty('name');
                expect(item).toHaveProperty('value');
            });
        });

        it('应包含yyyy-MM-dd格式', () => {
            const fmt = dateFmtList.find(item => item.value === 'yyyy-MM-dd');
            expect(fmt).toBeDefined();
        });
    });

    describe('numFmtList', () => {
        it('应包含数字格式列表', () => {
            expect(Array.isArray(numFmtList)).toBe(true);
            expect(numFmtList.length).toBeGreaterThan(0);
        });

        it('每个条目应包含name和value属性', () => {
            numFmtList.forEach(item => {
                expect(item).toHaveProperty('name');
                expect(item).toHaveProperty('value');
            });
        });

        it('应包含整数格式', () => {
            const fmt = numFmtList.find(item => item.value === '0');
            expect(fmt).toBeDefined();
        });

        it('应包含两位小数格式', () => {
            const fmt = numFmtList.find(item => item.value === '0.00');
            expect(fmt).toBeDefined();
        });

        it('应包含百分比格式', () => {
            const pct = numFmtList.filter(item => item.value.includes('%'));
            expect(pct.length).toBeGreaterThan(0);
        });
    });
});
