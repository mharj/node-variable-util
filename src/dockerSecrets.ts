import * as path from 'path';
import * as fs from 'fs';
import {IParameters} from '.';
import {LoggerLike} from './loggerLike';

let dockerSecretsBasePath = '/run/secrets';

export function setDockerSecretsPath(path: string) {
	dockerSecretsBasePath = path;
}

function getDockerSecretPath(name: string, config?: IParameters): string {
	return path.join(dockerSecretsBasePath, config && config.secretsFileLowerCase ? name.toLowerCase() : name);
}

let dockerSecrets: Record<string, string> = {};
export function getVariableFromDockerSecret(logger: LoggerLike | undefined, name: string, config?: IParameters): string | undefined {
	if (name in dockerSecrets) {
		logger && logger.info(`config ${name} from docker secrets`);
		return dockerSecrets[name];
	}
	const path = getDockerSecretPath(name, config);
	if (fs.existsSync(getDockerSecretPath(name, config))) {
		logger && logger.info(`config ${name} from docker secrets`);
		dockerSecrets[name] = fs.readFileSync(path).toString();
		return dockerSecrets[name];
	}
	return undefined;
}
