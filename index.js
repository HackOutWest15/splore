var express = require('express');
var app = express();
var swig = require('swig');
var bodyParser = require('body-parser');
var path = require('path');
var sassMiddleware = require('node-sass-middleware');

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/splore');

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

app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req,res,next){
    req.db = db;
    req.users = db.get('users');

    next();
});

app.use('/', require('./routes.js'));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Splore is listening at http://%s:%s', host, port);
});
