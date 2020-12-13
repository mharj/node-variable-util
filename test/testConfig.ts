process.env.NODE_ENV = 'test';
process.env.ENV_VALUE = 'env_value';
import {expect} from 'chai';
import 'mocha';
import {getConfigVariable, setSettingsFile, setDockerSecretsPath} from '../src/';

describe('config variable', () => {
	before(async function () {
		setSettingsFile('./test/testSettings.json');
		setDockerSecretsPath('./test');
	});

	describe('default value test', async () => {
		it('should return default value', async function () {
			expect(await getConfigVariable('test', 'default')).to.be.eq('default');
		});
	});
	describe('undefined value test', async () => {
		it('should return undefined value', async function () {
			expect(await getConfigVariable('test')).to.be.undefined;
		});
	});
	describe('settings file value test', async () => {
		it('should return settings value', async function () {
			expect(await getConfigVariable('SETTINGS_VARIABLE', 'default')).to.be.eq('settings_file');
		});
	});
	describe('env value test', async () => {
		it('should return env value', async function () {
			expect(await getConfigVariable('ENV_VALUE', 'default')).to.be.eq('env_value');
		});
	});
	describe('docker secrets value test', async () => {
		it('should return docker secrets value', async function () {
			expect(
				await getConfigVariable('DOCKERSECRET', 'default', {
					secretsFileLowerCase: true,
				}),
			).to.be.eq('docker_value');
			expect(await getConfigVariable('dockersecret', 'default')).to.be.eq('docker_value');
		});
	});
});
