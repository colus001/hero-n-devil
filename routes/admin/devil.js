//////////////////////////////////////////////////
//
//  grouple - admin.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

// Module dependencies
var async = require('async');

// Model
var Devil = require('../../lib/model').Devil;

exports.index = function (req, res) {
  Devil.findOne({}, function (err, devil) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'devil': devil
    };

    res.render('admin.devil.html', result);
    return;
  });
};

exports.create = function (req, res) {
  req.body.name = 'Devil';

  async.waterfall([
    function (callback) {
      Devil.findOne({}, function (err, devil) {
        if (err) throw err;

        callback(null, devil);
        return;
      });
    },

    function (devil, callback) {
      if ( devil ) {
        Devil.findByIdAndUpdate(devil._id, { $set: req.body }, function (err, devil) {
          if (err) throw err;

          var result = {
            'result': 'success',
            'devil': devil
          };

          console.log('result:', result);
          callback(null);
          return;
        });
      } else {
        Devil(req.body).save(function (err, devil) {
          if (err) throw err;

          var result = {
            'result': 'success',
            'devil': devil
          };

          console.log('result:', result);
          callback(null);
          return;
        });
      }
    }
  ], function (err, result) {
    res.redirect('/admin/devil');
    return;
  });
};