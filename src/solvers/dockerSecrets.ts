import * as path from 'path';
import * as fs from 'fs';
import {IConfig, PromiseVariableSolver, SolveResponse} from '../interfaces';

let dockerSecretsBasePath = '/run/secrets';

export function setDockerSecretsPath(path: string) {
	dockerSecretsBasePath = path;
}

function getDockerSecretPath(name: string, config: IConfig = {}): string {
	return path.join(path.resolve(dockerSecretsBasePath), config.secretsFileLowerCase ? name.toLowerCase() : name);
}

const dockerResponses: Record<string, SolveResponse> = {};
export const dockerSecretVariable: PromiseVariableSolver = {
	name: 'docker-secrets',
	getAsync: async (key, config) => {
		const path = getDockerSecretPath(key, config);
		if (key in dockerResponses) {
			return dockerResponses[`${key}`];
		}
		dockerResponses[`${key}`] = {value: undefined};
		if (fs.existsSync(path)) {
			dockerResponses[`${key}`] = {
				value: (await fs.promises.readFile(path)).toString(),
				location: path,
			};
		}
		return dockerResponses[`${key}`];
	},
};
