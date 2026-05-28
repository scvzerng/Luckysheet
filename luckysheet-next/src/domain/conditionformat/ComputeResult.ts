import type { CellStyle } from '../shared/types/index.js';
import { Cell } from '../domain/cell/Cell.js';

export class ComputeResult {
    private readonly _map: Record<string, CellStyle> = {};

    private _ensureEntry(key: string): void {
        if (!(key in this._map)) {
            this._map[key] = {};
        }
    }

    setColor(cell: Cell, textColor: string, cellColor: string): void {
        this._ensureEntry(cell.key);
        this._map[cell.key].textColor = textColor;
        this._map[cell.key].cellColor = cellColor;
    }

    setCellColor(cell: Cell, cellColor: string): void {
        this._ensureEntry(cell.key);
        this._map[cell.key].cellColor = cellColor;
    }

    setDataBar(cell: Cell, dataBar: CellStyle['dataBar']): void {
        this._ensureEntry(cell.key);
        this._map[cell.key].dataBar = dataBar;
    }

    setIcons(cell: Cell, icons: CellStyle['icons']): void {
        this._ensureEntry(cell.key);
        this._map[cell.key].icons = icons;
    }

    get(r: number, c: number): CellStyle | null {
        const key = `${r}_${c}`;
        return this._map[key] ?? null;
    }

    toObject(): Record<string, CellStyle> {
        return this._map;
    }
}
