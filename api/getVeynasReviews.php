<?php
include_once('access.php'); // $apikey and $placeid
$request_url = 'https://maps.googleapis.com/maps/api/place/details/json?parameters&key=' . $apikey . '&placeid=' . $placeid . '&fields=rating,review';
$json = file_get_contents($request_url);
$response = json_decode($json);
header('Content-Type: application/json');
echo json_encode($response, JSON_UNESCAPED_SLASHES);
?>