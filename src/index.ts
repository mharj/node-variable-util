export {setSettingsFile} from './solvers/jsonFile';
export {setDockerSecretsPath} from './solvers/dockerSecrets';
export {VariableManager} from './VariableManager';
import {dockerSecretVariable} from './solvers/dockerSecrets';
import {envVariable} from './solvers/processEnv';
import {LoggerLike} from './loggerLike';
import {VariableManager} from './VariableManager';
import {jsonFileVariables} from './solvers/jsonFile';
import {IConfig} from './interfaces';

/** defaultManager as legacy compatibility setup */
let defaultManager: VariableManager | undefined;
function getDefaultManager() {
	if (!defaultManager) {
		defaultManager = new VariableManager([dockerSecretVariable, envVariable, jsonFileVariables()]);
	}
	return defaultManager;
}

export function setLogger(newLogger: LoggerLike) {
	getDefaultManager().setLogger(newLogger);
}

export function getConfigVariable(key: string, defaultValue: string, config?: IConfig): Promise<string>;
export function getConfigVariable(key: string, defaultValue?: string | undefined, config?: IConfig): Promise<string | undefined>;
export function getConfigVariable(key: string, defaultValue?: string | undefined, config?: IConfig): Promise<string | undefined> {
	return getDefaultManager().get(key, defaultValue, config);
}
