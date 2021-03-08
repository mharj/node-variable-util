process.env.NODE_ENV = 'test';
process.env.ENV_VALUE = 'env_value';
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
	describe('undefined value test', async () => {
		it('should return undefined value', async function () {
			expect(await getConfigVariable('test')).to.be.undefined;
		});
	});
	describe('settings file value test', async () => {
		it('should return settings value', async function () {
			expect(await getConfigVariable('SETTINGS_VARIABLE', 'default')).to.be.eq('settings_file');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq("variables: SETTINGS_VARIABLE from D:\\GitHub\\node-variable-util\\test\\testSettings.json");
			infoSpy.resetHistory();

			expect(await getConfigVariable('SETTINGS_VARIABLE', 'default', {showValue: true})).to.be.eq('settings_file');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq("variables: SETTINGS_VARIABLE [settings_file] from D:\\GitHub\\node-variable-util\\test\\testSettings.json");
			infoSpy.resetHistory();
		});
	});
	describe('env value test', async () => {
		it('should return env value', async function () {
			expect(await getConfigVariable('ENV_VALUE', 'default')).to.be.eq('env_value');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq("variables: ENV_VALUE from process.env.ENV_VALUE");
			infoSpy.resetHistory();

			expect(await getConfigVariable('ENV_VALUE', 'default',{showValue: true})).to.be.eq('env_value');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq("variables: ENV_VALUE [env_value] from process.env.ENV_VALUE");
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
			expect(infoSpy.getCall(0).args[0]).to.be.eq("variables: DOCKERSECRET from D:\\GitHub\\node-variable-util\\test\\dockersecret");
			infoSpy.resetHistory();

			expect(await getConfigVariable('dockersecret', 'default',{showValue: true})).to.be.eq('docker_value');
			expect(infoSpy.calledOnce).be.be.eq(true);
			expect(infoSpy.getCall(0).args[0]).to.be.eq("variables: dockersecret [docker_value] from D:\\GitHub\\node-variable-util\\test\\dockersecret");
			infoSpy.resetHistory();
		});
	});
	describe('test logging', async () => {
		it('should return env value', async function () {
			expect(await getConfigVariable('ENV_VALUE', 'default')).to.be.eq('env_value');
		});
	});
});
