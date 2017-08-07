import { Connection as Connection } from './connection'
import * as pathToRegexp from 'path-to-regexp'
/**
 * @class
 */
export class Listener {
	/**
	 * An object to hold the parameters from the request
	 */
	parameters: object;
	private urlMatch: RegExp;
	private parameterNames: {
		name: string,
		prefix: string,
		delimiter: string,
		optional: boolean,
		repeat: boolean,
		partial: boolean,
		asterisk: boolean,
		pattern: RegExp
	}[] = [];

	callback: (connection: Connection, async: Async) => void;

	/**
	 * Construct a new listener that can be placed on any layer. It is given a connection object that allows it to give information to the user.
	 * @param callback - The function to call when there is a request
	 * @param url - The async object. It has methods like begin and complete.
	 */
	constructor(callback: (connection: Connection, async: Async) => void, url?: string | RegExp) {
		if (!url) {
			this.urlMatch = /^.*$/;
		}
		else if (url instanceof RegExp) {
			this.urlMatch = url;
		}
		else {
			this.urlMatch = pathToRegexp(url, this.parameterNames);
		}
		this.callback = callback;
	}
	/**
	 * Apply the url match to the given url. If the url applies the callback is called.
	 */
	apply(connection: Connection, async: Async) {
		const parameters = connection.url.match(this.urlMatch);

		if (parameters) {
			parameters.splice(0, 1);
			this.parameters = parameters;
			if (this.parameterNames)
				for (let i in this.parameters)
					if (this.parameterNames[i])
						this.parameters[this.parameterNames[i].name] = this.parameters[i];
			connection.async = async;
			this.callback.call(this, connection, async);
		}
	}
}

export interface Async {
	/**
	 * Begin an asynchronous process
	 */
	begin(): void;
	/**
	 * Finish an asynchronous process
	 */
	complete(): void;
	/**
	 * Check whether or not all of the asynchronous processes are finished
	 */
	finished: boolean;
	/**
	 * The number of remaining processes
	 */
	remaining: number;
}

/**
 * @class
 */
export class Layer {
	/**
	 * An array that holds all of the listeners in this layer
	 */
	listeners: Listener[] = [];
	/**
	 * A function to run this layer and call the next one when finished 
	 */
	call(connection: Connection, callback: Function) {
		const self = this;
		const async: Async = {
			remaining: 0,
			get finished(): boolean {
				return this.remaining <= 0
			},
			begin() {
				this.remaining++;
			},
			complete() {
				this.remaining--;
				if (this.finished) {
					callback();
				}
			}
		}
		async.begin();
		for (let i in this.listeners) {
			this.listeners[i].apply(connection, async);
		}
		async.complete();
	}
}

export class LayerPlacer {

	/**
	 * The order of the layers as an array of their names
	 */
	layerOrder: [string];

	/**
	 * The layer that this is placing
	 */
	layer: string

	constructor(layerOrder, layer) {
		this.layerOrder = layerOrder;
		this.layer = layer;
	}

	before(layer: string) {
		if (this.layerOrder.indexOf(this.layer) > -1) this.layerOrder.splice(this.layerOrder.indexOf(this.layer), 1);
		if (this.layerOrder.indexOf(layer) > -1) this.layerOrder.splice(this.layerOrder.indexOf(layer), 0, this.layer);
	}


	/**
	 * Place the given layer after another layer
	 * @param layer - The layer to place it after
	 */
	after(layer: string) {
		if (this.layerOrder.indexOf(this.layer) > -1) this.layerOrder.splice(this.layerOrder.indexOf(this.layer), 1);
		if (this.layerOrder.indexOf(layer) > -1) this.layerOrder.splice(this.layerOrder.indexOf(layer) + 1, 0, this.layer);
	}
}