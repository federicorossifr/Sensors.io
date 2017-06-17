var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var source_loader = require("./sensors_io/lib/source_loader.js");
var index = require('./routes/index');
var sensors = require('./routes/sensors');
var aggregate = require("./routes/aggregate");
var task_loader = require("./sensors_io/lib/task_loader.js");
var app = express();
var chalk = require("chalk");
var io = require('socket.io').listen(app.listen(8080,'0.0.0.0',function(){
	console.log(chalk.green.bold("[SERVER] IPV4 Server running at 8080"));
}));

var sources;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
io.clientCount = 0;

task_loader.load();
//First time sources loading.
source_loader.get(srcs => {sources = srcs});
//Watching file for real-time updating of sources
fs.watchFile("./sensors_io/conf/sources.json",(curr,prev) => {
	source_loader.get(srcs => {sources = srcs},1);
});

app.use(function(req,res,next) {
    //Expose data sources on every request
    req.sources = sources;
    //Expose socket.io object on every request
  	req.io = io;
  	next();
});

io.on("connection",function(socket) {
  	//console.log("[LOG] An user connected, now online: "+ (++io.clientCount));
  	socket.emit("hello");
  	socket.on("disconnect",function() {
  		//console.log("[LOG] An user disconnected, now online: "+ (--io.clientCount));
  	})
 });


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/',express.static(path.join(__dirname, 'public')));

//Bower's downloaded components
app.use('/bower_components',express.static(path.join(__dirname, '/bower_components')));

app.use('/',index);
app.use('/api/aggregate', aggregate);
app.use('/api/sensors',sensors);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
