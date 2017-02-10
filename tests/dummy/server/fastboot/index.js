
var express = require('express');

module.exports = function(app) {
  app.use('/middleware', function () {
    res.status(418).send("I'm a teapot");
  });
};
