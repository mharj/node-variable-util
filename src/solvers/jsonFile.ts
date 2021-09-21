import * as fs from 'fs';
import * as path from 'path';
import {PromiseVariableSolver, SolveResponse} from '../interfaces';

let defaultSettingsFile = './settings.json';
export function setSettingsFile(settingsFile: string) {
	defaultSettingsFile = settingsFile;
}

async function jsonLoader(file: string): Promise<Record<string, SolveResponse>> {
	const output: Record<string, SolveResponse> = {};
	if (file && fs.existsSync(file)) {
		const values = JSON.parse((await fs.promises.readFile(file)).toString());
		for (const vk in values) {
			output[vk] = {
				value: `${values[vk]}`,
				location: file,
			};
		}
	}
	return output;
}

let settingFiles: Record<string, Promise<Record<string, SolveResponse>>> = {};
export function jsonFileVariables(settingsFile?: string): PromiseVariableSolver {
	return {
		name: 'json-file',
		getAsync: async (key) => {
			const file = settingsFile || defaultSettingsFile;
			if (!settingFiles[file]) {
				settingFiles[file] = jsonLoader(path.resolve(file));
			}
			return (await settingFiles[file])?.[key] || {value: undefined};
		},
	};
}
