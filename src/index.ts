export {setSettingsFile} from './settingsFile';
export {setDockerSecretsPath} from './dockerSecrets';
import {config as dotEnvConfig} from 'dotenv';
import {getVariableFromDockerSecret} from './dockerSecrets';
import {getVariableFromEnv} from './envProcess';
import {LoggerLike} from './loggerLike';
import {getVariableFromSettingsFile} from './settingsFile';

dotEnvConfig();

export interface IParameters {
	secretsFileLowerCase?: boolean;
}

let logger: LoggerLike | undefined;
export function setLogger(newLogger: LoggerLike) {
	logger = newLogger;
}

export async function getConfigVariable(name: string, defaultValue?: string | undefined, config?: IParameters): Promise<string | undefined>;
export async function getConfigVariable(name: string, defaultValue: string, config?: IParameters): Promise<string>;
export async function getConfigVariable(name: string, defaultValue: undefined, config?: IParameters): Promise<string | undefined>;
export async function getConfigVariable(name: string, defaultValue: string | undefined, config?: IParameters): Promise<string | undefined> {
	const dockerValue = getVariableFromDockerSecret(logger, name, config);
	if (dockerValue) {
		return dockerValue;
	}
	const envValue = getVariableFromEnv(logger, name, config);
	if (envValue) {
		return envValue;
	}
	const settingsValue = getVariableFromSettingsFile(logger, name, config);
	if (settingsValue) {
		return settingsValue;
	}
	if (defaultValue) {
		logger && logger.info(`config ${name} from default value`);
		return defaultValue;
	}
	return undefined;
}
