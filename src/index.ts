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
	showValue?: boolean;
}

let logger: LoggerLike | undefined;
export function setLogger(newLogger: LoggerLike) {
	logger = newLogger;
}
// TODO: build function to change check order
const checkOrder = ['dockersecret', 'env', 'settingsfile'];

export function printValue(value: string | undefined, config: IParameters | undefined) {
	if ( ! config || ! config.showValue) {
		return '';
	}
	return ` [${value}]`;
}

export async function getConfigVariable(name: string, defaultValue: string, config?: IParameters): Promise<string>;
export async function getConfigVariable(name: string, defaultValue?: string | undefined, config?: IParameters): Promise<string | undefined>;
export async function getConfigVariable(name: string, defaultValue?: string | undefined, config?: IParameters): Promise<string | undefined> {
	for (const checkType of checkOrder) {
		switch (checkType) {
			case 'dockersecret': {
				const dockerValue = getVariableFromDockerSecret(logger, name, config);
				if (dockerValue) {
					return dockerValue;
				}
				break;
			}
			case 'env': {
				const envValue = getVariableFromEnv(logger, name, config);
				if (envValue) {
					return envValue;
				}
				break;
			}
			case 'settingsfile': {
				const settingsValue = getVariableFromSettingsFile(logger, name, config);
				if (settingsValue) {
					return settingsValue;
				}
				break;
			}
			default:
				throw new TypeError(`variables: unknown check type ${checkType}`);
		}
	}
	if (defaultValue) {
		logger && logger.info(`variables: ${name}${printValue(defaultValue, config)} from default value`);
		return defaultValue;
	}
	return undefined;
}
