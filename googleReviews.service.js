(function () {
    angular.module('mainApp')
    .service("googleReviewsService", ['$http', '$q', function($http, $q) {

        vm = this;
        
        vm.getReviews = function () {
            return $http.get("api/reviews.api.php"); 
        };

    }]);

})();