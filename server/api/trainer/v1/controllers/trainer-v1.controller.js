function handleError(res, err) {
	return res.status(500).send(err);
}

module.exports = function(app) {
	var exports = {};
	exports.showPage = function(req, res) {
		console.log("ShowPage");
		var DEFAULTS = {
			nextMaxId : Infinity,
			itemsPerPage : 10
		};
		var nextMaxId = parseInt(req.query.nextMaxId) !== 0
			? (parseInt(req.query.nextMaxId)
			? parseInt(req.query.nextMaxId)
			: Infinity)
			: 0;
		var itemsPerPage = parseInt(req.query.itemsPerPage) || 10;
		if(itemsPerPage > 20)
			itemsPerPage = 20;
		var searchQuery = {
			id : { $lte : nextMaxId }
		}

		// Todo - efficiency
		// this is not efficient, querying a mongodb field on a regular expression that is either case insensitive
		// or not using the rooted expression '^' can be slow when searching larger documents
		if(req.query.query && req.query.query.length) {
			searchQuery['$or'] = [
				{
					'email': {$regex: new RegExp(req.query.query, "i")}
				},
				{
					'name.first': {$regex: new RegExp(req.query.query, "i")}
				},
				{
					'name.last' : { $regex : new RegExp(req.query.query, "i") }
				}
			];
		}

		console.log("The search query is:", searchQuery);
		app.models.Trainer.find(searchQuery)
			.limit(itemsPerPage)
			.sort('-id')
			.exec(function(err, results){
				if(err) { return handleError(res, err); }
				if(!results || !results.length) {
					return res.status(404).send(404);
				}
				else {
					res.setHeader('X-Next-Max-Id', results[results.length-1].id - 1);
					return res.status(200).json(results);
				}
			})
	};

	return exports;
}