import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://cf26-154-180-71-158.ngrok-free.app/mobilelogin.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Server did not return JSON:", text);
        throw new Error("Invalid response format from server.");
      }

      if (data.success) {
        setIsLoggedIn(true);
        Alert.alert("Success", data.message || "Logged in successfully!");
      } else {
        Alert.alert("Error", data.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert("Error", "Login request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://cf26-154-180-71-158.ngrok-free.app/mobileregister.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, phone, password }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Success", data.message || "Registered successfully!");
        setIsRegistering(false);
      } else {
        Alert.alert("Error", data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      Alert.alert("Error", "Registration request failed.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;
      setImageUri(pickedUri);
      uploadImage(pickedUri);
    }
  };

  const uploadImage = async (uri) => {
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'image.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await fetch("https://2fad-154-180-71-158.ngrok-free.app/predict/", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();
      setResult(data.output);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!isLoggedIn ? (
        <View style={styles.loginContainer}>
          {isRegistering ? (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone (Optional)"
                value={phone}
                onChangeText={setPhone}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
              {loading && <ActivityIndicator size="large" color="#0000ff" />}
              <TouchableOpacity onPress={() => setIsRegistering(false)} style={styles.linkButton}>
                <Text style={styles.linkText}>Already have an account? Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              {loading && <ActivityIndicator size="large" color="#0000ff" />}
              <TouchableOpacity onPress={() => setIsRegistering(true)} style={styles.linkButton}>
                <Text style={styles.linkText}>Don't have an account? Register</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View>
          <Button title="Pick Image" onPress={pickImage} />
          {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
          {loading && <ActivityIndicator size="large" color="#0000ff" />}
          {result && <Text style={styles.resultText}>Prediction: {result}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loginContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  linkButton: {
    marginTop: 10,
  },
  linkText: {
    color: '#007bff',
    fontSize: 14,
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    resizeMode: 'cover',
  },
  resultText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
