
angular.module('ngLungeFullStack2App')
	.factory('TrainerCertifications', ['$http', '$q', function($http, $q){
		var ajax = {
			busy : false, // for when someone is adding or removing a cert
			loading : false, // for when another page is loading
			complete : false
		};
		var params = {
			lastMaxId : undefined,
			nextMaxId : undefined,
			query : undefined
		};

		function setQuery(query) {
			params.query = query;
		}

		function trainerHasCertificaiton(trainer, certification) {
			// note when the trainer is populated we can use the certifications_v2_map, but I guess that's not
			// guaranteed to be populated? hm...
			if(trainer.certifications_v2) {
				for(var i = 0; i < trainer.certifications_v2.length; i++){
					var certificationV2 = trainer.certifications_v2[i];
					if(certificationV2.active === false) continue;
					var certification_type = certificationV2.certification_type;
					var id = certification._id
						? certification._id
						: certification;
					if(id == certification_type._id) {
						return true;
					}
				}
				return false;
			}
		}
		function reset() {
			params.nextMaxId = undefined;
			ajax.busy = false;
			ajax.loading = false;
			ajax.complete = false;
			TrainerCertifications.certificationOrganizations = [];
			TrainerCertifications.certificationCountMapByTrainer = {};
			TrainerCertifications.setQuery('');
		}
		function getPage() {
			return new $q(function(resolve, reject){
				if(!ajax.loading && !ajax.complete) {
					ajax.loading = true;
					$http({
						method : 'GET',
						url : '/api/certification-organizations/page',
						params : params})
						.success(onSuccess)
						.error(onError);
				}
				else {
					console.log('TrainerCertifications Service is busy');
					resolve(TrainerCertifications.certificationOrganizations);
				}
				function onSuccess(certifications, status, headers) {
					ajax.loading = false;
					params.lastMaxId = params.nextMaxId;
					params.nextMaxId = headers('X-Next-Max-Id');
					TrainerCertifications.ajax = ajax;
					TrainerCertifications.certificationOrganizations
						= TrainerCertifications.certificationOrganizations.concat(certifications);
					resolve(TrainerCertifications.certificationOrganizations);
				}
				function onError(err, status, headers) {
					if(status == 404) {
						ajax.complete = true;
					}
					ajax.loading = false;
					TrainerCertifications.ajax = ajax;
					reject(err);
				}
			})
		}

		function refreshCurrentPage() {
			params.nextMaxId = params.lastMaxId;
			return getPage();
		}

		var TrainerCertifications = {
			certificationOrganizations : [],
			certificationCountMapByTrainer : {},
			ajax : ajax,
			// The meat of the service, get the page
			getPage : getPage,
			// Refresh the page, for example, if we get a socket notice that a cert updated, refresh them
			refresh : refreshCurrentPage,
			reset : reset,
			setQuery : setQuery,
			// If a trainer has a specific certification, another simple lookup
			trainerHasCertificaiton : trainerHasCertificaiton
		};
		return TrainerCertifications;
	}])