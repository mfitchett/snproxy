(function(){
  "use strict";

  //--------------------------
  // NAMESPACE
  //--------------------------
  var sn = {};

  //--------------------------
  // INCLUDES
  //--------------------------
  var http = require('http'),
      httpProxy = require('http-proxy'),
      express = require('express');

  //--------------------------
  // VARS
  //--------------------------
  var app = express(),
      proxy = httpProxy.createProxyServer({
        changeOrigin:true
      });

  //--------------------------
  // METHODS
  //--------------------------
  sn.processReq = function (req){
    var processedReq = req;
    if (req){
      if (req.headers){
        //check for "auth" in header
        if (req.headers.auth){
          processedReq.headers.Authorization = req.headers.auth;
        }
      }
    }
    return processedReq;
  };

  //--------------------------
  // ROUTES
  //--------------------------
  app.all("/signnow/api/*", function(req, res){
    req.url = req.url.replace('/signnow/api/', '');
    req = sn.processReq(req);
    proxy.web(req, res, { target: 'https://api.signnow.com:443' });
  });

  app.all("/signnow/eval/*", function(req, res){
    req.url = req.url.replace('/signnow/eval/', '');
    req = sn.processReq(req);
    proxy.web(req, res, { target: 'https://capi-eval.signnow.com/api' });
  });

  //--------------------------
  // PROXY EVENTS
  //--------------------------
  proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.send(err);
  });

  proxy.on('proxyRes', function (proxyRes, req, res) {
    console.log('RAW Response HEADERS: ', JSON.stringify(proxyRes.headers, true, 2));
  });

  //--------------------------
  // SET PORT & START SERVER
  //--------------------------
  var port = process.env.PORT || 3000;
  app.listen(port);

  console.log("Listening on port " + port);
})();
