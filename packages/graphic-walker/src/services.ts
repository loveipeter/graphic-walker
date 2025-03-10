import { toJS } from 'mobx';
import { IRow, IMutField, IFilterField, Specification } from './interfaces';
/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
// eslint-disable-next-line
// import InsightSpaceWorker from './workers/InsightService.worker?worker';
/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
// eslint-disable-next-line
// import ExplainerWorker from './workers/explainer.worker?worker&inline';
import FilterWorker from './workers/filter.worker?worker&inline';
import TransformDataWorker from './workers/transform.worker?worker&inline';
import ViewQueryWorker from './workers/viewQuery.worker?worker&inline';
import { IViewQuery } from './lib/viewQuery';

// interface WorkerState {
//     eWorker: Worker | null;
// }

// const workerState: WorkerState = {
//     eWorker: null,
// }

function workerService<T, R>(worker: Worker, data: R): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        worker.postMessage(data);
        worker.onmessage = (e: MessageEvent) => {
            resolve(e.data);
        };
        worker.onerror = (e: ErrorEvent) => {
            reject({
                success: false,
                message: e,
            });
        };
    });
}

// interface ExplainParams {
//     dimensions: string[];
//     measures: string[];
//     dataSource: IRow[];
//     filters?: Filters;
//     currentSpace: {
//         dimensions: string[];
//         measures: IMeasure[];
//     };
// }
export interface IVisSpace {
    dataView: IRow[];
    schema: Specification;
}
// interface ExplainReturns {
//     explainations: IExplaination[];
//     valueExp: IMeasureWithStat[];
//     visSpaces: IVisSpace[];
//     fieldsWithSemanticType: Array<{ key: string; type: SemanticType }>;
// }
// export async function getExplaination(props: ExplainParams) {
//     const worker = workerState.eWorker;
//     if (worker === null) throw new Error('init worker first.')
//     let result: ExplainReturns = {
//         explainations: [],
//         valueExp: [],
//         visSpaces: [],
//         fieldsWithSemanticType: [],
//     };
//     try {
//         result = await workerService<ExplainReturns, { type: string; data: ExplainParams }>(
//             worker,
//             {
//                 type: 'getExplaination',
//                 data: props
//             }
//         );
//         return result;
//     } catch (error) {
//         console.error(error);
//     }
//     return result;
// }

interface PreAnalysisParams {
    fields: IMutField[];
    dataSource: IRow[];
}
// export async function preAnalysis(props: PreAnalysisParams) {
//     if (workerState.eWorker !== null) {
//         workerState.eWorker.terminate();
//     }
//     try {
//         workerState.eWorker = new ExplainerWorker() as Worker;
//         const tmp = await workerService<boolean, { type: string; data: PreAnalysisParams}>(workerState.eWorker, { type: 'preAnalysis', data: props });
//     } catch (error) {
//         console.error(error)
//     }
// }

// export function destroyWorker() {
//     if (workerState.eWorker) {
//         workerState.eWorker.terminate();
//         workerState.eWorker = null;
//     }
// }

let filterWorker: Worker | null = null;
let filterWorkerAutoTerminator: NodeJS.Timeout | null = null;

export const applyFilter = async (data: IRow[], filters: readonly IFilterField[]): Promise<IRow[]> => {
    if (filters.length === 0) return data;
    if (filterWorkerAutoTerminator !== null) {
        clearTimeout(filterWorkerAutoTerminator);
        filterWorkerAutoTerminator = null;
    }

    if (filterWorker === null) {
        filterWorker = new FilterWorker();
    }

    try {
        const res: IRow[] = await workerService(filterWorker, {
            dataSource: data,
            filters: toJS(filters),
        });

        return res;
    } catch (error) {
        // @ts-ignore @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
        throw new Error('Uncaught error in FilterWorker', { cause: error });
    } finally {
        if (filterWorkerAutoTerminator !== null) {
            clearTimeout(filterWorkerAutoTerminator);
        }

        filterWorkerAutoTerminator = setTimeout(() => {
            filterWorker?.terminate();
            filterWorker = null;
            filterWorkerAutoTerminator = null;
        }, 60_000); // Destroy the worker when no request is received for 60 secs
    }
};

export const transformDataService = async (data: IRow[], columns: IMutField[]): Promise<IRow[]> => {
    if (columns.length === 0 || data.length === 0) return data;
    const worker = new TransformDataWorker();
    try {
        const res: IRow[] = await workerService(worker, {
            dataSource: data,
            columns: toJS(columns),
        });
        return res;
    } catch (error) {
        throw new Error('Uncaught error in TransformDataWorker', { cause: error });
    } finally {
        worker.terminate();
    }
}

export const applyViewQuery = async (data: IRow[], metas: IMutField[], query: IViewQuery): Promise<IRow[]> => {
    const worker = new ViewQueryWorker();
    try {
        const res: IRow[] = await workerService(worker, {
            dataSource: data,
            metas: toJS(metas),
            query: toJS(query),
        });
        return res;
    } catch (err) {
        throw new Error('Uncaught error in ViewQueryWorker', { cause: err });
    } finally {
        worker.terminate();
    }
}