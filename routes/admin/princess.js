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
var ProtoPrincess = require('../../lib/model').ProtoPrincess;

exports.index = function (req, res) {
  ProtoPrincess.find({}, function (err, princesses) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'princesses': princesses
    };

    res.render('admin.princess.html', result);
    return;
  });
};

exports.create = function (req, res) {
  if ( req.params.id ) {
    // EDIT
    ProtoPrincess.findByIdAndUpdate(req.params.id, { $set: req.body }, function (err, princess) {
      if (err) throw err;

      var result = {
        'result': 'success',
        'princess': princess
      };

      console.log('result:', result);
      res.redirect('/admin/princess');
      return;
    });
  } else {
    // ADD
    ProtoPrincess(req.body).save(function (err, princess) {
      if (err) throw err;

      var result = {
        'result': 'success',
        'princess': princess
      };

      console.log('result:', result);
      res.redirect('/admin/princess');
      return;
    });
  }
};

exports.edit = function (req, res) {
  ProtoPrincess.findById(req.params.id, function (err, princess) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'princess': princess
    };

    res.render('admin.princess.edit.html', result);
    return;
  });
};

exports.view = function (req, res) {
  ProtoPrincess.findById(req.params.id, function (err, princess) {
    if (err) throw err;

    res.json(princess);
    return;
  });
};

exports.delete = function (req, res) {
  ProtoPrincess.findByIdAndRemove(req.params.id, function (err, princess) {
    if (err) throw err;

    res.redirect('/admin/princess');
    return;
  });
};

exports.publish = function (req, res) {
  async.waterfall([
    function (callback) {
      ProtoPrincess.findById(req.params.id, function (err, princess) {
        if (err) throw err;

        callback(null, princess);
        return;
      });
    },

    function (princess, callback) {
      ProtoPrincess.findByIdAndUpdate(req.params.id, { 'published': !princess.published }, function (err, princess) {
        if (err) throw err;

        callback(null);
        return;
      });
    }
  ], function (err, result) {
    res.redirect('/admin/princess');
    return;
  });
};