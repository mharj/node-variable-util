import {URL} from 'url';
import {AnySolver, IConfig, isPromiseVariableSolver, isVariableSolver, SolveResponse} from './interfaces';
import {LoggerLike} from './loggerLike';

export class VariableManager {
	private logger: LoggerLike | undefined;
	private solvers: AnySolver[];
	private promises: Record<string, Promise<string | undefined>> = {};
	constructor(solvers: AnySolver[], logger?: LoggerLike | undefined) {
		this.solvers = solvers;
		this.logger = logger;
		this.get = this.get.bind(this);
		this.setLogger = this.setLogger.bind(this);
	}
	public setLogger(logger: LoggerLike) {
		this.logger = logger;
	}

	public get(name: string, defaultValue: string, config?: IConfig): Promise<string>;
	public get(name: string, defaultValue?: string | undefined, config?: IConfig): Promise<string | undefined>;
	public get(name: string, defaultValue?: string | undefined, config?: IConfig): Promise<string | undefined> {
		if (!this.promises[name]) {
			this.promises[name] = new Promise(async (resolve, reject) => {
				for (const solver of this.solvers) {
					let res: SolveResponse | undefined;
					try {
						if (isVariableSolver(solver)) {
							res = solver.get(name, config);
						}
						if (isPromiseVariableSolver(solver)) {
							res = await solver.getAsync(name, config);
						}
					} catch (err) {
						reject(err);
					}
					if (res && res.value) {
						this.logger &&
							this.logger.info(
								`variables: ${name}${this.printValue(res.value, config)} with "${solver.name}" module ${res.location ? 'from ' + res.location : ''}`,
							);
						return resolve(res.value);
					}
				}
				if (defaultValue) {
					this.logger && this.logger.info(`variables: ${name}${this.printValue(defaultValue, config)} from default value`);
					return resolve(defaultValue);
				}
				resolve(undefined);
			});
		}
		return this.promises[name];
	}
	private printValue(value: string | undefined, config: IConfig | undefined) {
		if (!config || (!config.showValue && !config.sanitizeUrl)) {
			return '';
		}
		if (value && config.sanitizeUrl) {
			return ` [${this.urlSanitize(value)}]`;
		}
		return ` [${value}]`;
	}
	private urlSanitize(value: string): string {
		try {
			const url = new URL(value);
			url.password = '*'.repeat(url.password.length);
			url.username = '*'.repeat(url.username.length);
			return url.href;
		} catch (err) {
			// warn to log if can't parse url
			this.logger && this.logger.warn('variables:', err);
			return value;
		}
	}
}
