export {setSettingsFile} from './settingsFile';
export {setDockerSecretsPath} from './dockerSecrets';
import {URL} from 'url';
import {config as dotEnvConfig} from 'dotenv';
import {getVariableFromDockerSecret} from './dockerSecrets';
import {getVariableFromEnv} from './envProcess';
import {LoggerLike} from './loggerLike';
import {getVariableFromSettingsFile} from './settingsFile';

dotEnvConfig();

export interface IParameters {
	secretsFileLowerCase?: boolean;
	showValue?: boolean;
	sanitizeUrl?: boolean;
	undefinedThrows?: boolean;
}

export type IThrowsUndefinedParameters = Omit<IParameters, 'undefinedThrows'> & {undefinedThrows: true};

let logger: LoggerLike | undefined;
export function setLogger(newLogger: LoggerLike) {
	logger = newLogger;
}
// TODO: build function to change check order
const checkOrder = ['dockersecret', 'env', 'settingsfile'];

export function urlSanitize(value: string): string {
	try {
		const url = new URL(value);
		url.password = '*'.repeat(url.password.length);
		url.username = '*'.repeat(url.username.length);
		return url.href;
	} catch (err) {
		// warn to log if can't parse url
		logger && logger.warn('variables:', err);
		return value;
	}
}

export function printValue(value: string | undefined, config: IParameters | undefined) {
	if (!config || (!config.showValue && !config.sanitizeUrl)) {
		return '';
	}
	if (value && config.sanitizeUrl) {
		return ` [${urlSanitize(value)}]`;
	}
	return ` [${value}]`;
}

export async function getConfigVariable(name: string, defaultValue: string, config?: IParameters): Promise<string>;
export async function getConfigVariable(name: string, defaultValue: string | undefined, config: IThrowsUndefinedParameters): Promise<string>;
export async function getConfigVariable(name: string, defaultValue?: string | undefined, config?: IParameters): Promise<string | undefined>;
export async function getConfigVariable(name: string, defaultValue?: string | undefined, config?: IParameters): Promise<string | undefined> {
	let output: string | undefined;
	for (const checkType of checkOrder) {
		switch (checkType) {
			case 'dockersecret': {
				const dockerValue = getVariableFromDockerSecret(logger, name, config);
				if (dockerValue) {
					output = dockerValue;
				}
				break;
			}
			case 'env': {
				const envValue = getVariableFromEnv(logger, name, config);
				if (envValue) {
					output = envValue;
				}
				break;
			}
			case 'settingsfile': {
				const settingsValue = getVariableFromSettingsFile(logger, name, config);
				if (settingsValue) {
					output = settingsValue;
				}
				break;
			}
			default:
				throw new TypeError(`variables: unknown check type ${checkType}`);
		}
		if (output) {
			break;
		}
	}
	if (!output && defaultValue) {
		logger && logger.info(`variables: ${name}${printValue(defaultValue, config)} from default value`);
		output = defaultValue;
	}
	if (!output && config && config.undefinedThrows) {
		throw new Error(`variables: ${name} is undefined`);
	}
	return output;
}
