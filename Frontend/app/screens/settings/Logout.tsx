import React, { useState } from "react";
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Logout() {
  const [rememberLogin, setRememberLogin] = useState(true);
  const router = useRouter();

  const handleLogout = async () => {
    // Use browser confirm dialog for logout confirmation
    const confirmed = (globalThis as any).confirm(
      "Logout\n\nAre you sure you want to logout?"
    );
    
    if (confirmed) {
      try {
        // Determine what data to clear based on "Remember login" setting
        const keysToRemove = ["userName", "userEmail", "avatarUrl"];
        
        if (!rememberLogin) {
          // If "Remember login" is OFF, also clear the auth tokens
          keysToRemove.push("token", "authToken");
        }
        
        // Clear selected stored data
        await AsyncStorage.multiRemove(keysToRemove);
        
        // Show success message
        (globalThis as any).alert("Logout Successful: You have been logged out securely.");
        
        // Navigate to login page
        router.replace("/login");
      } catch (error) {
        (globalThis as any).alert(`Logout error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🚪 Logout</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Remember login on this device</Text>
        <Switch value={rememberLogin} onValueChange={setRememberLogin} />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>🚪 Logout Securely</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", color: "#00e0ff", marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  label: { color: "#fff", fontSize: 16 },
  button: { 
    backgroundColor: "#f59e0b", 
    padding: 15, 
    borderRadius: 10, 
    alignItems: "center", 
    marginTop: 30,
    borderWidth: 2,
    borderColor: "#fbbf24"
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
