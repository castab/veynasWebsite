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
                        return vm.getNewReviews();
                    } else {
                        defer.resolve(resp);
                    };
                } else {
                    // File needs update
                    $http.get("api/getVeynasReviews.php")
                    .then(function (resp) {
                        if (resp.data && resp.data.status) {
                            if (resp.data.status == "OK"){    
                                // Response looks good
                                // Append date of storage, store, and return
                                resp.data.date_stored = moment().format();
                                vm.saveReviews(resp.data);
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
                }
            }, function(error) {
                // file failed to open or isn't there
                // make a new one by calling the Google API
                $http.get("api/getVeynasReviews.php")
                .then(function (resp) {
                    if (resp.data && resp.data.status) {
                        if (resp.data.status == "OK"){    
                            // Response looks good
                            // Append date of storage, store, and return
                            resp.data.date_stored = moment().format();
                            $http.post("api/saveVeynasReviews.php", resp.data)
                            .finally(function() {
                                // There's nothing else to do
                                defer.resolve(resp);
                            });
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
            });
            return defer.promise;
        };

        vm.saveReviews = function(data) {
            $http.post("api/saveVeynasReviews.php", data)
            .finally(function() {
                // There's nothing else to do, file has been written.
            });
        };

        // This function is currently not working... (???)
        vm.getNewReviews = function () {
            var defer = $q.defer();
            $http.get("api/getVeynasReviews.php")
            .then(function (resp) {
                if (resp.data && resp.data.status) {
                    if (resp.data.status == "OK"){    
                        // Response looks good
                        // Append date of storage, store, and return
                        resp.data.date_stored = moment().format();
                        vm.saveReviews(resp.data);
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