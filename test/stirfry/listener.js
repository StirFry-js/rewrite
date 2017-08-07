describe('stirfry', function () {
	describe('listeners', function () {
		const port = 65511;
		it('only runs on the given path', function (done) {
			const server = new StirFry(port);

			server.request('request', '/', function (connection) {
				connection.send('If this was sent, something is wrong');
			});

			server.request('request', '/test', function (connection) {
				connection.send('only this should send');
			});

			request(`http://0.0.0.0:${port}/test`, function (err, body) {
				expect(body.body).to.equal('only this should send');
				server.close();
				done();
			});
		});
		it('handles regular expressions correctly', function (done) {
			const server = new StirFry(port);

			server.request('request', /\/.*hello[ _]world$/, function (connection) {
				connection.send('good');
			});

			server.request('request', '/', function (connection) {
				connection.send('This should not be sent')
			});

			request(`http://0.0.0.0:${port}/hello%20world`, function (err, body) {
				expect(body.body).to.equal('good');

				request(`http://0.0.0.0:${port}/hello_world`, function (err, body) {
					expect(body.body).to.equal('good');

					request(`http://0.0.0.0:${port}/testhello_world`, function (err, body) {
						expect(body.body).to.equal('good');

						request(`http://0.0.0.0:${port}/testhello_worl`, function (err, body) {
							expect(body.body).to.equal('');
							server.close();
							done();
						});
					});
				});
			});
		});
		it('handles named properties in a json object', function (done) {
			const server = new StirFry(port);

			server.request('request', '/:folder/:file', function (connection) {
				connection.send(`folder: ${this.parameters.folder}, file: ${this.parameters.file}`);
			});
			request(`http://0.0.0.0:${port}/test/anotherTest`, function (err, body) {
				expect(body.body).to.equal('folder: test, file: anotherTest');
				server.close();
				done();
			});
		});
	});
});