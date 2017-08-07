describe('stirfry', function () {
	const port = 56789;

	describe('layers', function () {
		it('keeps information persistent between layers', function (done) {
			const server = new StirFry(port, '127.0.0.1');
			server.request('begin', function (connection) {
				connection.someVariable = true;
			});
			server.request('request', function (connection) {
				expect(connection.someVariable).to.equal(true);
				done();
			});
			request('http://127.0.0.1:' + port, function () {
				server.close();
			});
		});
		describe('creating layers', function () {
			const port = 9393;
			it('does not call layers that haven\'t been placed', function (done) {
				const server = new StirFry(port, '127.0.0.1');
				server.addLayer('randomLayer');
				let calls = 0;
				server.request('request', function () {
					calls++;
				});
				server.request('begin', function () {
					calls++;
				});
				server.request('randomLayer', function () {
					calls++;
				});
				request('http://127.0.0.1:' + port, function () {
					expect(calls).to.equal(2);
					server.close();
					done();
				});
			});
			it('calls layers that have been placed in correct order', function (done) {
				const server = new StirFry(port, '127.0.0.1');
				server.addLayer('randomLayer');
				server.placeLayer('randomLayer').after('begin');
				let order = [];
				server.request('begin', function () {
					order.push('begin');
				});
				server.request('request', function () {
					order.push('request');
				});
				server.request('randomLayer', function () {
					order.push('randomLayer');
				});
				request('http://127.0.0.1:' + port, function () {
					expect(order).to.deep.equal(['begin', 'randomLayer', 'request']);
					server.close();
					done();
				});
			});
			it('calls layers that have been placed in correct order for a large number of layers', function (done) {
				const server = new StirFry(port, '127.0.0.1');
				server.addLayer('1');
				server.addLayer('2');
				server.addLayer('3');
				server.addLayer('4');
				server.addLayer('5');
				server.addLayer('6');
				server.placeLayer('1').after('begin');
				server.placeLayer('6').before('request');
				server.placeLayer('5').before('6');
				server.placeLayer('4').before('5');
				server.placeLayer('3').before('4');
				server.placeLayer('2').after('1');
				let order = [];
				server.request('begin', function (connection) {
					order.push('begin');
					connection.send('begin');
				});
				server.request('request', function (connection) {
					order.push('request');
					connection.send('request');
				});
				server.request('1', function (connection) {
					order.push('1');
					connection.send('1');
				});
				server.request('2', function (connection) {
					order.push('2');
					connection.send('2');
				});
				server.request('3', function (connection) {
					order.push('3');
					connection.send('3');
				});
				server.request('4', function (connection) {
					order.push('4');
					connection.send('4');
				});
				server.request('5', function (connection) {
					order.push('5');
					connection.send('5');
				});
				server.request('6', function (connection) {
					order.push('6');
					connection.send('6');
				});
				request('http://127.0.0.1:' + port, function (err, body) {
					expect(order).to.deep.equal(['begin', '1', '2', '3', '4', '5', '6', 'request']);
					expect(body.body).to.equal('begin123456request');
					server.close();
					done();
				});
			});
		});
		describe('moving layers', function () {
			const port = 18986;
			it('moves already placed layers with before', function () {
				const server = new StirFry(port);
				server.addLayer('layer');
				server.placeLayer('layer').after('request');
				server.placeLayer('layer').before('request');
				const order = [];
				server.request('begin', () => order.push('begin'));
				server.request('request', () => order.push('request'));
				server.request('layer', () => order.push('layer'));
				request('http://0.0.0.0:' + port, function (err, body) {
					expect(order).to.deep.equal(['begin', 'layer', 'request']);
					server.close();
					done();
				});
			});
			it('moves already placed layers with after', function () {
				const server = new StirFry(port);
				server.addLayer('layer');
				server.placeLayer('layer').before('request');
				server.placeLayer('layer').after('request');
				const order = [];
				server.request('begin', () => order.push('begin'));
				server.request('request', () => order.push('request'));
				server.request('layer', () => order.push('layer'));
				request('http://0.0.0.0:' + port, function (err, body) {
					expect(order).to.deep.equal(['begin', 'request', 'layer']);
					server.close();
					done();
				});
			});
		})
	});
});