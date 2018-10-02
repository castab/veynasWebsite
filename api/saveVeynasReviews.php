<?php
header('Content-Type: application/json');
$jsonInput = file_get_contents("php://input");
$fp = fopen('reviews.json', 'w');
$response = new stdClass();
if (fwrite($fp, $jsonInput) === FALSE){
    http_response_code(500);
} else {
    $response->status = "OK";
    http_response_code(200);
    echo json_encode($response);
}
?>