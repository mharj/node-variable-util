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
			expect(await getConfigVariable('test', 'default')).to.be.eq('default');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq('variables: test from default value');
			infoSpy.resetHistory();

			expect(await getConfigVariable('test', 'default', {showValue: true})).to.be.eq('default');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq('variables: test [default] from default value');
			infoSpy.resetHistory();
		});
	});
	describe('default url sanitize value test', async () => {
		it('should return default value', async function () {
			expect(await getConfigVariable('test', 'http://user:password@localhost/path', {sanitizeUrl: true})).to.be.eq('http://user:password@localhost/path');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq(`variables: test [http://****:********@localhost/path] from default value`);
			infoSpy.resetHistory();
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
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0])
				.to.be.a('string')
				.and.satisfy((msg: string) => msg.startsWith('variables: SETTINGS_VARIABLE from'));
			infoSpy.resetHistory();

			expect(await getConfigVariable('SETTINGS_VARIABLE', 'default', {showValue: true})).to.be.eq('settings_file');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0])
				.to.be.a('string')
				.and.satisfy((msg: string) => msg.startsWith('variables: SETTINGS_VARIABLE [settings_file] from'));
			infoSpy.resetHistory();
		});
	});
	describe('env value test', async () => {
		it('should return env value', async function () {
			expect(await getConfigVariable('ENV_VALUE', 'default')).to.be.eq('env_value');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq('variables: ENV_VALUE from process.env.ENV_VALUE');
			infoSpy.resetHistory();

			expect(await getConfigVariable('ENV_VALUE', 'default', {showValue: true})).to.be.eq('env_value');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq('variables: ENV_VALUE [env_value] from process.env.ENV_VALUE');
			infoSpy.resetHistory();
		});
	});
	describe('docker secrets value test', async () => {
		it('should return docker secrets value', async function () {
			expect(
				await getConfigVariable('DOCKERSECRET', 'default', {
					secretsFileLowerCase: true,
				}),
			).to.be.eq('docker_value');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0])
				.to.be.a('string')
				.and.satisfy((msg: string) => msg.startsWith('variables: DOCKERSECRET from'));
			infoSpy.resetHistory();

			expect(await getConfigVariable('dockersecret', 'default', {showValue: true})).to.be.eq('docker_value');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0])
				.to.be.a('string')
				.and.satisfy((msg: string) => msg.startsWith('variables: dockersecret [docker_value] from'));
			infoSpy.resetHistory();
		});
	});
	describe('test logging', async () => {
		it('should return env value', async function () {
			expect(await getConfigVariable('ENV_VALUE', 'default')).to.be.eq('env_value');
		});
	});
	describe('test undefined throws', async () => {
		it('should throw error', async function () {
			await expect(getConfigVariable('NOT_FOUND', undefined, {undefinedThrows: true})).to.be.rejectedWith(Error, `variables: NOT_FOUND is undefined`);
		});
		it('should throw custom error via callback', async function () {
			await expect(getConfigVariable('NOT_FOUND', undefined, {undefinedThrows: () => new Error('custom error')})).to.be.rejectedWith(
				Error,
				`custom error`,
			);
		});
	});
});
