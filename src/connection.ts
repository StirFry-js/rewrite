import * as http from 'http'
import * as fs from 'fs'
import * as path from 'path'

import { Async as Async } from './layer'

const types: { [Identifier: string]: string } = JSON.parse(fs.readFileSync('types.json').toString());
/** @class */
export class Connection {
	async: Async;
	/**
	 * The full request from the http server.
	 */
	request: http.IncomingMessage;
	/**
	 * The full response from the http server
	 */
	response: http.ServerResponse;
	/**
	 * The url requested by the client
	 */
	url: string;
	/**
	 * Constructs a new request object from the given server request
	 * @constructor
	 * @param {http.IncomingMessage} request
	 */
	constructor(request: http.IncomingMessage, response: http.ServerResponse) {
		this.request = request;
		this.response = response;
		this.url = decodeURIComponent(this.request.url);
	}
	/**
	 * Get the ip address of the client
	 */
	get ip(): string {
		return this.request.connection.remoteAddress;
	}
	/**
	 * Get the port that the client is running on
	 */
	get port(): number {
		return this.request.connection.remotePort;
	}

	private static serialize(data?: any) {
		if (typeof data == "undefined" || typeof data == "object" || typeof data == "number" || typeof data == "boolean" || typeof data == "symbol") {
			return Buffer.from(data.toString());
		}
		else if (typeof data == "string") {
			return Buffer.from(data);
		}
	}

	/**
	 * End the request with the given data
	 */
	end(data?: any) {
		if (data) this.response.end(Connection.serialize(data));
		else this.response.end();
	}

	/**
	 * Write the request with the given data
	 */
	send(data: any) {
		this.response.write(Connection.serialize(data));
	}

	/**
	 * Pipe a file with the given name into the request. Unless the second argument is given it will automatically set the headers.
	 */
	sendFile(filename: string, contentType?: string) {
		const filePath = path.resolve(process.mainModule['paths'][0].split('node_modules')[0].slice(0, -1), filename);
		if (this.async) {
			this.async.begin();
			fs.stat(filePath, (err, stats) => {
				if (err) throw err;
				const file = fs.createReadStream(filePath);
				this.response.writeHead(200, {
					'Content-Type': contentType || types[path.extname(filename).slice(1)] || 'text/plain',
					'Content-Size': stats.size
				});
				file.pipe(this.response);
				file.on('finish', () => {
					this.async.complete();
				});
			});

		}
	}

	/**
	 * Set the content type to be the type used by the given file extension
	 */
	setContentType(type: string) {
		this.response.setHeader('Content-Type', types[type]);
	}
}
