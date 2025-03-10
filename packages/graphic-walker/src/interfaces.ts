export type DeepReadonly<T extends Record<keyof any, any>> = {
    readonly [K in keyof T]: T[K] extends Record<keyof any, any> ? DeepReadonly<T[K]> : T[K];
};
export type ISemanticType = 'quantitative' | 'nominal' | 'ordinal' | 'temporal';
export type IDataType = 'number' | 'integer' | 'boolean' | 'date' | 'string';
export type IAnalyticType = 'dimension' | 'measure';

export interface IRow {
    [key: string]: any;
}

export type IAggregator = 'sum' | 'count' | 'max' | 'min' | 'mean' | 'median' | 'variance' | 'stdev';
export interface Specification {
    position?: string[];
    color?: string[];
    size?: string[];
    shape?: string[];
    opacity?: string[];
    facets?: string[];
    page?: string[];
    filter?: string[];
    highFacets?: string[];
    geomType?: string[];
    aggregate?: boolean;
}
export interface Filters {
    [key: string]: any[];
}

export interface IMutField {
    fid: string;
    key?: string;
    name?: string;
    disable?: boolean;
    semanticType: ISemanticType;
    analyticType: IAnalyticType;
}

export interface IUncertainMutField {
    fid: string;
    key?: string;
    name?: string;
    disable?: boolean;
    semanticType: ISemanticType | '?';
    analyticType: IAnalyticType | '?';
}

export type IExpParamter =
    | {
          type: 'field';
          value: string;
      }
    | {
          type: 'value';
          value: any;
      }
    | {
          type: 'expression';
          value: IExpression;
      }
    | {
          type: 'constant';
          value: any;
      };

export interface IExpression {
    op: 'bin' | 'log2' | 'log10' | 'one' | 'binCount';
    params: IExpParamter[];
    as: string;
}

export interface IField {
    /**
     * fid: key in data record
     */
    fid: string;
    /**
     * display name for field
     */
    name: string;
    /**
     * aggregator's name
     */
    aggName?: string;
    semanticType: ISemanticType;
    analyticType: IAnalyticType;
    cmp?: (a: any, b: any) => number;
    computed?: boolean;
    expressoion?: IExpression;
}

export interface IViewField extends IField {
    dragId: string;
    sort?: 'none' | 'ascending' | 'descending';
}

export interface DataSet {
    id: string;
    name: string;
    rawFields: IMutField[];
    dataSource: IRow[];
}

export interface IFieldNeighbor {
    key: string;
    cc: number;
}

export interface IMeasure {
    key: string;
    op: IAggregator;
}

export interface IPredicate {
    key: string;
    type: "discrete" | "continuous";
    range: Set<any> | [number, number];
}

export interface IExplainProps {
    dataSource: IRow[];
    predicates: IPredicate[];
    viewFields: IField[];
    metas: IField[];
}

export interface IDataSet {
    id: string;
    name: string;
    rawFields: IMutField[];
    dsId: string;
}
/**
 * use as props to create a new dataset(IDataSet).
 */
export interface IDataSetInfo {
    name: string;
    rawFields: IMutField[];
    dataSource: IRow[];
}

export interface IDataSource {
    id: string;
    data: IRow[];
}

export interface IFilterField extends IViewField {
    rule: IFilterRule | null;
}

export interface DraggableFieldState {
    dimensions: IViewField[];
    measures: IViewField[];
    rows: IViewField[];
    columns: IViewField[];
    color: IViewField[];
    opacity: IViewField[];
    size: IViewField[];
    shape: IViewField[];
    theta: IViewField[];
    radius: IViewField[];
    details: IViewField[];
    filters: IFilterField[];
}

export interface IDraggableStateKey {
    id: keyof DraggableFieldState;
    mode: number;
}

export type IFilterRule =
    | {
          type: 'range';
          value: readonly [number, number];
      }
    | {
          type: 'temporal range';
          value: readonly [number, number];
      }
    | {
          type: 'one of';
          value: Set<string | number>;
      };

export const EXPLORATION_TYPES = ['none', 'brush', 'point'] as const;

export const BRUSH_DIRECTIONS = ['default', 'x', 'y'] as const;

export type IStackMode = 'none' | 'stack' | 'normalize';
export type IExplorationType = typeof EXPLORATION_TYPES[number];
export type IBrushDirection = typeof BRUSH_DIRECTIONS[number];

export interface IVisualConfig {
    defaultAggregated: boolean;
    geoms: string[];
    stack: IStackMode;
    showActions: boolean;
    interactiveScale: boolean;
    sorted: 'none' | 'ascending' | 'descending';
    size: {
        mode: 'auto' | 'fixed';
        width: number;
        height: number;
    };
    exploration: {
        mode: IExplorationType;
        /** works when mode is 'brush' */
        brushDirection: IBrushDirection;
    };
}

export interface IVisSpec {
    readonly visId: string;
    readonly name?: string;
    readonly encodings: DeepReadonly<DraggableFieldState>;
    readonly config: DeepReadonly<IVisualConfig>;
}

export enum ISegmentKey {
    vis = 'vis',
    data = 'data',
}

export type IThemeKey = 'vega' | 'g2' | 'dls';
export type IDarkMode = 'media' | 'light' | 'dark';
