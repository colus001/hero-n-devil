//////////////////////////////////////////////////
//
//  grouple - model.js
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
  },
  current_player_id: {
    type: ObjectId
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
  account_id: {
    type: ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  devil_id: {
    type: ObjectId
  }
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
  player_id: {
    type: ObjectId,
    required: true
  },

  // PLAYABLE DATA
  level: {
    type: Number,
    default: 1
  },
  current_experience: {
    type: Number,
    default: 1
  },
  target_experience: {
    type: Number,
    default: 100
  },
  current_health_point: {
    type: Number
  },

  // STATS
  class: {
    type: String,
    required: true
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
  }],
  tags: [{
    type: String
  }]
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
  player_id: {
    type: ObjectId,
    required: true
  },

  // PLAYABLE DATA
  level: {
    type: Number,
    required: true,
    default: 1
  },
  current_experience: {
    type: Number,
    required: true,
    default: 1
  },
  target_experience: {
    type: Number,
    required: true,
    default: 100
  },
  current_health_point: {
    type: Number,
    required: true
  },
  current_action_point: {
    type: Number,
    default: 20
  },
  action_point: {
    type: Number,
    default: 20
  },

  // STATS
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
  player_id: {
    type: ObjectId,
    required: true
  },
  // PLAYABLE DATA
  level: {
    type: Number,
    default: 1
  },
  current_experience: {
    type: Number,
    default: 1
  },
  target_experience: {
    type: Number,
    default: 100
  },
  current_health_point: {
    type: Number
  },
  // STATS
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
  price: {
    type: Number,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  skills: [{
    type: String
  }]
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
  player_id: {
    type: ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
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
  time_to_collect: {
    type: Number,
    required: true
  },
  isCaptured: {
    type: Boolean,
    default: false
  },
  defenders: [{
    level: {
      type: Number,
      default: 1
    },
    current_health_point: {
      type: Number
    },
    class: {
      type: String,
      required: true
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
    }],
    tags: [{
      type: String
    }]
  }]
});



// PROTOTYPES FOR ADMINISTRATOR
exports.ProtoHero = mongoose.model('protohero', {
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
exports.ProtoDevil = mongoose.model('protodevil', {
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

exports.ProtoMonster = mongoose.model('protomonster', {
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
  }],
  playable: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
});

exports.ProtoCity = mongoose.model('protocity', {
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
  time_to_collect: {
    type: Number,
    required: true
  },
  playable: {
    type: Boolean,
    default: false
  }
});

exports.ProtoSoldier = mongoose.model('protosoldier', {
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
  price: {
    type: Number,
    required: true
  },
  experience: {
    type: Number,
    required: true
  }
});