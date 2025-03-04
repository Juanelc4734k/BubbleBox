<?php
// Function to make API calls
function callAPI($method, $url, $data = false) {
    $curl = curl_init();
    
    // Set appropriate headers including the auth token if available
    $headers = ['Content-Type: application/json'];
    if (isset($_SESSION['admin_token'])) {
        $headers[] = 'Authorization: Bearer ' . $_SESSION['admin_token'];
    }
    
    switch ($method) {
        case "POST":
            curl_setopt($curl, CURLOPT_POST, 1);
            if ($data) {
                curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
            }
            break;
        case "PUT":
            curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PUT");
            if ($data) {
                curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
            }
            break;
        case "DELETE":
            curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
            break;
        default: // GET
            if ($data) {
                $url = sprintf("%s?%s", $url, http_build_query($data));
            }
    }
    
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // For development only
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    
    curl_close($curl);
    
    if ($err) {
        echo "cURL Error: " . $err;
        return null;
    }
    
    return json_decode($response, true);
}

// Function to sanitize input data
function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

// Function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['admin_token']);
}

// Function to redirect
function redirect($url) {
    header("Location: $url");
    exit();
}

// Function to get user details if not already in session
function getUserDetails() {
    if (!isset($_SESSION['user_name']) && isset($_SESSION['user_id']) && isset($_SESSION['admin_token'])) {
        // Direct API call instead of using callAPI function
        $curl = curl_init(API_BASE_URL . '/users/usuario/' . $_SESSION['user_id']);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $_SESSION['admin_token'],
            'Content-Type: application/json'
        ]);
        
        $response = curl_exec($curl);
        $userData = json_decode($response, true);
        curl_close($curl);
        
        // The API returns the user object directly, not in an array
        if ($userData && isset($userData['nombre'])) {
            $_SESSION['user_name'] = $userData['nombre'];
        } elseif ($userData && isset($userData['username'])) {
            $_SESSION['user_name'] = $userData['username'];
        } elseif ($userData && isset($userData['email'])) {
            $_SESSION['user_name'] = explode('@', $userData['email'])[0];
        } else {
            $_SESSION['user_name'] = 'Admin User';
        }
    }
    
    return isset($_SESSION['user_name']) ? $_SESSION['user_name'] : 'Admin User';
}