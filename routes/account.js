//////////////////////////////////////////////////
//
//  grouple - account.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

// Module dependencies
var async = require('async');

// Model
var Account = require('../lib/model').Account;

// Library
var encrypt = require('../lib/util').encrypt;
var decrypt = require('../lib/util').decrypt;
var errorHandler = require('../lib/errorHandler');

exports.index = function (req, res) {
  res.render('login.html');
  return;
};

exports.signup = function (req, res) {
  res.render('signup.html');
  return;
};

exports.create = function (req, res) {
  var account = req.body;
  account.password = encrypt(req.body.password);

  Account(req.body).save(function (err, account) {
    if (err) throw err;

    res.redirect('/');
    return;
  });
};

exports.login = function (req, res) {
  var query = {
    'email': req.body.email
  };

  Account.findOneAndUpdate(query, { 'updated_at': new Date() }, function (err, account) {
    if (err) throw err;

    if ( !account ) {
      errorHandler.sendErrorMessage('NO_ACCOUNT_FOUND', res);
      return;
    }

    if ( req.body.password !== decrypt(account.password) ) {
      errorHandler.sendErrorMessage('PASSWORD_NOT_MATCH', res);
      return;
    }

    req.session.account_id = account._id;

    var result = {
      'result': 'success',
      'account': account
    };

    res.redirect('/');
    return;
  });
};

exports.logout = function (req, res) {
  req.session.account_id = undefined;

  res.redirect('/login');
  return;
};