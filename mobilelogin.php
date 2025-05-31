<?php
header("Content-Type: application/json");

$servername = "mysql-gradahmedrashad.alwaysdata.net";
$username = "405204_grad";
$password = "123ee123";
$dbname = "gradahmedrashad_database";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);
if (!isset($input['username']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing username or password."]);
    exit();
}

$user = $input['username'];
$pass = $input['password'];

$sql = "SELECT * FROM user_info WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $row = $result->fetch_assoc();
    if ($pass === $row['password']) { 
        echo json_encode(["success" => true, "message" => "Login successful."]);
    } else {
        echo json_encode(["success" => false, "message" => "Incorrect password."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "User not found."]);
}

$stmt->close();
$conn->close();
