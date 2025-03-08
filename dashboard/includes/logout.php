<?php
// Start the session to access session variables
session_start();

// Unset all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Redirect to login page after logout
header("Location: http://localhost:5173/login");
exit();
?>
