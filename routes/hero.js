//////////////////////////////////////////////////
//
//  grouple - util.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

exports.index = function (req, res) {
  res.render('hero.index.html', { title: 'Express' });
  return;
};