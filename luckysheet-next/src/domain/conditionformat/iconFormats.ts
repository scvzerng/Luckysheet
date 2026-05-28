import type { IconFormatEntry } from '../../shared/types/index.js';

export const ICON_FORMAT_MAP: Record<string, IconFormatEntry> = {
    threeWayArrowMultiColor: { len: 3, leftMin: 0, top: 0 },
    threeTriangles: { len: 3, leftMin: 0, top: 1 },
    fourWayArrowMultiColor: { len: 4, leftMin: 0, top: 2 },
    fiveWayArrowMultiColor: { len: 5, leftMin: 0, top: 3 },
    threeWayArrowGrayColor: { len: 3, leftMin: 5, top: 0 },
    fourWayArrowGrayColor: { len: 4, leftMin: 5, top: 1 },
    fiveWayArrowGrayColor: { len: 5, leftMin: 5, top: 2 },
    threeColorTrafficLightRimless: { len: 3, leftMin: 0, top: 4 },
    threeSigns: { len: 3, leftMin: 0, top: 5 },
    greenRedBlackGradient: { len: 4, leftMin: 0, top: 6 },
    threeColorTrafficLightBordered: { len: 3, leftMin: 5, top: 4 },
    fourColorTrafficLight: { len: 4, leftMin: 5, top: 5 },
    threeSymbolsCircled: { len: 3, leftMin: 0, top: 7 },
    tricolorFlag: { len: 3, leftMin: 0, top: 8 },
    threeSymbolsnoCircle: { len: 3, leftMin: 5, top: 7 },
    threeStars: { len: 3, leftMin: 0, top: 9 },
    fiveQuadrantDiagram: { len: 5, leftMin: 0, top: 10 },
    fiveBoxes: { len: 5, leftMin: 0, top: 11 },
    grade4: { len: 4, leftMin: 5, top: 9 },
    grade5: { len: 5, leftMin: 5, top: 10 },
};

export const ICON_FORMAT_NAMES = Object.keys(ICON_FORMAT_MAP);
