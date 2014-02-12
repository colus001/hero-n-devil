//////////////////////////////////////////////////
//
//  grouple - admin/city.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

// Module dependencies
var async = require('async');

// Model
var ProtoCity = require('../../lib/model').ProtoCity;

exports.index = function (req, res) {
  ProtoCity.find({}, function (err, cities) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'cities': cities
    };

    res.render('admin.city.html', result);
    return;
  });
};

exports.create = function (req, res) {
  ProtoCity(req.body).save(function (err, city) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'city': city
    };

    res.redirect('/admin/city');
    return;
  });
};

exports.edit = function (req, res) {
  ProtoCity.findById(req.params.id, function (err, city) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'city': city
    };

    res.render('admin.city.edit.html', result);
    return;
  });
};

exports.view = function (req, res) {
  ProtoCity.findById(req.params.id, function (err, city) {
    if (err) throw err;

    res.json(city);
    return;
  });
};

exports.delete = function (req, res) {
  ProtoCity.findByIdAndRemove(req.params.id, function (err, city) {
    if (err) throw err;

    res.redirect('/admin/city');
    return;
  });
};