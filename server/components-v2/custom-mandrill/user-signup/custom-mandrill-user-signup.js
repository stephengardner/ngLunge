var async = require("async"),
	Promise = require("promise"),
	_ = require("lodash"),
	logger = require("../../../components/logger")(),
	config = require("../../../config/environment"),
	$q = require("q");
	;
module.exports = function(options, imports, register){
	var templateToUser = "user-signup-welcome-2-0",
		templateToAdmin = "admin-user-signup-notification-2-1",
		customMandrillSender = imports.customMandrillSender,
		loggerType = 'custom-mandrill-user-signup';

	var User = imports.userModel;

	// Send the user the text-only "Hey Welcome..." email.
	var customMandrillUserSignup = {
		send : function(options){
			return new Promise(function(resolve, reject) {
				options = options || {};
				var user = options.user;
				if(!user || !user._id) {
					console.log("error when using user:", user);
					throw new Error("No valid user inside template send request");
				}
				logger.info({type : loggerType, msg : 'sending the signup welcome letter to the user'});
				User.findOne({_id : user._id}).populate({path:'filters.apartment_size'}).exec(function(err, foundUser){
					if(err)
						return reject(err);
					if(!foundUser) {
						return reject(new Error("Couldn't find from passed in object:", user))
					}
					onGetUser(err, foundUser);
				});

				function onGetUser(err, user) {
					if(err)
						throw new Error("Error populating filters.apartment_size" +
						" for a user when sending a template");
					else {// Construct the human readable apartment size string for the email
						//logger.info("user filters:", user.filters);
						var emailReadableSize = user.filters.readable.apartment_size.split(", ");
						var sizeString = "";
						if(emailReadableSize.length) {
							if(emailReadableSize[0] == "All Beds") {
								sizeString = "an apartment of any size";
							}
							else {
								sizeString = "a ";
								for(var i = 0; i < emailReadableSize.length; i++) {
									if((i == (emailReadableSize.length -1)) && emailReadableSize.length >= 2) {
										sizeString += "or " + emailReadableSize[i];
									}
									else {
										sizeString += emailReadableSize[i];
										if(emailReadableSize.length > 2) {
											sizeString += ",";
										}
										sizeString += " ";
									}
								}
								sizeString += " apartment";
							}
						}

						//logger.verbose("Sending user signup welcome email.  It has options of:", options);
						var params = {
							user : user,
							template_name: templateToUser,
							global_merge_vars: [
								{
									name: "name",
									content: user.name.first
								},
								{
									name: "size",
									content: sizeString
								},
								{
									name: "move_in",
									content: user.filters.readable.move_in
								},
								{
									name: "rent_max",
									content: "$" + user.filters.rent.max
								}
							]
						};
						params = customMandrillSender._simpleCreateParams(params);
						customMandrillSender._send(params).then(resolve, reject);
					}
				}
			})

		}
	};

	// Send the admin the table-display email with the user's information
	var customMandrillUserSignupToAdmin = {
		send : function(options) {
			return new Promise(function(resolve, reject) {
				options = options || {};
				logger.info({type : loggerType, msg : 'sending the signup notification to the admins'});
				var user = options.user;
				if (!user) {
					throw new Error("No valid user inside template send request");
				}
				User.populate(user, {path: 'filters.apartment_size'}, function (err, user) {
					if (err) {
						throw new Error("Error populating filters.apartment_size" +
						" for a user when sending a template");
					}
					var params = {
						user : user,
						template_name: templateToAdmin,
						email : config.email.admin,
						global_merge_vars: [
							{
								name: "name",
								content: user.name.full
							},
							{
								name: "location",
								content: user.filters.readable.location//location.length ? user.filters.location[0].formatted : "No Location Input"
							},
							{
								name: "size",
								content: user.filters.readable.apartment_size
							},
							{
								name: "move_in",
								content: user.filters.readable.move_in
							},
							{
								name: "rent",
								content: user.filters.readable.rent//.min ? "$" + user.filters.rent.min + " - $" + user.filters.rent.max : "Less than $" + user.filters.rent.max
							},
							{
								name: "contactmethod",
								content: user.filters.readable.contact_method
							},
							{
								name: "email",
								content: user.email ? user.email : "none"
							},
							{
								name: "phone",
								content: user.phone ? user.phone : "none"
							},
							{
								name: 'extras',
								content: user.filters.readable.extras
							}
						]
					};
					params = customMandrillSender._simpleCreateParams(params);
					//logger.info("Sending params:", params);
					customMandrillSender._send(params).then(resolve).catch(reject);
				});
			});
		}
	}

	register(null, {
		customMandrillUserSignup : customMandrillUserSignup,
		customMandrillUserSignupToAdmin : customMandrillUserSignupToAdmin
	})
};