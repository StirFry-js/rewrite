describe('connection', function () {
	describe('contentType', function () {
		const port = 5991;
		it('sets the correct type', function (done) {
			const server = new StirFry(port);
			expect(server.listening).to.equal(true);
			expect(server.host).to.equal('0.0.0.0');
			server.request('request', function (connection, async) {
				expect(connection.ip).to.equal('127.0.0.1');
				connection.setContentType('js');
				connection.send('hello world');
				server.close();
				done();
			});
			server.on('listening', function () {
				request('http://0.0.0.0:' + port, function (err, body) {
					expect(body.headers['content-type']).to.equal('application/javascript');
				});
			});
		});
	});
});