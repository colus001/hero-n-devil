//////////////////////////////////////////////////
//
//  grouple - util.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

var test = require('../lib/test.js');

exports.index = function (req, res) {

  var result = {
    'cities': test.cities,
    'monsters': test.monsters
  };

  res.render('devil.index.html', result);
  return;
};