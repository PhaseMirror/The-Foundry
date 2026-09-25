<?php
/**
 * Multiplic cPanel Security Proxy
 * 
 * This script acts as a bridge between the frontend and the Gemini API.
 * It ensures that the GEMINI_API_KEY is never exposed to the client.
 */

// 1. Fail-closed: Check for the API key in environment variables
$api_key = getenv('GEMINI_API_KEY');

if (!$api_key) {
    header('HTTP/1.1 500 Internal Server Error');
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Configuration Error',
        'message' => 'GEMINI_API_KEY is not set in the server environment.'
    ]);
    exit;
}

// 2. Simple Origin Validation (Optional but recommended)
// $allowed_origins = ['https://yourdomain.com'];
// if (!isset($_SERVER['HTTP_ORIGIN']) || !in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) { ... }

// 3. Proxy the request to Google AI
$target_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=' . $api_key;

// Capture the incoming JSON request
$input_data = file_get_contents('php://input');

$ch = curl_init($target_url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, $input_data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($input_data)
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Proxy Error', 'message' => curl_error($ch)]);
} else {
    header("HTTP/1.1 $http_code");
    header('Content-Type: application/json');
    echo $response;
}

curl_close($ch);
