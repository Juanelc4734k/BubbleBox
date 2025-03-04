<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unauthorized - BubbleBox Dashboard</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .error-container {
            text-align: center;
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
        }
        h1 {
            color: #e74c3c;
            margin-bottom: 20px;
        }
        p {
            margin-bottom: 30px;
            font-size: 18px;
        }
        a {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            transition: background-color 0.3s;
        }
        a:hover {
            background-color: #2980b9;
        }
    </style>
    <script>
        // Redirect to React login page after a short delay
        setTimeout(function() {
            window.location.href = "http://localhost:5173/login";
        }, 3000); // 3 second delay before redirect
    </script>
</head>
<body>
    <div class="error-container">
        <h1>Unauthorized Access</h1>
        <p>You do not have permission to access the admin dashboard.</p>
        <p>Redirecting to login page in 3 seconds...</p>
        <a href="http://localhost:5173/login">Go to Login Now</a>
    </div>
</body>
</html>