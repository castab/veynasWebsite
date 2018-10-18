(function () {
    angular.module('VeynasApp')
    .service("googleReviewsService", ['$http', '$q', function($http, $q) {

        vm = this;
        
        vm.getAllReviews = function () {
            var defer = $q.defer();
            // Try loading from the local stored copy
            $http.get("api/reviews.json")
            .then(function (resp) {
                // Stored copy is present
                // Check date of storage
                if (resp.data.date_stored) {
                    var reviewDate = moment(resp.data.date_stored);
                    todaysDate = moment();
                    if (todaysDate.diff(reviewDate, 'days') < 30) {
                        // Date is valid, resolve the promise
                        defer.resolve(resp);
                    } else {
                        // Review is too old
                        // Get a new payload
                        $http.get("api/reviews.api.php")
                        .then(function() {
                            // Got a new payload
                            // Resolve the promise
                            defer.resolve(resp);
                        }, function(error) {
                            // Failed
                            // Return the error
                            defer.reject(error);
                        });
                    }
                }
                defer.resolve(resp);
            }, function() {
                // There was no response from api/reviews.json
                $http.get("api/reviews.api.php")
                .then(function() {
                    // Got a new payload
                    // Return the response via promise
                    defer.resolve(resp);
                }, function(error) {
                    // Failed
                    defer.reject(error);
                });
            });
            return defer.promise;
        };

    }]);

})();