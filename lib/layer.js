"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pathToRegexp = require("path-to-regexp");
/**
 * @class
 */
class Listener {
    /**
     * Construct a new listener that can be placed on any layer. It is given a connection object that allows it to give information to the user.
     * @param callback - The function to call when there is a request
     * @param url - The async object. It has methods like begin and complete.
     */
    constructor(callback, url) {
        this.parameterNames = [];
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
    apply(connection, async) {
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
exports.Listener = Listener;
/**
 * @class
 */
class Layer {
    constructor() {
        /**
         * An array that holds all of the listeners in this layer
         */
        this.listeners = [];
    }
    /**
     * A function to run this layer and call the next one when finished
     */
    call(connection, callback) {
        const self = this;
        const async = {
            remaining: 0,
            get finished() {
                return this.remaining <= 0;
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
        };
        async.begin();
        for (let i in this.listeners) {
            this.listeners[i].apply(connection, async);
        }
        async.complete();
    }
}
exports.Layer = Layer;
class LayerPlacer {
    constructor(layerOrder, layer) {
        this.layerOrder = layerOrder;
        this.layer = layer;
    }
    before(layer) {
        if (this.layerOrder.indexOf(this.layer) > -1)
            this.layerOrder.splice(this.layerOrder.indexOf(this.layer), 1);
        if (this.layerOrder.indexOf(layer) > -1)
            this.layerOrder.splice(this.layerOrder.indexOf(layer), 0, this.layer);
    }
    /**
     * Place the given layer after another layer
     * @param layer - The layer to place it after
     */
    after(layer) {
        if (this.layerOrder.indexOf(this.layer) > -1)
            this.layerOrder.splice(this.layerOrder.indexOf(this.layer), 1);
        if (this.layerOrder.indexOf(layer) > -1)
            this.layerOrder.splice(this.layerOrder.indexOf(layer) + 1, 0, this.layer);
    }
}
exports.LayerPlacer = LayerPlacer;
