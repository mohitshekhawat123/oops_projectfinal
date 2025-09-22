import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { resolveApiBase } from "../../../lib/api";

export default function PrivacySettings() {
  const [showSkills, setShowSkills] = useState(true);
  const [allowRequests, setAllowRequests] = useState("Anyone");
  const router = useRouter();
  


  const handleDeleteAccount = () => {
    // Use browser confirm dialog for web compatibility
    const confirmed = (globalThis as any).confirm(
      "Delete Account\n\nAre you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost."
    );
    
    if (confirmed) {
      confirmDeleteAccount();
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      // Get user token from storage
      const token = await AsyncStorage.getItem("token");
      const authToken = await AsyncStorage.getItem("authToken");
      
      // Use whichever token exists
      const finalToken = authToken || token;
      
      if (!finalToken) {
        (globalThis as any).alert("Error: Authentication token not found. Please login again.");
        return;
      }

      // Call delete account API
      const apiBase = resolveApiBase();
      
      const response = await fetch(`${apiBase}/api/auth/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${finalToken}`
        }
      });

      if (response.ok) {
        // Clear all stored data
        await AsyncStorage.multiRemove([
          "token", 
          "authToken",
          "userName", 
          "userEmail", 
          "avatarUrl"
        ]);
        
        // Show success message and navigate to login
        (globalThis as any).alert("Account Deleted: Your account has been successfully deleted.");
        
        // Navigate to login page
        router.replace("/login");
      } else {
        const responseText = await response.text();
        let errorMessage = `Failed to delete account. Status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Could not parse error response as JSON
        }
        
        (globalThis as any).alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      (globalThis as any).alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your connection and try again.`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>🔒 Privacy Settings</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Show my skills publicly</Text>
        <Switch value={showSkills} onValueChange={setShowSkills} />
      </View>

      <Text style={styles.subHeader}>Who can send you requests?</Text>
      <TouchableOpacity
        style={[styles.option, allowRequests === "Anyone" && styles.activeOption]}
        onPress={() => setAllowRequests("Anyone")}
      >
        <Text style={styles.optionText}>Anyone</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, allowRequests === "Mutual" && styles.activeOption]}
        onPress={() => setAllowRequests("Mutual")}
      >
        <Text style={styles.optionText}>Mutual matches only</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#ff4d4d" }]}>
        <Text style={styles.buttonText}>Block / Report User</Text>
      </TouchableOpacity>

     
      <TouchableOpacity 
        style={[styles.button, styles.deleteButton]}
        onPress={handleDeleteAccount}
      >
        <Text style={[styles.buttonText, { color: "#fff" }]}>
          🗑️ Delete Account
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", color: "#00e0ff", marginBottom: 20 },
  subHeader: { fontSize: 16, color: "#bbb", marginTop: 20, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  label: { color: "#fff", fontSize: 16 },
  option: { padding: 12, backgroundColor: "#1e1e1e", borderRadius: 8, marginVertical: 5 },
  activeOption: { backgroundColor: "#00e0ff55" },
  optionText: { color: "#fff" },
  button: { marginTop: 20, padding: 12, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  deleteButton: { 
    backgroundColor: "#dc2626", 
    marginTop: 30,
    borderWidth: 2,
    borderColor: "#ef4444"
  },
});
