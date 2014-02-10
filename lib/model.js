//////////////////////////////////////////////////
//
//  grouple - util.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

// Module dependencies
var mongoose = require('mongoose');

// Mongoose ObjectId
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

// Account
exports.Account = mongoose.model('account', {
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

exports.Player = mongoose.model('player', {
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  account_id: {
    type: ObjectId,
    required: true
  },
  devil: {
    devil: {
      type: Mixed
    },
    colonies: [{
      type: Mixed
    }],
    cities: [{
      type: Mixed
    }],
    monsters: [{
      type: Mixed
    }],
    dungeon: [{
      monsters: [{
        type: Mixed
      }]
    }]
  },
});

// Hero
exports.Hero = mongoose.model('hero', {
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  class: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  health_point: {
    type: Number,
    required: true
  },
  attack_speed_per_sec: {
    type: Number,
    required: true
  },
  physical_damage: {
    type: Number,
    required: true
  },
  magic_damage: {
    type: Number,
    required: true
  },
  armor: {
    type: Number,
    required: true
  },
  magic_resist: {
    type: Number,
    required: true
  },
  skills: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  playable: {
    type: Boolean,
    default: false
  }
});

// Devil
exports.Devil = mongoose.model('devil', {
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  health_point: {
    type: Number,
    required: true
  },
  attack_speed_per_sec: {
    type: Number,
    required: true
  },
  physical_damage: {
    type: Number,
    required: true
  },
  magic_damage: {
    type: Number,
    required: true
  },
  armor: {
    type: Number,
    required: true
  },
  magic_resist: {
    type: Number,
    required: true
  },
  skills: [{
    type: String
  }]
});

exports.Monster = mongoose.model('monster', {
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: true
  },
  health_point: {
    type: Number,
    required: true
  },
  attack_speed_per_sec: {
    type: Number,
    required: true
  },
  physical_damage: {
    type: Number,
    required: true
  },
  magic_damage: {
    type: Number,
    required: true
  },
  armor: {
    type: Number,
    required: true
  },
  magic_resist: {
    type: Number,
    required: true
  },
  skills: [{
    type: String
  }],
  playable: {
    type: Boolean,
    default: false
  }
});

exports.City = mongoose.model('city', {
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: true
  },
  defense: {
    type: Number,
    required: true
  },
  population: {
    type: Number,
    required: true
  },
  economy_level: {
    type: Number,
    required: true
  },
  soldiers: {
    type: Number,
    required: true
  },
  army_level: {
    type: Number,
    required: true
  },
  playable: {
    type: Boolean,
    default: false
  }
});