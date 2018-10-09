<?php
header('Content-Type: application/json');

// Function to figure out the difference between to dates in days (%a)
function dateDifference($date_1 , $date_2 , $differenceFormat = '%a' )
{
    $datetime1 = date_create($date_1);
    $datetime2 = date_create($date_2);
    
    $interval = date_diff($datetime1, $datetime2);
    
    return ($interval->format($differenceFormat));
    
}

// Hit the API for a refreshed JSON payload
function getNewReviews() {
    // prepare request url
    include_once('access.php'); // $apikey and $placeid
    $request_url = 'https://maps.googleapis.com/maps/api/place/details/json?parameters&key=' . $apikey . '&placeid=' . $placeid . '&fields=rating,review';
    // Shoot off the request
    if (($json = @file_get_contents($request_url)) === FALSE) {
        // GET failed
        $errorResponse = new stdClass();
        $errorResponse->status = 'NEW_REQUEST_FAILED';
        http_response_code(500);
        echo json_encode($errorResponse);
    } else {
        // Got a response, check if status is "OK"
        $response = json_decode($json);
        if ($response->{'status'} == "OK") {
            $response->date_stored = date(DATE_RFC2822);
            // Write/update file to reviews.json
            if (saveNewReviews($response)) {
                // Write success
                http_response_code(200);
            } else {
                // Write failed; but this is not complete failure
                // Push message as 202 code
                http_response_code(202);
            }
            // Return new reviews payload
            echo json_encode($response, JSON_UNESCAPED_SLASHES);
        } else {
            // Status is not OK
            // No need to append the status variable since
            // one is already provided with the response by default
            http_response_code(500);
            echo json_encode($response, JSON_UNESCAPED_SLASHES);
        }
    }
}

// Store a payload
// Input is a PHP-native object
function saveNewReviews($newJSON) {
    $newJSON = json_encode($newJSON, JSON_UNESCAPED_SLASHES);
    $fp = fopen('reviews.json', 'w');
    if ( ($fp === false) || (fwrite($fp, $newJSON) === FALSE) ) {
        return FALSE;
    } else {
        return TRUE;
    }
}

// ** Main function ** //
// Try loading the stored JSON payload
if (!($json = @file_get_contents('reviews.json')) === FALSE) {
    // File exists; check for a date
    $response = json_decode($json);
    if (isset($response->{'date_stored'})) {
        // Date exists, check if it's within 30 days
        if (dateDifference($response->{'date_stored'}, date(DATE_RFC2822)) >= 30) {
            // Saved payload is at least 30 days old, get a new copy
            getNewReviews();
        } else {
            // Saved payload is within date range, output as JSON
            $response->days_until_refresh = (30 - dateDifference($response->{'date_stored'}, date(DATE_RFC2822)));
            http_response_code(200);
            echo json_encode($response, JSON_UNESCAPED_SLASHES);
        }
    } else {
        // Date is invalid
        getNewReviews();
    }
} else {
    // File doesn't exist or can't be opened
    getNewReviews();
}

?>