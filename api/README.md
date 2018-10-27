# The 'API'
I'd probably call this piece of the entire website the most notable.  I wrote a PHP script that calls [Google's Places API](https://developers.google.com/places/web-service/details) and stores the JSON payload to a file on the hosting server.  Since my Dad's business is relatively new, it's unlikely that new reviews will be posted more frequently than a few weeks or so - this way the website will pull the JSON file directly from itself and load quickly.  Also, to adhere to [Google's Policies](https://cloud.google.com/maps-platform/terms/#3-license), the PHP script will also keep track of how old the JSON file is so that it will go out and fetch a new one as needed.  Currently, Google does not allow a JSON response to be stored for longer than 30 days.

## RESTful(?)
This 'API' is not RESTful.  Given it's purpose, it doesn't really need to be - it won't kill business or the website.  In a worst case scenario, the website will not have a "Reviews" section.

You can direct a REST client such as [Insomina](https://insomnia.rest/) (my favorite) or [Postman](https://www.getpostman.com/) to https://supernet.tech/veynas/api/reviews.api.php and get a response *similiar* to a RESTful API.  You can even hit it with a browser to see the response too - I recommend a JSON viewer plugin though.  

So long as the server is running and reachable, this script *should* give a response for any scenario, otherwise, help me out and [put in a pull request](https://github.com/castab/veynasWebsite/pulls) for fixes, yeah?

## Security
I honestly didn't know that one had to pay to use an API.  I honestly didn't know Google even had API's for the public to use... Really!  Call me ignorant on this issue and I will call you honest.

### Masking the Private API Key
In any case, an API key associated to my billing account was assigned to use for this website.  Because this key is in plain text, I had to mask it in a seperate PHP file that is not included in this repository for obvious reasons.  Access.php is referred to in [reviews.api.php](https://github.com/castab/veynasWebsite/blob/master/api/reviews.api.php) while preparing the URL.  This protects the API key from coming into view since all of this PHP legwork is done server-side only.

### Suppressing Unecessary API Calls
Because API calls Google are *not* free, I have to supress them from malicious sources.  The PHP script will only fire off a real API call to Google only if the stored JSON payload is too old.  The PHP will return either the stored JSON copy or a fresh copy if the current copy is too old.  If a new JSON payload is obtained, it will also overwrite the old file.

## Optimizing for Loading Speed
The PHP works! But it's much slower than using AngularJS's $http method to GET it.

To keep the security of PHP, the AngularJS service that handles the reviews data will look for the stored JSON payload and check 'staleness.'  MUCH more often than not, the JSON payload will be fresh enough to use at this point.  Otherwise, if the file is either not there or too old, the service will then call the 'API' for a fresh payload by using the $http GET methond on reviews.api.php.

Yes, it's redundant (because both Angular and the PHP script check dates, possibly on the same file too), but it's the only way I can keep inauthentic API calls from firing but **also** keep speed up.  Calling the PHP script takes a lot longer than going to the JSON payload directly, even if there's a little extra logic in date checking on the JavaScript side.
