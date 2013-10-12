var http = require('http'),
	express = require('express'),
	expressValidator = require('express-validator'),
	url_parser = require('url'),
	hyperdirect = require('hyperdirect'),
	spawn = require('child_process').spawn,
	_ = require('lodash');

var app = express();

app.use(express.bodyParser());
app.use(expressValidator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.')
			, root    = namespace.shift()
			, formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg   : msg,
			value : value
		};
	}
}));
app.use(express.static(__dirname + '/public'))

app.use(function(req, res) {
	console.log('%s %s', req.method, req.url);
	
	req.assert('u', 'Must supply a valid url').isUrl();
	
	var availableFilters = [ 
		'austro',
		'b1ff',
		'brooklyn',
		'chef',
		'cockney',
		'drawl',
		'dubya',
		'fudd',
		'funetak',
		'jethro',
		'jive',
		'kraut',
		'pansy',
		'pirate',
		'postmodern',
		'redneck',
		'valspeak',
		'warez'
	];
	
	req.assert( 'f', 'Filter can only be ' + availableFilters.join(', ') ).isIn(availableFilters);
	
	var errors = req.validationErrors();
	if (errors) {
		res.end( JSON.stringify( _.map(errors, 'msg')) );
	} else {

		res.writeHead(200, {'Content-Type': 'text/html'});

		var url_con = url_parser.parse(req.url, true);
		//console.log(url_con);

		var url = url_con.query.u;
		var filter = url_con.query.f;
		console.log(url)
		if ( url.slice(0,7) != 'http://' && url.slice(0,8) != 'https://' ) {
			url = 'http://' + url;
		}
		console.log('%s %s\n', filter, url);

		var url_tar = url_parser.parse(url, true);

		res.write('<head><base href="' + url_tar.protocol + '//' + url_tar.host +'/" target="_blank"></head>');

		var translator = spawn(filter);
		function streamURI(uri, options, next){
		}
		hyperdirect(100)(url)
		.pipe(translator.stdin)
		translator.stdout.pipe(res);
	}
});

app.listen(3000);
