"use strict";
const http = require("http");
const connection_1 = require("./connection");
const layer_1 = require("./layer");
class StirFry {
    /**
     * The constructor for the StirFry server
     * @param port - The port to run the server on. If not given the server will not listen
     * @param host - The host to run the server on. If not given it will run on "0.0.0.0"
     */
    constructor(port, host) {
        this.server = http.createServer((req, res) => {
            this.handleRequest(new connection_1.Connection(req, res));
        });
        this._listening = false;
        this.listeners = {};
        /**
         * A list of all the layers by name
         */
        this.layers = {
            'begin': new layer_1.Layer()
        };
        /**
         * The order of the layers as an array of their names
         */
        this.layerOrder = ['begin', 'request'];
        if (host == null) {
            host = '0.0.0.0';
        }
        if (port != null) {
            this.listen(port, host);
        }
        this.addLayer('request');
        this.placeLayer('begin').before('request');
    }
    /**
     * Return whether or not the server is listening
     */
    get listening() {
        return this._listening;
    }
    /**
     * Set whether or not the server is listening
     * @param value - Whether or not the server is listening
     */
    set listening(value) {
        if (!value && this._listening) {
            this.close();
        }
        else if (value && !this._listening) {
            this.listen(this.port, this.host);
        }
        this._listening = value;
    }
    /**
     * This starts the stirfry server listening
     * @param port - The port to listen on
     * @param host - The host to listen on
     */
    listen(port, host) {
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
    close(callback) {
        return new Promise((resolve, reject) => {
            this.server.close(() => {
                if (callback)
                    callback();
                if (this.listeners['close'])
                    this.listeners['close']();
                resolve();
            });
            this._listening = false;
        });
    }
    /**
     * Handle an http request.
     * @param connection - The connection object
     */
    handleRequest(connection) {
        let index = 0;
        const callNextLayer = () => {
            index++;
            if (index >= this.layerOrder.length)
                connection.end();
            else {
                this.layers[this.layerOrder[index]].call(connection, callNextLayer);
            }
        };
        this.layers[this.layerOrder[0]].call(connection, callNextLayer);
    }
    /**
     * Add a layer with the given name. It must be placed afterwards
     * @param name - The name of the layer to create
     */
    addLayer(name) {
        this.layers[name] = new layer_1.Layer();
    }
    /**
     * Place a layer
     * @param layer - The layer to be placed
     */
    placeLayer(layer) {
        return new layer_1.LayerPlacer(this.layerOrder, layer);
    }
    /**
     * Removes a layer from the listeners
     * @param layer - The layer to remove
     */
    removeLayer(layer) {
        if (this.layerOrder.indexOf(layer) > -1)
            this.layerOrder.splice(this.layerOrder.indexOf(layer), 1);
        delete this.layers[layer];
    }
    /**
     * Create a listener on a target layer
     */
    request(layer, url, fn) {
        if (fn && (typeof url == 'string' || url instanceof RegExp)) {
            const listener = new layer_1.Listener(fn, url);
            this.layers[layer].listeners.push(listener);
        }
        else if (url instanceof layer_1.Listener) {
            this.layers[layer].listeners.push(url);
        }
        else if (url instanceof Function) {
            const listener = new layer_1.Listener((connection, async) => {
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
    on(event, callback) {
        if (callback)
            this.listeners[event] = callback;
        else
            return new Promise((resolve, reject) => {
                this.listeners[event] = resolve;
            });
    }
    unref() {
        this.server.unref();
    }
}
StirFry.Connection = connection_1.Connection;
module.exports = StirFry;
