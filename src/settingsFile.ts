import * as fs from 'fs';
import {IParameters} from '.';
import {LoggerLike} from './loggerLike';
let settingsFile = './settings.json';
export function setSettingsFile(file: string) {
	settingsFile = file;
}

let settings: Record<string, string> | undefined;
export function getVariableFromSettingsFile(logger: LoggerLike | undefined, name: string, config?: IParameters) {
	if (!settings) {
		if (settingsFile && fs.existsSync(settingsFile)) {
			settings = JSON.parse(fs.readFileSync(settingsFile).toString());
		}
	}
	if (settings && name in settings && settings[`${name}`] !== null) {
		logger && logger.info(`config ${name} from settings.json`);
		return '' + settings[`${name}`];
	}
	return undefined;
}
