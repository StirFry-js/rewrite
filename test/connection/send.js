describe('connection', function () {
	const port = 10001;
	describe('send', function () {
		it('sends the correct text when `send` is used', function (done) {
			const server = new StirFry(port);

			server.request('request', function (connection, async) {
				connection.send('hi there');
				server.close();
			});
			server.on('listening', function () {
				request('http://0.0.0.0:' + port, function (err, body) {
					expect(body.body).to.equal('hi there');
					done();
				});
			});
		});
		it('sends the numbers that have been turned into strings when `send` is used', function (done) {
			const server = new StirFry(port);

			server.request('request', function (connection, async) {
				connection.send(420);
				server.close();
			});
			server.on('listening', function () {
				request('http://0.0.0.0:' + port, function (err, body) {
					expect(body.body).to.equal('420');
					done();
				});
			});
		});
	});
});