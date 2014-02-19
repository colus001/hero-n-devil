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
var ProtoHero = require('../../lib/model').ProtoHero;

exports.index = function (req, res) {
  ProtoHero.find({}, function (err, heros) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'heros': heros
    };

    res.render('admin.hero.html', result);
    return;
  });
};

exports.create = function (req, res) {
  if ( req.params.id ) {
    // EDIT
    ProtoHero.findByIdAndUpdate(req.params.id, { $set: req.body }, function (err, hero) {
      if (err) throw err;

      var result = {
        'result': 'success',
        'hero': hero
      };

      console.log('result:', result);
      res.redirect('/admin/hero');
      return;
    });
  } else {
    // ADD
    ProtoHero(req.body).save(function (err, hero) {
      if (err) throw err;

      var result = {
        'result': 'success',
        'hero': hero
      };

      console.log('result:', result);
      res.redirect('/admin/hero');
      return;
    });
  }
};

exports.edit = function (req, res) {
  ProtoHero.findById(req.params.id, function (err, hero) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'hero': hero
    };

    res.render('admin.hero.edit.html', result);
    return;
  });
};

exports.view = function (req, res) {
  ProtoHero.findById(req.params.id, function (err, hero) {
    if (err) throw err;

    res.json(hero);
    return;
  });
};

exports.delete = function (req, res) {
  ProtoHero.findByIdAndRemove(req.params.id, function (err, hero) {
    if (err) throw err;

    res.redirect('/admin/hero');
    return;
  });
};

exports.publish = function (req, res) {
  async.waterfall([
    function (callback) {
      ProtoHero.findById(req.params.id, function (err, hero) {
        if (err) throw err;

        callback(null, hero);
        return;
      });
    },

    function (hero, callback) {
      ProtoHero.findByIdAndUpdate(req.params.id, { 'published': !hero.published }, function (err, hero) {
        if (err) throw err;

        callback(null);
        return;
      });
    }
  ], function (err, result) {
    res.redirect('/admin/hero');
    return;
  });
};