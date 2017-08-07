describe('connection', function () {
	const port = 10000;
	describe('sendFile', function () {
		it('sends the correct text when `sendFile` is used', function (done) {
			const server = new StirFry(port);

			expect(server.listening).to.equal(true);
			expect(server.host).to.equal('0.0.0.0');
			server.request('request', function (connection, async) {
				connection.sendFile('test/prefix.js');
				server.close();
			});
			server.on('listening', function () {
				request('http://0.0.0.0:' + port, function (err, body) {
					expect(body.body).to.equal(fs.readFileSync(path.resolve(process.mainModule['paths'][0].split('node_modules')[0].slice(0, -1), 'test/prefix.js')).toString());
					done();
				});
			});
		});
		it('sets the correct header when `sendFile` is used', function (done) {
			const server = new StirFry(port);
			expect(server.listening).to.equal(true);
			expect(server.host).to.equal('0.0.0.0');
			server.request('request', function (connection, async) {
				connection.sendFile('test/prefix.js');
				server.close();
			});
			server.on('listening', function () {
				request('http://0.0.0.0:' + port, function (err, body) {
					expect(body.headers['content-type']).to.equal('application/javascript');
					done();
				});
			});
		});
		it('sends a custom header when it is supplied', function (done) {
			const server = new StirFry(port);
			expect(server.listening).to.equal(true);
			expect(server.host).to.equal('0.0.0.0');
			server.request('request', function (connection, async) {
				connection.sendFile('test/prefix.js', 'cake is tasty');
				server.close();
			});
			server.on('listening', function () {
				request('http://0.0.0.0:' + port, function (err, body) {
					expect(body.headers['content-type']).to.equal('cake is tasty');
					done();
				});
			});
		});
		it('sets text/plain on unknown types', function (done) {
			const server = new StirFry(port);
			expect(server.listening).to.equal(true);
			expect(server.host).to.equal('0.0.0.0');
			server.request('request', function (connection, async) {
				connection.sendFile('test/resources/fileWithUnknownExtension.unkownextensionwithSomeRandomName437829572fjdskThatDefintelyWillNotBeInTypesjson');
				server.close();
			});
			server.on('listening', function () {
				request('http://0.0.0.0:' + port, function (err, body) {
					expect(body.headers['content-type']).to.equal('text/plain');
					done();
				});
			});
		});
	});
});