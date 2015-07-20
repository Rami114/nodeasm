// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express

var port = process.env.PORT || 8080;        // set our port

// DB CONN
// =============================================================================
var Sequelize = require('sequelize');
var sequelize = new Sequelize(null, null, null, {
  dialect: 'sqlite',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },

  // SQLite only
  storage: 'data/asm.db'
});

// Now define our model
var Instruction = sequelize.define('instruction', {
    timestamps: false,
    freezeTableName: true,
    platform: Sequelize.TEXT,
    mnem: Sequelize.TEXT,
    description: Sequelize.TEXT,
    tableName: 'instructions'
})

// Remove the chaff we don't want
Instruction.removeAttribute('id');
Instruction.removeAttribute('timestamps'); 
Instruction.removeAttribute('freezeTableName');
Instruction.removeAttribute('tableName');
Instruction.removeAttribute('createdAt');
Instruction.removeAttribute('updatedAt');

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// List our platforms 
router.get('/platforms', function(req, res) {
    sequelize.query("SELECT DISTINCT platform from `instructions` ORDER BY platform", { type: sequelize.QueryTypes.SELECT}).then(function(platforms) {
        if (platforms) {
            platforms = platforms.map(function(platform){ return platform.platform; });
            res.json(platforms);
        } else {
            res.send(401).body("No platforms found");
        }
    });
});

// List instructions for a given platform
router.get('/platforms/:platform', function(req, res) {
    Instruction.findAll({ where: { platform: req.params.platform }, attributes: ['mnem']}).then(function(instructions) {
        if (instructions) {
            instructions = instructions.map(function(instruction){ return instruction.mnem; });
            res.json(instructions);
        } else {
            res.send(401).body("No instructions found in platform");
        }
    });   
});

// Find a set of instructions by 'search' in a given platform
router.get('/platforms/:platform/search/:terms', function(req, res) {
    Instruction.findAll({ where: { platform: req.params.platform, mnem: { $like: '%' + req.params.terms + '%' }}, attributes: ['mnem']}).then(function(instructions) {
        if (instructions) {
            instructions = instructions.map(function(instruction){ return instruction.mnem; });
            res.json(instructions);
        } else {
            res.send(401).body("No instructions found in platform");
        }
    });   
});

// List a given mnem for a given platform
router.get('/platforms/:platform/:mnem', function(req, res) {
    Instruction.findOne({ where: { platform: req.params.platform, mnem: req.params.mnem }}).then(function(instruction) {
        if (instruction) {
            res.json(instruction);
        } else {
            res.send(401).body("Could not find instruction");
        }
    });   
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('The awesomeness is located on port ' + port);

