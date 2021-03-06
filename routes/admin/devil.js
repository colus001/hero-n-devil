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
var ProtoDevil = require('../../lib/model').ProtoDevil;

exports.index = function (req, res) {
  ProtoDevil.find({}, function (err, devils) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'devils': devils
    };

    res.render('admin.devil.html', result);
    return;
  });
};

exports.create = function (req, res) {
  if ( req.params.id ) {
    // EDIT
    ProtoDevil.findByIdAndUpdate(req.params.id, { $set: req.body }, function (err, devil) {
      if (err) throw err;

      var result = {
        'result': 'success',
        'devil': devil
      };

      console.log('result:', result);
      res.redirect('/admin/devil');
      return;
    });
  } else {
    // ADD
    ProtoDevil(req.body).save(function (err, devil) {
      if (err) throw err;

      var result = {
        'result': 'success',
        'devil': devil
      };

      console.log('result:', result);
      res.redirect('/admin/devil');
      return;
    });
  }
};

exports.edit = function (req, res) {
  ProtoDevil.findById(req.params.id, function (err, devil) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'devil': devil
    };

    res.render('admin.devil.edit.html', result);
    return;
  });
};

exports.view = function (req, res) {
  ProtoDevil.findById(req.params.id, function (err, devil) {
    if (err) throw err;

    res.json(devil);
    return;
  });
};

exports.delete = function (req, res) {
  ProtoDevil.findByIdAndRemove(req.params.id, function (err, devil) {
    if (err) throw err;

    res.redirect('/admin/devil');
    return;
  });
};

exports.publish = function (req, res) {
  async.waterfall([
    function (callback) {
      ProtoDevil.findById(req.params.id, function (err, devil) {
        if (err) throw err;

        callback(null, devil);
        return;
      });
    },

    function (devil, callback) {
      ProtoDevil.findByIdAndUpdate(req.params.id, { 'published': !devil.published }, function (err, devil) {
        if (err) throw err;

        callback(null);
        return;
      });
    }
  ], function (err, result) {
    res.redirect('/admin/devil');
    return;
  });
};