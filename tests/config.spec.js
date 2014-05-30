describe("Configuration setup", function() {
	it("should load development configurations", function(next) {
		var config = require('../config/config')['development'];
		expect(config.mode).toBe('development');
		next();
	});
	it("should load production configurations", function(next) {
		var config = require('../config/config')['production'];
		expect(config.mode).toBe('production');
		next();
	});
});