// simpleExpressServer.js
// A simple Express server for 15-237.

var fs = require("fs");
var path = require("path");
var express = require("express");
var flash = require("connect-flash");

var passport = require('passport');
var PassportLocalStrategy = require('passport-local').Strategy;

//======================================
//      init/main
//======================================

var app = express();

app.configure(function(){
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'change me!' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(app.router);
});

/**
function processJSONCMD(request, response){
    var cmd = request.params.cmd;
    var args = request.query;
    response.header("Cache-control", "no-cache");
    cmdHandler(cmd, request.user, args, response);
}

//all so post + get
app.all('/json/:cmd', processJSONCMD);

**/

function servePlayerFile(request, response) {
    //notify the user they're logged in. Necessary because
    //  we use the same html for logging in and when they're
    //  logged in
    if (request.user !== undefined){
        response.cookie("user", request.user.id);
    }
    else {
        response.cookie("user", "none");
    }
    console.log("user:", request.user);
    response.sendfile("www/player.html");
}

app.get('/player', servePlayerFile);

function serveBoardFile(request, response) {
  
    response.sendfile("www/index.html");
}

app.get('/board', serveBoardFile);



app.get('/:staticFileName', function serveStaticFile(request, response) {
    console.log(request.params.staticFileName);
    response.sendfile("www/"+request.params.staticFileName);
});
//app.get("/static/:staticFilename", serveStaticFile);

app.listen(8889);

//process.on("uncaughtException", onUncaughtException);

//======================================
//      passport
//======================================

app.post('/login',
  passport.authenticate('local', {successRedirect: '/player'}));

//registering new users would be done by adding to these data structures
var idToUser = [
    { id: 0, username: 'Paul', password: 'secret' },
    { id: 1, username: 'Jeff', password: 'cake'}
];
var usernameToId = { 
    'Paul': 0,
    'Jeff': 1
};

passport.use(new PassportLocalStrategy(
    function(username, password, done) {
        console.log('Log in attempt\n\tusername: ' + username + '\n\tpassword: '+password);
        var user = idToUser[usernameToId[username]];
        if (user === undefined) {
            return done(null, false, { message: 'Unknown user ' + username });
        }
        if (user.password !== password) {
            return done(null, false, { message: 'Invalid password' });
        }
        return done(null, user);
    }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null, idToUser[id]);
});

//======================================
//      general util
//======================================

function strEndsWith(str, end){
    return str.substr(-end.length) === end;
}

function sendObjectAsJSON(response, object){
    response.write(JSON.stringify(object));
    response.end();
}