var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');

var Koa = require('koa');
var app = new Koa();
var koaBody = require('koa-body');

app.use(koaBody({multipart:true}));

app.use(async ctx=>{
    ctx.body = {
        ip: ctx.ip,
        protocol: ctx.protocol,
        host: ctx.host,
        url: ctx.url,
        method: ctx.method,
        header: ctx.header,
        type: ctx.type,
        body: ctx.request.body
    };
    console.log(JSON.stringify(ctx.body));
})

var config = {
  domain: 'localhost',
  http: {
    port: 8000,
  },
  https: {
    port: 8443,
    options: {
      key: fs.readFileSync(path.resolve(process.cwd(), 'certs/key.pem'), 'utf8'),
      cert: fs.readFileSync(path.resolve(process.cwd(), 'certs/cert.pem'), 'utf8')
    },
  },
};

let serverCallback = app.callback();
try {
  var httpServer = http.createServer(serverCallback);
  httpServer
    .listen(config.http.port, function(err) {
      if (!!err) {
        console.error('HTTP server FAIL: ', err, (err && err.stack));
      }
      else {
        console.log(`HTTP  server OK: http://${config.domain}:${config.http.port}`);
      }
    });
}
catch (ex) {
  console.error('Failed to start HTTP server\n', ex, (ex && ex.stack));
}
try {
  var httpsServer = https.createServer(config.https.options, serverCallback);
  httpsServer
    .listen(config.https.port, function(err) {
      if (!!err) {
        console.error('HTTPS server FAIL: ', err, (err && err.stack));
      }
      else {
        console.log(`HTTPS server OK: https://${config.domain}:${config.https.port}`);
      }
    });
}
catch (ex) {
  console.error('Failed to start HTTPS server\n', ex, (ex && ex.stack));
}

module.exports = app;