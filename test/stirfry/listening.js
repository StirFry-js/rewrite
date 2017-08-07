describe('stirfry', function () {
	const port = 56784;

	describe('listening', function () {
		it('will close when listening is set to false', function (done) {
			const server = new StirFry(port, '127.0.0.1');
			server.request('request', function (connection) {
				connection.end('hello world!');
			});
			server.on('listening', function () {
				expect(server.listening).to.equal(true);
				expect(server.server.listening).to.equal(true);
				request('http://127.0.0.1:' + port, function (err, body) {
					if (err) throw err;
					expect(body.body).to.equal('hello world!');
					server.listening = false;
					server.on('close', function () {
						expect(server.listening).to.equal(false);
						expect(server.server.listening).to.equal(false);
						request('http://127.0.0.1:' + port, function (err, body) {
							expect(err.code).to.equal('ECONNREFUSED');
							done();
						});
					});
				});
			});


		});
		it('will start when listening is set to true', function (done) {
			const server = new StirFry();
			server.request('request', function (connection) {
				connection.send('hello world!');
			});
			expect(server.listening).to.equal(false);
			expect(server.server.listening).to.equal(false);
			server.port = port;
			server.host = '127.0.0.1';
			server.listening = true;
			server.on('listening', function () {
				expect(server.listening).to.equal(true);
				expect(server.server.listening).to.equal(true);
				request('http://127.0.0.1:' + port, function (err, body) {
					expect(body.body).to.equal('hello world!');
					server.listening = false;
					server.on('close', function () {
						done();
					});
				});

			});
		});
	});
	describe('close', function () {
		it('will work with a callback', function (done) {
			const server = new StirFry(port, '127.0.0.1');
			server.on('listening').then(() => {
				server.close(function () {
					expect(server.server.listening).to.equal(false);
					expect(server.listening).to.equal(false);
					done();
				});
			}).catch(done);
		});
		it('will work as a promise', function (done) {
			const server = new StirFry(port, '127.0.0.1');
			server.on('listening').then(function () {
				server.close().then(function () {
					expect(server.server.listening).to.equal(false);
					expect(server.listening).to.equal(false);
					done();
				}).catch(done);
			}).catch(done);
		});
	});
});