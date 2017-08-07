describe('connection', function () {
	const port = 5850;
	it('has an ip address of 127.0.0.1', function (done) {
		const server = new StirFry(port);
		expect(server.listening).to.equal(true);
		expect(server.host).to.equal('0.0.0.0');
		server.request('request', function (connection, async) {
			expect(connection.ip).to.equal('127.0.0.1');
			connection.send('hello world');
			server.close();
			done();
		});
		server.on('listening', function () {
			request('http://0.0.0.0:' + port);
		});
	});

});