
var path = require('path'),
	rootPath = path.normalize(__dirname + '/..'),
	config,
	sharedConfig;

var sharedConfig = {
	root: rootPath,
	db : {
		path: 'mongodb://localhost/node-twitter-voter'
	}
};

module.exports = {
	local: {
		mode: 'local',
		port: 3002,
		app: {
			name: 'Twitter vote counter - local'
		},
		twitter: {
			consumer_key: 'aFAe6IA7vIAbt8BVo8CQ',
			consumer_secret: 'lwQw74B6luoLabYoDudX4M97H57LiAQCYnSzHOWdI1g',
			access_token_key: '72845380-oKSjRnmd1J9DrYFOLLDUbbaxqtm6KvFfhGCPni2Uo',
			access_token_secret: 'dLmIIjVXvwMcyu5H2dVKq7xkvgzvJ08GHh8as4bK08'
		},
		global: sharedConfig
	},

	development: {
		mode: 'development',
		port: 3002,
		app: {
			name: 'Twitter vote counter - Dev'
		},
		twitter: {
			consumer_key: '',
			consumer_secret: '',
			access_token_key: '',
			access_token_secret: ''
		},
		global: sharedConfig
	},

	production: {
		mode: 'production',
		port: 3002,
		app: {
			name: 'Twitter vote counter - Prod'
		},
		twitter: {
			consumer_key: '',
			consumer_secret: '',
			access_token_key: '',
			access_token_secret: ''
		},
		global: sharedConfig

	},

	hosts: [
		{
			domain: 'twitterpoll.local',
			target: ['localhost:3001']
		}
	]
};
