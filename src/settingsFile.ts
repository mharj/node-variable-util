import * as fs from 'fs';
import * as path from 'path';
import {IParameters} from '.';
import {LoggerLike} from './loggerLike';
let settingsFile = './settings.json';
export function setSettingsFile(file: string) {
	settingsFile = file;
}

function getSettingsFilePath(): string {
	return path.resolve(settingsFile);
}

let settings: Record<string, string> | undefined;
export function getVariableFromSettingsFile(logger: LoggerLike | undefined, name: string, config?: IParameters) {
	const fileName = getSettingsFilePath();
	if (!settings) {
		if (fileName && fs.existsSync(fileName)) {
			logger && logger.debug(`load settings from ${fileName}`);
			settings = JSON.parse(fs.readFileSync(fileName).toString());
		}
	}
	if (settings && name in settings && settings[`${name}`] !== null) {
		logger && logger.info(`config ${name} from ${fileName}`);
		return '' + settings[`${name}`];
	}
	return undefined;
}
