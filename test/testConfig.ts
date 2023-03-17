process.env.NODE_ENV = 'test';
process.env.ENV_VALUE = 'env_value';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import 'mocha';
import * as sinon from 'sinon';
import {getConfigVariable, setSettingsFile, setDockerSecretsPath, setLogger} from '../src/';
import {LoggerLike} from '../src/loggerLike';

chai.use(chaiAsPromised);

const expect = chai.expect;

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
			const call1: Promise<string> = getConfigVariable('test', 'default');
			await expect(call1).to.be.eventually.eq('default');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq('variables: test from default value');
			infoSpy.resetHistory();

			const call2: Promise<string> = getConfigVariable('test', 'default', {showValue: true});
			await expect(call2).to.be.eventually.eq('default');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq('variables: test [default] from default value');
			infoSpy.resetHistory();
		});
	});
	describe('default url sanitize value test', async () => {
		it('should return default value', async function () {
			const call: Promise<string> = getConfigVariable('test', 'http://user:password@localhost/path', {sanitizeUrl: true});
			await expect(call).to.be.eventually.eq('http://user:password@localhost/path');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq(`variables: test [http://****:********@localhost/path] from default value`);
			infoSpy.resetHistory();
		});
	});
	describe('undefined value test', async () => {
		it('should return undefined value', async function () {
			const call: Promise<string | undefined> = getConfigVariable('test');
			await expect(call).to.be.eventually.undefined;
		});
	});
	describe('settings file value test', async () => {
		it('should return settings value', async function () {
			const call1: Promise<string> = getConfigVariable('SETTINGS_VARIABLE', 'default');
			await expect(call1).to.be.eventually.eq('settings_file');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0])
				.to.be.a('string')
				.and.satisfy((msg: string) => msg.startsWith('variables: SETTINGS_VARIABLE from'));
			infoSpy.resetHistory();

			const call2: Promise<string> = getConfigVariable('SETTINGS_VARIABLE', 'default', {showValue: true});
			await expect(call2).to.be.eventually.eq('settings_file');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0])
				.to.be.a('string')
				.and.satisfy((msg: string) => msg.startsWith('variables: SETTINGS_VARIABLE [settings_file] from'));
			infoSpy.resetHistory();
		});
	});
	describe('env value test', async () => {
		it('should return env value', async function () {
			const call1: Promise<string> = getConfigVariable('ENV_VALUE', 'default');
			await expect(call1).to.be.eventually.eq('env_value');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq('variables: ENV_VALUE from process.env.ENV_VALUE');
			infoSpy.resetHistory();

			const call2: Promise<string> = getConfigVariable('ENV_VALUE', 'default', {showValue: true});
			await expect(call2).to.be.eventually.eq('env_value');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq('variables: ENV_VALUE [env_value] from process.env.ENV_VALUE');
			infoSpy.resetHistory();
		});
	});
	describe('docker secrets value test', async () => {
		it('should return docker secrets value', async function () {
			const call1: Promise<string> = getConfigVariable('DOCKERSECRET', 'default', {
				secretsFileLowerCase: true,
			});
			await expect(call1).to.be.eventually.eq('docker_value');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0])
				.to.be.a('string')
				.and.satisfy((msg: string) => msg.startsWith('variables: DOCKERSECRET from'));
			infoSpy.resetHistory();

			const call2: Promise<string> = getConfigVariable('dockersecret', 'default', {showValue: true});
			expect(call2).to.be.eventually.eq('docker_value');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0])
				.to.be.a('string')
				.and.satisfy((msg: string) => msg.startsWith('variables: dockersecret [docker_value] from'));
			infoSpy.resetHistory();
		});
	});
	describe('test logging', async () => {
		it('should return env value', async function () {
			const call: Promise<string> = getConfigVariable('ENV_VALUE', 'default');
			await expect(call).to.be.eventually.eq('env_value');
		});
	});
	describe('test undefined throws', async () => {
		it('should throw error', async function () {
			const call: Promise<string> = getConfigVariable('NOT_FOUND', undefined, {undefinedThrows: true});
			await expect(call).to.be.rejectedWith(Error, `variables: NOT_FOUND is undefined`);
		});
		it('should throw custom error via callback', async function () {
			const call: Promise<string> = getConfigVariable('NOT_FOUND', undefined, {undefinedThrows: () => new Error('custom error')});
			await expect(call).to.be.rejectedWith(Error, `custom error`);
		});
	});
});
