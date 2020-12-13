import * as path from 'path';
import * as fs from 'fs';
import {IParameters} from '.';
import {LoggerLike} from './loggerLike';

let dockerSecretsBasePath = '/run/secrets';

export function setDockerSecretsPath(path: string) {
	dockerSecretsBasePath = path;
}

function getDockerSecretPath(name: string, config?: IParameters): string {
	return path.join(path.resolve(dockerSecretsBasePath), config && config.secretsFileLowerCase ? name.toLowerCase() : name);
}

let dockerSecrets: Record<string, string | undefined> = {};
export function getVariableFromDockerSecret(logger: LoggerLike | undefined, name: string, config?: IParameters): string | undefined {
	const path = getDockerSecretPath(name, config);
	if (name in dockerSecrets) {
		if (dockerSecrets[`${name}`]) {
			logger && logger.info(`variables: ${name} from ${path}`);
		}
		return dockerSecrets[`${name}`];
	}
	dockerSecrets[`${name}`] = undefined;
	if (fs.existsSync(path)) {
		logger && logger.info(`variables: ${name} from ${path}`);
		dockerSecrets[`${name}`] = fs.readFileSync(path).toString();
	}
	return dockerSecrets[`${name}`];
}
