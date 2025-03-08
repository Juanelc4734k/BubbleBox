<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'bubblebox2');

// API endpoints
define('API_BASE_URL', 'http://localhost:3000');
define('AUTH_API', API_BASE_URL . '/auth');
define('USERS_API', API_BASE_URL . '/users');
define('POSTS_API', API_BASE_URL. '/posts');
define('REACCIONES_API', API_BASE_URL. '/reactions');
define('COMMENTS_API', API_BASE_URL. '/comments');
define('NOTIFICATIONS_API', API_BASE_URL. '/notifications');
define('REELS_API', API_BASE_URL. '/reels');
define('STATS_API', API_BASE_URL. '/stats');
define('BACKUPS_API', API_BASE_URL. '/backups');
define('REPORTS_API', API_BASE_URL. '/reports');
define('COMMUNITIES_API', API_BASE_URL. '/communities');

// Application settings
define('SITE_NAME', 'BubbleBox Dashboard');
// Change this to match your actual URL when using PHP's built-in server
define('BASE_URL', 'http://localhost:9090/');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Token handling
if (isset($_GET['token'])) {
    $_SESSION['admin_token'] = $_GET['token'];
    
    // Decode token to get user information
    $token_parts = explode('.', $_GET['token']);
    if (isset($token_parts[1])) {
        $payload = json_decode(base64_decode(str_replace('_', '/', str_replace('-', '+', $token_parts[1]))), true);
        if ($payload && isset($payload['rol']) && $payload['rol'] === 'administrador') {
            $_SESSION['user_role'] = $payload['rol'];
            $_SESSION['user_id'] = $payload['userId'];
            
            // Fetch user details from API using userId
            $curl = curl_init(API_BASE_URL . '/users/usuario/' . $payload['userId']);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $_GET['token'],
                'Content-Type: application/json'
            ]);
            
            $response = curl_exec($curl);
            $userData = json_decode($response, true);
            curl_close($curl);
            
            if ($userData && is_array($userData) && !empty($userData)) {
                // The API returns an array with the user object as first element
                $user = $userData[0];
                if (isset($user['nombre'])) {
                    $_SESSION['user_name'] = $user['nombre'];
                } elseif (isset($user['username'])) {
                    $_SESSION['user_name'] = $user['username'];
                } else {
                    $_SESSION['user_name'] = 'Admin User';
                }
            } else {
                $_SESSION['user_name'] = 'Admin User';
            }
        }
    }
    
    // Redirect to remove token from URL
    header('Location: ' . BASE_URL);
    exit();
}