export interface IConfig {
	secretsFileLowerCase?: boolean;
	showValue?: boolean;
	sanitizeUrl?: boolean;
}

export interface SolveResponse {
	value: string | undefined;
	location?: string;
}

export interface PromiseVariableSolver {
	name: string;
	getAsync: (key: string, config: IConfig | undefined) => Promise<SolveResponse>;
}

export function isPromiseVariableSolver(solver: AnySolver): solver is PromiseVariableSolver {
	return solver && 'name' in solver && 'getAsync' in solver;
}

export interface VariableSolver {
	name: string;
	get: (key: string, config: IConfig | undefined) => SolveResponse;
}

export function isVariableSolver(solver: AnySolver): solver is VariableSolver {
	return solver && 'name' in solver && 'get' in solver;
}

export type AnySolver = PromiseVariableSolver | VariableSolver;
