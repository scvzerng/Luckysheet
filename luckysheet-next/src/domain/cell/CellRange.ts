import type { RangeBoundary } from '../shared/types/index.js';
import { Cell } from './Cell.js';

export class CellRange {
    private readonly _ranges: RangeBoundary[];
    private readonly _data: unknown[][];

    constructor(ranges: RangeBoundary[], data: unknown[][]) {
        this._ranges = ranges;
        this._data = data;
    }

    *eachCell(): Generator<Cell> {
        for (const range of this._ranges) {
            for (let r = range.row[0]; r <= range.row[1]; r++) {
                for (let c = range.column[0]; c <= range.column[1]; c++) {
                    const row = this._data[r];
                    const raw = row ? row[c] : null;
                    yield new Cell(r, c, raw as any);
                }
            }
        }
    }

    *eachExistingCell(): Generator<Cell> {
        for (const cell of this.eachCell()) {
            if (cell.exists) yield cell;
        }
    }

    *eachNumericCell(): Generator<Cell> {
        for (const cell of this.eachCell()) {
            if (cell.isNumber) yield cell;
        }
    }

    *eachDateCell(): Generator<Cell> {
        for (const cell of this.eachCell()) {
            if (cell.isDate) yield cell;
        }
    }

    get numericValues(): number[] {
        const values: number[] = [];
        for (const cell of this.eachNumericCell()) {
            const v = cell.numericValue();
            if (v !== null) values.push(v);
        }
        return values;
    }

    getStatistics(): { min: number | null; max: number | null; sum: number; count: number; avg: number | null } {
        let min: number | null = null;
        let max: number | null = null;
        let sum = 0;
        let count = 0;
        for (const cell of this.eachNumericCell()) {
            const v = cell.numericValue();
            if (v === null) continue;
            count++;
            sum += v;
            if (max === null || v > max) max = v;
            if (min === null || v < min) min = v;
        }
        const avg = count > 0 ? sum / count : null;
        return { min, max, sum, count, avg };
    }

    toRaw(): RangeBoundary[] {
        return JSON.parse(JSON.stringify(this._ranges));
    }
}
