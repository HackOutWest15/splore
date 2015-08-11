var express = require('express');
var app = express();
var swig = require('swig');
var bodyParser = require('body-parser');
var path = require('path');
var sassMiddleware = require('node-sass-middleware');
var autoprefixer = require('express-autoprefixer');

require('dotenv').load();

app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.set('view cache', false);
swig.setDefaults({ cache: false });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(sassMiddleware({
    src: path.join(__dirname, 'stylesheets'),
    dest: path.join(__dirname, 'public', 'css'),
    debug: true,
    prefix: '/css',
    outputStyle: 'compressed'
}));

app.use(autoprefixer({ browsers: 'last 2 versions', cascade: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes'));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Splore is listening at http://%s:%s', host, port);
});
