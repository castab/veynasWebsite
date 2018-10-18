(function () {
    angular.module('VeynasApp')
        .controller('mainController', ['$http', 'googleReviewsService', function($http, googleReviewsService) {
            // controller scope
            vm = this;

            $(document).ready(function(){
                // Add smooth scrolling to all links in navbar + footer link
                $(".navbar a, footer a[href='#Veynas'], .topSelector a").on('click', function(event) {
                  // Make sure this.hash has a value before overriding default behavior
                  if (this.hash !== "") {
                    // Prevent default anchor click behavior
                    event.preventDefault();
              
                    // Store hash
                    var hash = this.hash;
              
                    // Using jQuery's animate() method to add smooth page scroll
                    // The optional number (900) specifies the number of milliseconds it takes to scroll to the specified area
                    $('html, body').animate({
                      scrollTop: $(hash).offset().top
                    }, 900, function(){
                 
                      // Add hash (#) to URL when done scrolling (default click behavior)
                      window.location.hash = hash;
                    });
                  } // End if
                })
              })
                
                $(window).scroll(function() {
                  $(".slideanim").each(function(){
                    var pos = $(this).offset().top;
              
                    var winTop = $(window).scrollTop();
                      if (pos < winTop + 600) {
                        $(this).addClass("slide");
                      }
                  });
                });

                $('[data-toggle="tooltip"]').tooltip();

                googleReviewsService.getAllReviews()
                  .then( function (resp) {
                    console.log('Google reviews data successfully retrieved:')
                    console.log(resp.data);
                    vm.prepareReviews(resp.data);
                  }, function (error) {
                    console.log('Could not retrieve Google reviews data.');
                  });

                vm.prepareReviews = function(data) {
                  vm.reviews = [];
                  _.forEach(data.result.reviews, function(review){
                    if (review.rating > 3) {
                      var reviewObject = new Object();
                      reviewObject.firstName = _.capitalize(_.words(review.author_name)[0]);
                      reviewObject.text = review.text;
                      reviewObject.active = "";
                      vm.reviews.push(reviewObject);
                    };
                  })
                  // Pick 5 random reviews to display
                  vm.reviews = _.sampleSize(vm.reviews, 5);
                  var counter = 0; // Need a counter to set the carousel indicators
                  _.forEach(vm.reviews, function(review){
                    review.index = counter;
                    counter++;
                  });
                  vm.reviews[0].active = "active"; // Set the first one active for carousel indicator
                };

        }]);

})();