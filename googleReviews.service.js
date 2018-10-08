(function () {
    angular.module('mainApp')
    .service("googleReviewsService", ['$http', '$q', function($http, $q) {

        vm = this;
        
        vm.getReviews = function () {
            var defer = $q.defer();
            $http.get("api/reviews.json")
            .then(function(resp){
                // file is there, check if recent enough to use
                if (resp.data.date_stored) {
                    var reviewDate = moment(resp.data.date_stored);
                    todaysDate = moment();
                    if (todaysDate.diff(reviewDate, 'days') >= 30){
                        vm.getNewReviews()
                        .then(function(resp){
                            defer.resolve(resp);
                        }, function(error) {
                            defer.reject();
                        });
                    } else {
                        defer.resolve(resp);
                    };
                } else {
                    // File at least 30 days old
                    // File needs update
                    vm.getNewReviews()
                    .then(function(resp) {
                        defer.resolve(resp);
                    }, function(error) {
                        defer.reject(error);
                    });
                }
            }, function(error) {
                // file failed to open or isn't there
                // make a new one by calling the Google API
                vm.getNewReviews()
                .then(function(resp) {
                    defer.resolve(resp);
                }, function(error) {
                    defer.reject(error);
                });
            });
            return defer.promise;
        };

        vm.saveReviews = function(data) {
            return $http.post("api/saveVeynasReviews.php", data);
        };

        vm.getNewReviews = function () {
            var defer = $q.defer();
            $http.get("api/getVeynasReviews.php")
            .then(function (resp) {
                if (resp.data && resp.data.status) {
                    if (resp.data.status == "OK"){    
                        // Response looks good
                        // Append date of storage, store, and return
                        resp.data.date_stored = moment().format();
                        vm.saveReviews(resp.data).finally(function(){});
                        defer.resolve(resp);
                    } else {
                        // Got a response but status is other than OK
                        // Make status visible
                        defer.reject(resp.data.status);
                    }
                } else {
                    // Got response, but nothing worthwhile
                    defer.reject('1');
                }
            }, function (error) {
                // No response at all
                defer.reject('2');
            });
            return defer.promise;
        };

    }]);

})();