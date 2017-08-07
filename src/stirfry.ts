import * as http from 'http'

import { Connection as Connection } from './connection'
import { Layer, Listener, Async, LayerPlacer } from './layer'

class StirFry {
	static Connection = Connection;

	server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
		this.handleRequest(new Connection(req, res));
	});
	private _listening: boolean = false;
	/**
	 * Return whether or not the server is listening
	 */
	get listening(): boolean {
		return this._listening;
	}
	/**
	 * Set whether or not the server is listening
	 * @param value - Whether or not the server is listening
	 */
	set listening(value: boolean) {
		if (!value && this._listening) {
			this.close();
		}
		else if (value && !this._listening) {
			this.listen(this.port, this.host);
		}
		this._listening = value;
	}
	port: number;
	public host: string;



	/**
	 * The constructor for the StirFry server
	 * @param port - The port to run the server on. If not given the server will not listen
	 * @param host - The host to run the server on. If not given it will run on "0.0.0.0"
	 */
	constructor(port?: number, host?: string) {
		if (host == null) {
			host = '0.0.0.0';
		}
		if (port != null) {
			this.listen(port, host);
		}
		this.addLayer('request');
		this.placeLayer('begin').before('request');
	}

	listeners: { [Identifier: string]: Function } = {};

	/**
	 * This starts the stirfry server listening
	 * @param port - The port to listen on
	 * @param host - The host to listen on
	 */
	listen(port: number, host: string) {
		this.port = port;
		this.host = host;
		this.server.listen(port, host, () => {
			if (this.listeners['listening'] != undefined) {
				this.listeners['listening']();
			}
		});
		this._listening = true;
	}
	/**
	 * Stop the server from listening
	 */
	close(callback?: Function) {
		return new Promise((resolve, reject) => {
			this.server.close(() => {
				if (callback) callback();
				if (this.listeners['close']) this.listeners['close']();
				resolve();
			});
			this._listening = false;
		});

	}

	/**
	 * A list of all the layers by name
	 */
	layers: { [Identifier: string]: Layer } = {
		'begin': new Layer()
	};

	/**
	 * The order of the layers as an array of their names
	 */
	layerOrder: [string] = ['begin', 'request'];

	/**
	 * Handle an http request.
	 * @param connection - The connection object
	 */
	handleRequest(connection: Connection) {
		let index = 0;
		const callNextLayer = () => {
			index++;
			if (index >= this.layerOrder.length) connection.end();
			else {
				this.layers[this.layerOrder[index]].call(connection, callNextLayer);
			}
		}
		this.layers[this.layerOrder[0]].call(connection, callNextLayer);
	}

	/**
	 * Add a layer with the given name. It must be placed afterwards
	 * @param name - The name of the layer to create
	 */
	addLayer(name: string) {
		this.layers[name] = new Layer();
	}

	/**
	 * Place a layer
	 * @param layer - The layer to be placed
	 */
	placeLayer(layer: string): LayerPlacer {
		return new LayerPlacer(this.layerOrder, layer);
	}

	/**
	 * Removes a layer from the listeners
	 * @param layer - The layer to remove
	 */
	removeLayer(layer: string) {
		if (this.layerOrder.indexOf(layer) > -1) this.layerOrder.splice(this.layerOrder.indexOf(layer), 1);
		delete this.layers[layer];
	}

	/**
	 * Create a listener on a target layer
	 */
	request(layer: string, url: Listener | string | RegExp | ((connection: Connection, async: Async) => void), fn?: (Connection, Async) => void): void {
		if (fn && (typeof url == 'string' || url instanceof RegExp)) {
			const listener = new Listener(fn, url);
			this.layers[layer].listeners.push(listener);
		}
		else if (url instanceof Listener) {
			this.layers[layer].listeners.push(url);
		}
		else if (url instanceof Function) {
			const listener = new Listener((connection: Connection, async: Async) => {
				url(connection, async);
			});
			this.layers[layer].listeners.push(listener);
		}
	}

	/**
	 * Wait for the target event and call it
	 * @param event - The event to listen for
	 * @param callback - The function to call when the event happens
	 */
	on(event: string, callback?: Function) {
		if (callback) this.listeners[event] = callback;
		else return new Promise((resolve, reject) => {
			this.listeners[event] = resolve;
		});
	}

	unref() {
		this.server.unref();
	}
}
export = StirFry;
