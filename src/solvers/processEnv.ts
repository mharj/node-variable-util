import {config as dotEnvConfig} from 'dotenv';
import {VariableSolver} from '../interfaces';

dotEnvConfig();

export const envVariable: VariableSolver = {
	name: 'env',
	get: (key) => {
		if (key in process.env) {
			return {
				value: process.env[`${key}`],
				location: `process.env.${key}`,
			};
		}
		return {
			value: undefined,
		};
	},
};
