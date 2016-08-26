myApp.factory('TrainerMeta', function($location, TrainerFactory){
	var TrainerMeta = {
		url : function() {
			return $location.absUrl();
		},
		createSocialshareAttributes : function(provider) {
			var url = this.url(),
				description,
				text
			;
			if(provider == 'facebook' || provider == 'linkedin'){
				description = this.description();
				text = this.title()
			}
			if(provider == 'twitter') {
				text = this.title() + ' - ' + this.description();
			}
			console.log("Returning :", {
				socialshareUrl : url,
				socialshareText : text
			});
			return {
				socialshareUrl : url,
				socialshareText : text,
				socialshareDescription : description
			}
		},
		title : function() {
			return TrainerFactory.trainer.name.full;
		},
		description : function() {
			var trainer = TrainerFactory.trainer;
			var description;
			if(trainer.bio) {
				description = trainer.bio;
			}
			else {
				var name = trainer.name.first,
					location = trainer.location.city
						+ ", "
						+ trainer.location.state,
					hasLocation = trainer.location.city,
					hasSpecialties = trainer.specialties && trainer.specialties.length;

				description = 'Get started training with ' + name + ' today.';
				if(hasLocation) {
					description += ' Located in ' + location + ".";
				}
				if(hasSpecialties) {
					var length = trainer.specialties.length,
						str = ' ' + name + ' specializes in ';
					if(length == 1) {
						str += trainer.specialties[0].name;
					}
					if(length == 2) {
						str += trainer.specialties[0].name + ' and ' + trainer.specialties[1].name
					}
					if(length > 2) {
						str += trainer.specialties[0].name + ', ' + trainer.specialties[1].name + ', and ' + length - 2 + ' others';
					}
					str += '.';
					description += str;
				}
			}
			return description;
		}
	};
	return TrainerMeta;
})