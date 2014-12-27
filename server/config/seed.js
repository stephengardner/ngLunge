/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Thing = require('../api/thing/thing.model');
var Trainer = require('../api/trainer/trainer.model');
var User = require('../api/user/user.model');
var Certification = require('../api/certification/certification.model');
var CertificationType = require('../api/certification-type/certification-type.model');
//var User = require('../api/user/user.model');
var Registration = require('../api/registration/registration.model');
Registration.find({}).remove(function(){
	Registration.create({
		email : 'testes@gmail.com',
		authenticationHash : 'something'
	});
});


Trainer.find({}).remove(function() {
	Trainer.create({
		name : {first : "Augie", last : "Gardner"},
		location : {city : "Washington", state : "DC", zipcode : "20090"},
		type : 'in-home',
		email : 'augdog9110@gmail.com',
		profile_picture : {
			thumbnail : {
				url : '/assets/images/trainers/testImage.jpg'
			}
		},
		password : "test12"
	},{
		name : {first : "Paul2", last : "Murskov"},
		location : {city : "Washington", state : "DC", zipcode : "20090"},
		type : 'in-home',
		email : 'augdog9112@gmail.com',
		profile_picture : {
			thumbnail : {
				url : '/assets/images/trainers/testImage.jpg'
			}
		},
		password : "test12"
	},{
		name : {first : "Paul3", last : "Murskov"},
		location : {city : "Washington", state : "DC", zipcode : "20090"},
		type : 'in-home',
		email : 'augdog9113@gmail.com',
		profile_picture : {
			thumbnail : {
				url : '/assets/images/trainers/testImage.jpg'
			}
		},
		password : "test12"
	},{
		name : {first : "Paul4", last : "Murskov"},
		location : {city : "Washington", state : "DC", zipcode : "20090"},
		type : 'in-home',
		email : 'augdog9114@gmail2.com',
		profile_picture : {
			thumbnail : {
				url : '/assets/images/trainers/testImage.jpg'
			}
		},
		password : "test12"
	})
});

/*
setTimeout(function(){
	Trainer.create({
		name : {first : "Augie", last : "Gardner"},
		location : {city : "Washington", state : "DC", zip : "20090"},
		type : 'in-home',
		email : 'augdog9114@2gmail.com',
		profile_picture : {
			thumbnail : {
				url : '/assets/images/trainers/testImage.jpg'
			}
		},
		password : "test12"
	});
}, 6000);
setTimeout(function(){
	Trainer.create({
		name : {first : "Augie", last : "Gardner"},
		location : {city : "Washington", state : "DC", zip : "20090"},
		type : 'in-home',
		email : 'augdog9114@22gmail.com',
		profile_picture : {
			thumbnail : {
				url : '/assets/images/trainers/testImage.jpg'
			}
		},
		password : "test12"
	});
}, 4000);
*/
/*
var request = require('request');
var req = {};
req.body = {
	email : "augdog9114@gmail.com",
	password : "test",
	type : "trainer"
};
setTimeout(function(){
	request.post(
		'http://localhost:9000/auth/local',
		{ form: req.body },
		function (error, response, body) {
			console.log("Returned");
			if (!error && response.statusCode == 200) {
				console.log(body)
			}
		}
	);
}, 6000);
*/
/*
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
*/

Certification.find({}).remove(function(){
	Certification.create({
		name : "American Council on Exercise (ACE)",
		about : "Founded in 1985, the American Council on Exercise (ACE) is a nonprofit organization committed to America's health and wellbeing. Over the past 25 years, we have become an established resource for both fitness professionals and consumers, providing comprehensive, unbiased, scientific research impacting the fitness industry and validating ourselves as the country's trusted authority on fitness. Today, ACE is the largest nonprofit fitness certification, education and training organization in the world with 53,000 certified professionals who hold more than 59,000 ACE certifications. With a long heritage in certification, education, training and public outreach, we are among the most respected fitness organizations in the industry and a resource consumers have come to trust for health and fitness education.",
		website : "www.ACEfitness.org",
		address : "4851 Paramount Dr\nSan Diego, CA 92123",
		phone : "888-825-3636",
		typesObjects : {
			"Fitness Nutrition Specialist" : { name : "Fitness Nutrition Specialist"},
			"Personal Trainer"  :{ name : "Personal Trainer" },
			"ACE Health Coach" : { name : "ACE Health Coach" },
			"Group Fitness Instructor" : { name : "Group Fitness Instructor" }
		},
			/*
		types : [
			{
				name : "Fitness Nutrition Specialist"
			},
			{
				name : "Personal Trainer"
			},
			{
				name : "ACE Health Coach"
			},
			{
				name : "Group Fitness Instructor"
			},
			{
				name : "Peer Fitness Trainer"
			},
			{
				name : "Advanced Health & Fitness Specialist"
			}
		],
		*/
		active : 1
	},
		{
			name : "National Council for Certified Personal Trainers (NCCPT)",
			about : ""//,
			/*
			types : [{
				name : "Personal Training Certification"
			}]
			*/
		},
		{
			name : "National Academy of Sports Medicine (NASM)",
			about : ""//,
			/*
			types : [{
				name : "Group Personal Training Specialist (GPTS)"
			},{
				name : "Master Trainer"
			},{
				name : "Certified Personal Trainer (CPT)"
			},{
				name : "Weight Loss Specialist (WLS)"
			}]
			*/
		},
		{
			name : "American College of Sports Medicine (ACSM)",
			about : ""//,
			/*
			types : [{
				name : "ACSM Certified Personal Trainer"
			},{
				name : "ACSM Certified Health Fitness Specialist"
			},{
				name : "ACSM Certified Clinical Exercise Specialist"
			},{
				name : "ACSM Registered Clinical Exercise Physiologist®"
			}]
			*/
		},
		{
			name : "PTA Global (PTAG)",
			about : ""//,
			/*
			types : [{
				name : "Personal Trainer Certification"
			},{
				name : "Personal Training Bridging Course"
			},{
				name : "Advanced Personal Training Course"
			},{
				name : "Mentorship 1"
			}]
			*/
		}

		, function() {
			/*
			Certification.findOne({name : "PTA Global (PTAG)"}, function(err, cert) {
				Trainer.findOne({'name.first' : 'Augie'}, function(err, trainer){
					trainer.certifications.push(cert._id);
					trainer.save(function (err) {
						if (err) { console.log("--------************************** ERR", err) }
						//return res.json(200, trainer);
					});
				});
			});
			*/
			console.log('finished populating certifications');
			CertificationType.find({}).remove(function(){
				Certification.findOne({name : "PTA Global (PTAG)"}, function(err, cert){
					if(err){
						console.log("error on finding certification:", err);
					}
					CertificationType.create({
						name : "Personal Trainer Certification",
						certification : cert._id
					}, function(err, cert_type) {
						cert.types.push(cert_type._id);
						cert.save(function(){
							console.log("Done referencing certs and cert types");
						});
					});
				});
			})
		}
	);
});
/*
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
*/

function handleError(res, err) {
	return res.send(500, err);
}
/*
passport.authenticate('local', function (err, user, info) {
	var error = err || info;
	if (error) return res.json(401, error);
	if (!user) return res.json(404, {message: 'Something went wrong, please try again.'});

	var token = auth.signToken(user._id, user.role);
	console.log("..............", token);
	res.json({token: token});
})(req, res, next)
	*/