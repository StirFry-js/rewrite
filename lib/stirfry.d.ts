/// <reference types="node" />
import * as http from 'http';
import { Connection as Connection } from './connection';
import { Layer, Listener, Async, LayerPlacer } from './layer';
declare class StirFry {
    static Connection: typeof Connection;
    server: http.Server;
    private _listening;
    /**
     * Return whether or not the server is listening
     */
    /**
     * Set whether or not the server is listening
     * @param value - Whether or not the server is listening
     */
    listening: boolean;
    port: number;
    host: string;
    /**
     * The constructor for the StirFry server
     * @param port - The port to run the server on. If not given the server will not listen
     * @param host - The host to run the server on. If not given it will run on "0.0.0.0"
     */
    constructor(port?: number, host?: string);
    listeners: {
        [Identifier: string]: Function;
    };
    /**
     * This starts the stirfry server listening
     * @param port - The port to listen on
     * @param host - The host to listen on
     */
    listen(port: number, host: string): void;
    /**
     * Stop the server from listening
     */
    close(callback?: Function): Promise<{}>;
    /**
     * A list of all the layers by name
     */
    layers: {
        [Identifier: string]: Layer;
    };
    /**
     * The order of the layers as an array of their names
     */
    layerOrder: [string];
    /**
     * Handle an http request.
     * @param connection - The connection object
     */
    handleRequest(connection: Connection): void;
    /**
     * Add a layer with the given name. It must be placed afterwards
     * @param name - The name of the layer to create
     */
    addLayer(name: string): void;
    /**
     * Place a layer
     * @param layer - The layer to be placed
     */
    placeLayer(layer: string): LayerPlacer;
    /**
     * Removes a layer from the listeners
     * @param layer - The layer to remove
     */
    removeLayer(layer: string): void;
    /**
     * Create a listener on a target layer
     */
    request(layer: string, url: Listener | string | RegExp | ((connection: Connection, async: Async) => void), fn?: (Connection, Async) => void): void;
    /**
     * Wait for the target event and call it
     * @param event - The event to listen for
     * @param callback - The function to call when the event happens
     */
    on(event: string, callback?: Function): Promise<{}>;
    unref(): void;
}
export = StirFry;
