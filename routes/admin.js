//////////////////////////////////////////////////
//
//  grouple - admin.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

exports.hero = require('./admin/hero');
exports.devil = require('./admin/devil');
exports.city = require('./admin/city');
exports.monster = require('./admin/monster');
exports.soldier = require('./admin/soldier');
exports.kingdom = require('./admin/kingdom');
exports.princess = require('./admin/princess');

exports.index = function (req, res) {
  res.render('admin.index.html');
  return;
};