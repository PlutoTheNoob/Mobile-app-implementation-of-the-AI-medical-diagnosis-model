<?php
// PHP script to handle mobile user registration
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $servername = "mysql-gradahmedrashad.alwaysdata.net"; 
    $username = "405204_grad";
    $password = "123ee123";
    $dbname = "gradahmedrashad_database";

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
    }

    // Get the raw POST data
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    // Check if JSON is valid
    if ($data === null) {
        echo json_encode(["success" => false, "message" => "Invalid JSON data received"]);
        exit();
    }

    // Retrieve form data from the decoded JSON
    $user = isset($data['username']) ? $data['username'] : '';
    $email = isset($data['email']) ? $data['email'] : '';
    $phone = isset($data['phone']) ? $data['phone'] : '';  // Optional field
    $pass = isset($data['password']) ? $data['password'] : '';

    // Check if required fields are set
    if (empty($user) || empty($email) || empty($pass)) {
        echo json_encode(["success" => false, "message" => "All fields are required"]);
        exit();
    }

    // Prepare SQL query to insert user data
    $sql = "INSERT INTO user_info (username, password, email, phone) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    // Bind parameters
    $stmt->bind_param("ssss", $user, $pass, $email, $phone);

    // Execute and check if registration is successful
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Registered successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}

?>
