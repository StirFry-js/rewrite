/// <reference types="node" />
import * as http from 'http';
import { Async as Async } from './layer';
/** @class */
export declare class Connection {
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
    constructor(request: http.IncomingMessage, response: http.ServerResponse);
    /**
     * Get the ip address of the client
     */
    readonly ip: string;
    /**
     * Get the port that the client is running on
     */
    readonly port: number;
    private static serialize(data?);
    /**
     * End the request with the given data
     */
    end(data?: any): void;
    /**
     * Write the request with the given data
     */
    send(data: any): void;
    /**
     * Pipe a file with the given name into the request. Unless the second argument is given it will automatically set the headers.
     */
    sendFile(filename: string, contentType?: string): void;
    /**
     * Set the content type to be the type used by the given file extension
     */
    setContentType(type: string): void;
}
