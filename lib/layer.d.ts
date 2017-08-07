import { Connection as Connection } from './connection';
/**
 * @class
 */
export declare class Listener {
    /**
     * An object to hold the parameters from the request
     */
    parameters: object;
    private urlMatch;
    private parameterNames;
    callback: (connection: Connection, async: Async) => void;
    /**
     * Construct a new listener that can be placed on any layer. It is given a connection object that allows it to give information to the user.
     * @param callback - The function to call when there is a request
     * @param url - The async object. It has methods like begin and complete.
     */
    constructor(callback: (connection: Connection, async: Async) => void, url?: string | RegExp);
    /**
     * Apply the url match to the given url. If the url applies the callback is called.
     */
    apply(connection: Connection, async: Async): void;
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
export declare class Layer {
    /**
     * An array that holds all of the listeners in this layer
     */
    listeners: Listener[];
    /**
     * A function to run this layer and call the next one when finished
     */
    call(connection: Connection, callback: Function): void;
}
export declare class LayerPlacer {
    /**
     * The order of the layers as an array of their names
     */
    layerOrder: [string];
    /**
     * The layer that this is placing
     */
    layer: string;
    constructor(layerOrder: any, layer: any);
    before(layer: string): void;
    /**
     * Place the given layer after another layer
     * @param layer - The layer to place it after
     */
    after(layer: string): void;
}
