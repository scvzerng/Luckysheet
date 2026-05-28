import { ComputeEngine, ConditionRule, CellRange, ICON_FORMAT_MAP } from './index.js';
import type { RangeBoundary, RawRuleObject } from './shared/types/index.js';

const engine = new ComputeEngine();

function createTestData(rows: number, cols: number): unknown[][] {
    const data: unknown[][] = [];
    for (let r = 0; r < rows; r++) {
        const row: unknown[] = [];
        for (let c = 0; c < cols; c++) {
            row.push({
                v: Math.floor(Math.random() * 100),
                m: String(Math.floor(Math.random() * 100)),
                ct: { fa: 'General', t: 'n' },
            });
        }
        data.push(row);
    }
    return data;
}

function updateStatus(text: string): void {
    const el = document.getElementById('status-text');
    if (el) el.textContent = text;
}

function initCanvas(data: unknown[][]): void {
    const canvas = document.getElementById('luckysheet-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellWidth = 80;
    const cellHeight = 24;
    const headerWidth = 46;
    const headerHeight = 20;

    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#217346';
    ctx.fillRect(0, 0, headerWidth, canvas.height);
    ctx.fillRect(0, 0, canvas.width, headerHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let c = 0; c < Math.min(data[0]?.length ?? 0, Math.floor((canvas.width - headerWidth) / cellWidth)); c++) {
        const x = headerWidth + c * cellWidth + cellWidth / 2;
        ctx.fillText(String.fromCharCode(65 + c), x, headerHeight / 2);
    }

    for (let r = 0; r < Math.min(data.length, Math.floor((canvas.height - headerHeight) / cellHeight)); r++) {
        const y = headerHeight + r * cellHeight + cellHeight / 2;
        ctx.fillText(String(r + 1), headerWidth / 2, y);
    }

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    for (let c = 0; c <= Math.min(data[0]?.length ?? 0, Math.floor((canvas.width - headerWidth) / cellWidth)); c++) {
        const x = headerWidth + c * cellWidth;
        ctx.beginPath();
        ctx.moveTo(x, headerHeight);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let r = 0; r <= Math.min(data.length, Math.floor((canvas.height - headerHeight) / cellHeight)); r++) {
        const y = headerHeight + r * cellHeight;
        ctx.beginPath();
        ctx.moveTo(headerWidth, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    for (let r = 0; r < Math.min(data.length, Math.floor((canvas.height - headerHeight) / cellHeight)); r++) {
        for (let c = 0; c < Math.min(data[0]?.length ?? 0, Math.floor((canvas.width - headerWidth) / cellWidth)); c++) {
            const cell = data[r]?.[c] as any;
            if (cell && cell.v != null) {
                const x = headerWidth + c * cellWidth + cellWidth / 2;
                const y = headerHeight + r * cellHeight + cellHeight / 2;
                ctx.fillStyle = '#333333';
                ctx.fillText(String(cell.v), x, y);
            }
        }
    }
}

function renderConditionFormat(data: unknown[][], rules: RawRuleObject[]): void {
    const result = engine.compute(rules, data);
    const map = result.toObject();

    const canvas = document.getElementById('luckysheet-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellWidth = 80;
    const cellHeight = 24;
    const headerWidth = 46;
    const headerHeight = 20;

    for (const key in map) {
        const [r, c] = key.split('_').map(Number);
        const style = map[key];
        const x = headerWidth + c * cellWidth;
        const y = headerHeight + r * cellHeight;

        if (style.cellColor) {
            ctx.fillStyle = style.cellColor;
            ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
        }

        if (style.textColor) {
            const cell = data[r]?.[c] as any;
            if (cell && cell.v != null) {
                ctx.fillStyle = style.textColor;
                ctx.font = '12px -apple-system, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(cell.v), x + cellWidth / 2, y + cellHeight / 2);
            }
        }
    }

    updateStatus(`条件格式已应用，${Object.keys(map).length} 个单元格受影响`);
}

const testData = createTestData(20, 10);

const defaultRules: RawRuleObject[] = [
    {
        type: 'default',
        cellrange: [{ row: [0, 19], column: [0, 9] }],
        format: { textColor: '#9c0006', cellColor: '#ffc7ce' },
        conditionName: 'greaterThan',
        conditionRange: [],
        conditionValue: [50],
    },
];

document.addEventListener('DOMContentLoaded', () => {
    initCanvas(testData);

    const btnGreater = document.getElementById('btn-cf-greater');
    btnGreater?.addEventListener('click', () => {
        renderConditionFormat(testData, defaultRules);
    });

    const btnDataBar = document.getElementById('btn-cf-databar');
    btnDataBar?.addEventListener('click', () => {
        const rules: RawRuleObject[] = [
            {
                type: 'dataBar',
                cellrange: [{ row: [0, 19], column: [0, 9] }],
                format: ['#638ec6', '#ffffff'],
            },
        ];
        renderConditionFormat(testData, rules);
    });

    const btnColor = document.getElementById('btn-cf-color');
    btnColor?.addEventListener('click', () => {
        const rules: RawRuleObject[] = [
            {
                type: 'colorGradation',
                cellrange: [{ row: [0, 19], column: [0, 9] }],
                format: ['rgb(99, 190, 123)', 'rgb(255, 235, 132)', 'rgb(248, 105, 107)'],
            },
        ];
        renderConditionFormat(testData, rules);
    });

    const btnIcons = document.getElementById('btn-cf-icons');
    btnIcons?.addEventListener('click', () => {
        const iconFormat = ICON_FORMAT_MAP.threeWayArrowMultiColor;
        const rules: RawRuleObject[] = [
            {
                type: 'icons',
                cellrange: [{ row: [0, 19], column: [0, 9] }],
                format: iconFormat,
            },
        ];
        renderConditionFormat(testData, rules);
    });

    const btnDelete = document.getElementById('btn-cf-delete');
    btnDelete?.addEventListener('click', () => {
        initCanvas(testData);
        updateStatus('条件格式已清除');
    });

    const btnTest = document.getElementById('btn-test-all');
    btnTest?.addEventListener('click', async () => {
        updateStatus('运行测试中...');
        try {
            const { runTests } = await import('./test-runner.ts');
            const passed = runTests();
            updateStatus(passed ? '✅ 所有测试通过' : '❌ 部分测试失败');
        } catch {
            updateStatus('⚠️ 测试运行器未就绪');
        }
    });

    updateStatus('就绪 - 点击工具栏按钮测试条件格式');
});
