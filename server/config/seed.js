/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Thing = require('../api/thing/thing.model');
var Trainer = require('../api/trainer/trainer.model');
var User = require('../api/user/user.model');

Trainer.find({}).remove(function() {
	Trainer.create({
		name : {first : "Paul", last : "Murskov"},
		location : {city : "Washington", state : "DC", zip : "20090"},
		type : 'in-home',
		profile_picture : {
			url : '/assets/images/yeoman.png'
		}
	},{
		name : {first : "Paul2", last : "Murskov"},
		location : {city : "Washington", state : "DC", zip : "20090"},
		type : 'in-home',
		profile_picture : {
			url : '/assets/images/yeoman.png'
		}
	},{
		name : {first : "Paul3", last : "Murskov"},
		location : {city : "Washington", state : "DC", zip : "20090"},
		type : 'in-home',
		profile_picture : {
			url : '/assets/images/yeoman.png'
		}
	},{
		name : {first : "Paul4", last : "Murskov"},
		location : {city : "Washington", state : "DC", zip : "20090"},
		type : 'in-home',
		profile_picture : {
			url : '/assets/images/yeoman.png'
		}
	});
});

Thing.find({}).remove(function() {
  Thing.create({
    name : 'Development Tools',
    info : 'Integration with popular tools such as Bower, Grunt, Karma, Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, Stylus, Sass, CoffeeScript, and Less.'
  }, {
    name : 'Server and Client integration',
    info : 'Built with a powerful and fun stack: MongoDB, Express, AngularJS, and Node.'
  }, {
    name : 'Smart Build System',
    info : 'Build system ignores `spec` files, allowing you to keep tests alongside code. Automatic injection of scripts and styles into your index.html'
  },  {
    name : 'Modular Structure',
    info : 'Best practice client and server structures allow for more code reusability and maximum scalability'
  },  {
    name : 'Optimized Build',
    info : 'Build process packs up your templates as a single JavaScript payload, minifies your scripts/css/images, and rewrites asset names for caching.'
  },{
    name : 'Deployment Ready',
    info : 'Easily deploy your app to Heroku or Openshift with the heroku and openshift subgenerators'
  });
});

User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test'
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, function() {
      console.log('finished populating users');
    }
  );
});