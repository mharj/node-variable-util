import {IParameters, printValue} from '.';
import {LoggerLike} from './loggerLike';

export function getVariableFromEnv(logger: LoggerLike | undefined, name: string, config?: IParameters): string | undefined {
	if (name in process.env) {
		logger && logger.info(`variables: ${name}${printValue(process.env[`${name}`], config)} from process.env.${name}`);
		return process.env[`${name}`];
	}
	return undefined;
}
