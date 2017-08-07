"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const types = JSON.parse(fs.readFileSync('types.json').toString());
/** @class */
class Connection {
    /**
     * Constructs a new request object from the given server request
     * @constructor
     * @param {http.IncomingMessage} request
     */
    constructor(request, response) {
        this.request = request;
        this.response = response;
        this.url = decodeURIComponent(this.request.url);
    }
    /**
     * Get the ip address of the client
     */
    get ip() {
        return this.request.connection.remoteAddress;
    }
    /**
     * Get the port that the client is running on
     */
    get port() {
        return this.request.connection.remotePort;
    }
    static serialize(data) {
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
    end(data) {
        if (data)
            this.response.end(Connection.serialize(data));
        else
            this.response.end();
    }
    /**
     * Write the request with the given data
     */
    send(data) {
        this.response.write(Connection.serialize(data));
    }
    /**
     * Pipe a file with the given name into the request. Unless the second argument is given it will automatically set the headers.
     */
    sendFile(filename, contentType) {
        const filePath = path.resolve(process.mainModule['paths'][0].split('node_modules')[0].slice(0, -1), filename);
        if (this.async) {
            this.async.begin();
            fs.stat(filePath, (err, stats) => {
                if (err)
                    throw err;
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
    setContentType(type) {
        this.response.setHeader('Content-Type', types[type]);
    }
}
exports.Connection = Connection;
