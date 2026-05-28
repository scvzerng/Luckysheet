export type CellValueType = string | number | boolean | null;

export type CellType = 'n' | 's' | 'g' | 'd' | 'b' | null;

export interface CellFormat {
    fa: string;
    t: CellType;
}

export interface RawCellObject {
    v?: CellValueType;
    m?: string;
    ct?: CellFormat;
    bg?: string | null;
    fc?: string;
    bl?: number;
    it?: number;
    ff?: number | string;
    fs?: number;
    ht?: number;
    vt?: number;
    mc?: { r: number; c: number; rs: number; cs: number } | null;
    f?: string;
    ps?: unknown;
    qp?: number;
    tb?: number;
}

export interface RangeBoundary {
    row: [number, number];
    column: [number, number];
}

export interface CellStyle {
    textColor?: string;
    cellColor?: string;
    dataBar?: DataBarStyle;
    icons?: IconStyle;
}

export interface DataBarStyle {
    valueType: 'plus' | 'minus';
    valueLen: number;
    format: string[];
    plusLen?: number;
    minusLen?: number;
}

export interface IconStyle {
    left: number;
    top: number;
}

export type ConditionName =
    | 'greaterThan'
    | 'lessThan'
    | 'betweenness'
    | 'equal'
    | 'textContains'
    | 'occurrenceDate'
    | 'duplicateValue'
    | 'top10'
    | 'top10%'
    | 'last10'
    | 'last10%'
    | 'AboveAverage'
    | 'SubAverage'
    | 'regExp'
    | 'sort'
    | 'formula';

export type RuleType = 'default' | 'dataBar' | 'colorGradation' | 'icons';

export interface RawRuleObject {
    type: RuleType;
    cellrange: RangeBoundary[];
    format: unknown;
    conditionName?: ConditionName;
    conditionRange?: RangeBoundary[];
    conditionValue?: unknown[];
}

export type ComputeMap = Record<string, CellStyle>;

export interface ParseResult {
    conditionRange: RangeBoundary[];
    conditionValue: unknown[];
}

export interface IconFormatEntry {
    len: number;
    leftMin: number;
    top: number;
}
