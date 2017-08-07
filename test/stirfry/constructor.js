describe('stirfry', function () {
	const port = 5849;

	describe('constructor', function () {
		it('works with a port and an ip address', function (done) {
			const server = new StirFry(port, '127.0.0.1');
			expect(server.port).to.equal(port);
			expect(server.host).to.equal('127.0.0.1');
			expect(server.listening).to.equal(true);
			server.listening = false;
			expect(server.server.listening).to.equal(false);
			done();
		});
		it("has a default host of '0.0.0.0'", function (done) {
			const server = new StirFry(port);
			expect(server.port).to.equal(port);
			expect(server.host).to.equal('0.0.0.0');
			expect(server.listening).to.equal(true);
			server.listening = false;
			expect(server.server.listening).to.equal(false);
			done();
		})
		it('when called without a port will not listen', function (done) {
			const server = new StirFry();
			expect(server.listening).to.equal(false);
			expect(server.server.listening).to.equal(false);
			expect(server.port).to.equal(undefined);
			expect(server.host).to.equal(undefined);
			done();
		});
	});
});