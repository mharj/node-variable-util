export interface LoggerLike {
	trace?(message: any, ...args: any[]): void;

	debug(message: any, ...args: any[]): void;

	info(message: any, ...args: any[]): void;

	warn(message: any, ...args: any[]): void;

	error(message: any, ...args: any[]): void;
}
