//////////////////////////////////////////////////
//
//  grouple - admin.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

exports.hero = require('./admin/hero');

exports.index = function (req, res) {
  res.render('admin.index.html');
  return;
};