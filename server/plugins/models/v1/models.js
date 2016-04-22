module.exports = function setup(options, imports, register){
	// Unfortunately we kind of structured the models improperly, they need an "app" to run...
	// This could have been better accomplished by using DI from the beginning and passing around the connections
	// object... But alas, we use a mock app with a config in it and get the models this way.
	var MockApp = {
		connections : imports.connections,
		config : options.config // this must be here because some models require config for grabbing Auth data...
	}
	register(null, {
		models : {
			ApartmentSize : require('../../../app/models/apartment_size/apartment_size.model.js')(MockApp),
			User : require('../../../app/models/user/user.model.js')(MockApp),
			Property : require('../../../app/models/property/property.model.js')(MockApp),
			PropertyV2 : require('../../../app/models/property_v2/property-v2.model.js')(MockApp),
			PropertyNew : require('../../../app/models/property_new/property-new.model.js')(MockApp),
			PropertyMerged : require('../../../app/models/property_merged/property-merged.model.js')(MockApp),
			Feed : require('../../../app/models/feed/feed.model.js')(MockApp),
			Email : require('../../../app/models/email/email.model.js')(MockApp),
			PropertyLead : require('../../../app/models/property_lead/property-lead.model.js')(MockApp),
			PrimelineActivity : require('../../../app/models/primeline_activity/primeline-activity.model.js')(MockApp),
			Amenity : require('../../../app/models/amenity/amenity.model.js')(MockApp),
			EmailSearchResults : require('../../../app/models/email_search_results/email-search-results.model.js')(MockApp),
			Primeline : require("../../../primeline")(MockApp),
			UnitUpdater : require("../../../components/updaters/unit-updater")(MockApp),
			FeedUpdater : require("../../../components/updaters/feed-updater")(MockApp)
		}
	})
}