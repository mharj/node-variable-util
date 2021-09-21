process.env.NODE_ENV = 'test';
process.env.ENV_VALUE1 = 'env_value';
process.env.ENV_VALUE2 = 'env_value';
import {expect} from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import {getConfigVariable, setSettingsFile, setDockerSecretsPath, setLogger} from '../src/';
import {LoggerLike} from '../src/loggerLike';

const debugSpy = sinon.spy();
const infoSpy = sinon.spy();
const errorSpy = sinon.spy();
const warnSpy = sinon.spy();
const traceSpy = sinon.spy();

const sinonLogger: LoggerLike = {
	debug: debugSpy,
	info: infoSpy,
	error: errorSpy,
	warn: warnSpy,
	trace: traceSpy,
};

describe('config variable', () => {
	before(async function () {
		setLogger(sinonLogger);
		setSettingsFile('./test/testSettings.json');
		setDockerSecretsPath('./test');
	});

	describe('default value test', async () => {
		it('should return default value', async function () {
			expect(await getConfigVariable('test1', 'default')).to.be.eq('default');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq('variables: test1 from default value');
			infoSpy.resetHistory();

			expect(await getConfigVariable('test2', 'default', {showValue: true})).to.be.eq('default');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq('variables: test2 [default] from default value');
			infoSpy.resetHistory();
		});
	});
	describe('default url sanitize value test', async () => {
		it('should return default value', async function () {
			expect(await getConfigVariable('test3', 'http://user:password@localhost/path', {sanitizeUrl: true})).to.be.eq('http://user:password@localhost/path');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq(`variables: test3 [http://****:********@localhost/path] from default value`);
			infoSpy.resetHistory();
		});
	});
	describe('undefined value test', async () => {
		it('should return undefined value', async function () {
			expect(await getConfigVariable('test4')).to.be.undefined;
		});
	});
	describe('settings file value test', async () => {
		it('should return settings value', async function () {
			expect(await getConfigVariable('SETTINGS_VARIABLE1', 'default')).to.be.eq('settings_file');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0])
				.to.be.a('string')
				.and.satisfy((msg: string) => msg.startsWith('variables: SETTINGS_VARIABLE1 with "json-file" module from'));
			infoSpy.resetHistory();

			expect(await getConfigVariable('SETTINGS_VARIABLE2', 'default', {showValue: true})).to.be.eq('settings_file');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0])
				.to.be.a('string')
				.and.satisfy((msg: string) => msg.startsWith('variables: SETTINGS_VARIABLE2 [settings_file] with "json-file" module from'));
			infoSpy.resetHistory();
		});
	});
	describe('env value test', async () => {
		it('should return env value', async function () {
			expect(await getConfigVariable('ENV_VALUE1', 'default')).to.be.eq('env_value');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq('variables: ENV_VALUE1 with "env" module from process.env.ENV_VALUE1');
			infoSpy.resetHistory();

			expect(await getConfigVariable('ENV_VALUE2', 'default', {showValue: true})).to.be.eq('env_value');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq('variables: ENV_VALUE2 [env_value] with "env" module from process.env.ENV_VALUE2');
			infoSpy.resetHistory();
		});
	});
	describe('docker secrets value test', async () => {
		it('should return docker secrets value', async function () {
			expect(
				await getConfigVariable('DOCKERSECRET1', 'default', {
					secretsFileLowerCase: true,
				}),
			).to.be.eq('docker_value');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0])
				.to.be.a('string')
				.and.satisfy((msg: string) => msg.startsWith('variables: DOCKERSECRET1 with "docker-secrets" module from'));
			infoSpy.resetHistory();

			expect(await getConfigVariable('dockersecret2', 'default', {showValue: true})).to.be.eq('docker_value');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0])
				.to.be.a('string')
				.and.satisfy((msg: string) => msg.startsWith('variables: dockersecret2 [docker_value] with "docker-secrets" module from'));
			infoSpy.resetHistory();
		});
	});
});
