import type { CellValueType, CellType, RawCellObject } from '../shared/types/index.js';

export class Cell {
    readonly row: number;
    readonly col: number;
    private readonly _raw: RawCellObject | null;

    constructor(row: number, col: number, rawData: RawCellObject | null) {
        this.row = row;
        this.col = col;
        this._raw = rawData;
    }

    get exists(): boolean {
        return this._raw != null
            && typeof this._raw === 'object'
            && !Cell._isNull(this._raw.v);
    }

    get value(): CellValueType {
        return this.exists ? this._raw!.v ?? null : null;
    }

    get displayValue(): string | null {
        return this._raw?.m ?? this._raw?.v?.toString() ?? null;
    }

    get cellType(): CellType {
        return this._raw?.ct?.t ?? null;
    }

    get isNumber(): boolean {
        return this.cellType === 'n' && this.value != null;
    }

    get isDate(): boolean {
        return this.cellType === 'd';
    }

    get isText(): boolean {
        return this.cellType === 'g' || this.cellType === 's';
    }

    get rawCell(): RawCellObject | null {
        return this._raw;
    }

    get key(): string {
        return `${this.row}_${this.col}`;
    }

    numericValue(): number | null {
        return this.isNumber ? parseInt(this.value as string, 10) : null;
    }

    floatValue(): number | null {
        return this.isNumber ? parseFloat(this.value as string) : null;
    }

    private static _isNull(v: unknown): boolean {
        return v === null || v === undefined || v === '';
    }
}
