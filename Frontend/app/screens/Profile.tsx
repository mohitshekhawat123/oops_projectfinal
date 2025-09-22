import React, { useEffect, useState } from "react";
import { Alert, FlatList, Image, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FooterBar from "../_components/Footerbar";
import { resolveApiBase } from "../../lib/api";

// Function to get default avatar URL that works across platforms
const getDefaultAvatarUrl = () => {
  if (Platform.OS === 'web') {
    return require("../../assets/images/default-avatar.jpg");
  } else {
    return Image.resolveAssetSource(require("../../assets/images/default-avatar.jpg")).uri;
  }
};

const PROFILE_MENU = [
  { key: "my-profile", label: "My Profile", icon: "person-circle-outline" },
  { key: "enhance-profile", label: "Enhance Profile", icon: "person-add-outline" },
  { key: "add-skills", label: "Add Skills", icon: "construct-outline" },
  { key: "courses", label: "Courses", icon: "school-outline" },
  { key: "credits", label: "Credits", icon: "star-outline" },
  { key: "buy-credits", label: "Buy Credits", icon: "card-outline" },
  { key: "create-avatar", label: "Create Avatar", icon: "color-wand-outline" },
  { key: "referrals", label: "Referrals", icon: "people-outline" },
  { key: "watchlist", label: "Watchlist", icon: "bookmark-outline" },
];

export default function Profile() {
  const [avatarModal, setAvatarModal] = useState(false);
  const [enhanceOpen, setEnhanceOpen] = useState(false);
  const [myProfileOpen, setMyProfileOpen] = useState(false);
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const initialFallback = getDefaultAvatarUrl();
  const [avatarUrl, setAvatarUrl] = useState(initialFallback);
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [dobPickerOpen, setDobPickerOpen] = useState(false);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState(new Date().getMonth());
  const [tempDay, setTempDay] = useState(new Date().getDate());
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      const [yy, mm, dd] = dob.split("-").map((x) => parseInt(x, 10));
      return new Date(yy, mm - 1, dd);
    }
    return new Date(2000, 0, 1);
  });

  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem("avatarUrl");
        if (cached) {
          setAvatarUrl(cached);
          (globalThis as any).__AVATAR_URL__ = cached;
        }
        const cachedName = (globalThis as any).__USER_NAME__ || (await AsyncStorage.getItem("userName"));
        const cachedEmail = (globalThis as any).__USER_EMAIL__ || (await AsyncStorage.getItem("userEmail"));
        if (cachedName) setName(cachedName);
        if (cachedEmail) setEmail(cachedEmail);
      } catch {}
    })();
  }, []);
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{name || "Your Name"}</Text>
          <Text style={styles.email}>{email || "your@email.com"}</Text>
        </View>
      </View>

      <FlatList
        data={PROFILE_MENU}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              if (item.key === "my-profile") setMyProfileOpen(true);
              if (item.key === "create-avatar") setAvatarModal(true);
              if (item.key === "enhance-profile") setEnhanceOpen(true);
            }}
          >
            <Text style={styles.rowLabel}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {/* My Profile Modal */}
      <Modal visible={myProfileOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>My Profile</Text>
            <Text style={styles.modalHint}>Your profile information</Text>

            {/* Profile Info Display */}
            <View style={styles.profileInfoContainer}>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Name:</Text>
                <Text style={styles.profileValue}>{name || "Not set"}</Text>
              </View>
              
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Email:</Text>
                <Text style={styles.profileValue}>{email || "Not set"}</Text>
              </View>
              
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Gender:</Text>
                <Text style={styles.profileValue}>{gender || "Not set"}</Text>
              </View>
              
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Date of Birth:</Text>
                <Text style={styles.profileValue}>{dob || "Not set"}</Text>
              </View>
              
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Role:</Text>
                <Text style={styles.profileValue}>{role || "Not set"}</Text>
              </View>
              
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Phone:</Text>
                <Text style={styles.profileValue}>{phone || "Not set"}</Text>
              </View>
              
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Education:</Text>
                <Text style={styles.profileValue}>{education || "Not set"}</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.btn, pressedButton === 'close-profile' && styles.btnPressed]}
                onPress={() => setMyProfileOpen(false)}
                onPressIn={() => setPressedButton('close-profile')}
                onPressOut={() => setPressedButton(null)}
                activeOpacity={1}
              >
                <Text style={styles.btnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btn, pressedButton === 'edit-profile' && styles.btnPressed]}
                onPress={() => {
                  setMyProfileOpen(false);
                  setEnhanceOpen(true);
                }}
                onPressIn={() => setPressedButton('edit-profile')}
                onPressOut={() => setPressedButton(null)}
                activeOpacity={1}
              >
                <Text style={styles.btnText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={avatarModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Your Avatar</Text>
            <Text style={styles.modalHint}>Pick a photo from your device, then Save</Text>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary, { marginTop: 12, alignSelf: "flex-start" }]}
              onPress={async () => {
                try {
                  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (perm.status !== "granted") return;
                  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
                  if (result.canceled) return;
                  const asset = result.assets?.[0];
                  if (!asset?.uri) return;
                  setPendingAvatarUri(asset.uri);
                  setSourceUrl(asset.uri);
                } catch (e) {
                  Alert.alert("Error", "Upload failed. Check network/API base.");
                }
              }}
            >
              <Text style={[styles.btnText, { color: "#111827" }]}>Choose from Library</Text>
            </TouchableOpacity>

            <View style={styles.previewRow}>
              <View style={styles.previewCol}>
                <Text style={styles.previewLabel}>Your Photo</Text>
                <Image source={{ uri: pendingAvatarUri || avatarUrl }} style={styles.previewImg} />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.btn, pressedButton === 'close-avatar' && styles.btnPressed]}
                onPress={() => setAvatarModal(false)}
                onPressIn={() => setPressedButton('close-avatar')}
                onPressOut={() => setPressedButton(null)}
                activeOpacity={1}
              >
                <Text style={styles.btnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!pendingAvatarUri}
                style={[
                  styles.btn, 
                  !pendingAvatarUri && { opacity: 0.6 },
                  pressedButton === 'save-avatar' && styles.btnPressed
                ]}
                onPressIn={() => pendingAvatarUri && setPressedButton('save-avatar')}
                onPressOut={() => setPressedButton(null)}
                activeOpacity={1}
                onPress={async () => {
                  try {
                    if (!pendingAvatarUri) return;
                    const token = await (await import("@react-native-async-storage/async-storage")).default.getItem("authToken");
                    const form = new FormData();
                    form.append("avatar", {
                      // @ts-ignore
                      uri: pendingAvatarUri,
                      name: "avatar.jpg",
                      type: "image/jpeg",
                    });
                    const base = resolveApiBase();
                    const resp = await fetch(`${base}/api/avatar/upload`, {
                      method: "POST",
                      headers: { Authorization: token ? `Bearer ${token}` : "" },
                      body: form,
                    });
                    let data: any = null;
                    try { data = await resp.json(); } catch {}
                    if (!resp.ok) { Alert.alert("Error", (data && data.message) || `Upload failed (${resp.status})`); return; }
                    if (data?.avatarUrl) {
                      setAvatarUrl(data.avatarUrl);
                      (globalThis as any).__AVATAR_URL__ = data.avatarUrl;
                      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
                      await AsyncStorage.setItem("avatarUrl", data.avatarUrl);
                      setPendingAvatarUri("");
                      setAvatarModal(false);
                    }
                  } catch (e) {
                    Alert.alert("Error", "Upload failed. Check API base and token.");
                  }
                }}
              >
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={enhanceOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enhance Profile</Text>
            <Text style={styles.modalHint}>Add more details to personalize your account</Text>

            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.radioRow}>
              {[
                { key: "male", label: "Male" },
                { key: "female", label: "Female" },
                { key: "other", label: "Other" },
              ].map((opt) => (
                <TouchableOpacity key={opt.key} style={styles.radioItem} onPress={() => setGender(opt.key)}>
                  <View style={[styles.radioOuter, gender === opt.key && styles.radioOuterActive]}>
                    {gender === opt.key && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <TouchableOpacity 
              style={[styles.input, styles.selectButton, { justifyContent:"center" }]} 
              onPress={()=>{
                let init = new Date(2000,0,1); // Default date
                if (dob && typeof dob === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dob)) {
                  try {
                    const [year, month, day] = dob.split('-').map(num => parseInt(num, 10));
                    init = new Date(year, month - 1, day); // month is 0-indexed
                  } catch (error) {
                    console.log('Error parsing date:', error);
                  }
                }
                setSelectedDate(init);
                setDobPickerOpen(true);
              }}
            >
              <Text style={[styles.selectButtonText, { color: dob ? "#111827" : "#6b7280" }]}>
                {dob || "📅 Choose date"}
              </Text>
              <Text style={styles.selectButtonArrow}>▼</Text>
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Role</Text>
            <TouchableOpacity 
              style={[styles.input, styles.selectButton, { justifyContent:"center" }]} 
              onPress={()=>setRolePickerOpen(true)}
            >
              <Text style={[styles.selectButtonText, { color: role ? "#111827" : "#6b7280" }]}>
                {role ? role.charAt(0).toUpperCase() + role.slice(1) : "👤 Select role"}
              </Text>
              <Text style={styles.selectButtonArrow}>▼</Text>
            </TouchableOpacity>
            <TextInput placeholder="Phone Number" placeholderTextColor="#6b7280" style={styles.input} keyboardType="phone-pad" onChangeText={(t)=>setPhone(t)} value={phone} />
            <TextInput placeholder="Education" placeholderTextColor="#6b7280" style={styles.input} onChangeText={(t)=>setEducation(t)} value={education} />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.btn, pressedButton === 'cancel-enhance' && styles.btnPressed]}
                onPress={()=>setEnhanceOpen(false)}
                onPressIn={() => setPressedButton('cancel-enhance')}
                onPressOut={() => setPressedButton(null)}
                activeOpacity={1}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, pressedButton === 'save-enhance' && styles.btnPressed]}
                onPressIn={() => setPressedButton('save-enhance')}
                onPressOut={() => setPressedButton(null)}
                activeOpacity={1}
                onPress={async ()=>{
                  try {
                    const token = await AsyncStorage.getItem("authToken");
                    const base = resolveApiBase();
                    const resp = await fetch(`${base}/api/settings/enhanced`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
                      body: JSON.stringify({ gender, dob, role, phone, education }),
                    });
                    let data: any = null;
                    try { data = await resp.json(); } catch {}
                    if (!resp.ok) { Alert.alert("Error", (data && data.message) || `Failed to save (${resp.status})`); return; }
                    Alert.alert("Success", "Profile updated");
                    setEnhanceOpen(false);
                  } catch (e) {
                    Alert.alert("Error", "Network error. Check API base and firewall.");
                  }
                }}
              >
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DOB Picker Modal for Web/Cross-platform compatibility */}
      <Modal visible={dobPickerOpen} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📅 Select Date of Birth</Text>
            <Text style={styles.modalHint}>Choose your birth date</Text>
            
            {Platform.OS === 'web' ? (
              // Web-compatible date input
              <View style={styles.dateInputContainer}>
                <View style={styles.dateInputWrapper}>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#6b7280"
                    value={dob || ''}
                    onChangeText={(text) => {
                      // Allow only numbers and dashes
                      const cleaned = text.replace(/[^0-9-]/g, '');
                      
                      // Auto-format as user types
                      let formatted = cleaned;
                      if (cleaned.length >= 4 && cleaned.charAt(4) !== '-') {
                        formatted = cleaned.substring(0, 4) + '-' + cleaned.substring(4);
                      }
                      if (cleaned.length >= 7 && cleaned.charAt(7) !== '-') {
                        formatted = formatted.substring(0, 7) + '-' + formatted.substring(7);
                      }
                      if (formatted.length > 10) {
                        formatted = formatted.substring(0, 10);
                      }
                      
                      setDob(formatted);
                    }}
                    maxLength={10}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity 
                    style={styles.datePickerIcon}
                    onPress={() => {
                      // Initialize temp values with current dob or default
                      if (dob && /^\d{4}-\d{2}-\d{2}$/.test(dob)) {
                        const [year, month, day] = dob.split('-').map(Number);
                        setTempYear(year);
                        setTempMonth(month - 1);
                        setTempDay(day);
                      } else {
                        setTempYear(new Date().getFullYear());
                        setTempMonth(new Date().getMonth());
                        setTempDay(new Date().getDate());
                      }
                      setShowCustomDatePicker(true);
                    }}
                  >
                    <Text style={styles.datePickerIconText}>📅</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.dateFormatHint}>Format: YYYY-MM-DD (e.g., 1995-03-15)</Text>
              </View>
            ) : (
              // Mobile DateTimePicker
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="calendar"
                maximumDate={new Date()}
                onChange={(event, date) => {
                  if (!date) return;
                  
                  // Ensure date is not in the future
                  const today = new Date();
                  const selectedDate = date > today ? today : date;
                  
                  // Ensure date is reasonable (not too far in the past)
                  const minDate = new Date(1900, 0, 1);
                  const safeDate = selectedDate < minDate ? minDate : selectedDate;
                  
                  setSelectedDate(safeDate);
                  
                  // Format date as YYYY-MM-DD
                  const year = safeDate.getFullYear();
                  const month = String(safeDate.getMonth() + 1).padStart(2, "0");
                  const day = String(safeDate.getDate()).padStart(2, "0");
                  setDob(`${year}-${month}-${day}`);
                }}
              />
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.btn, pressedButton === 'cancel-date' && styles.btnPressed]}
                onPress={() => setDobPickerOpen(false)}
                onPressIn={() => setPressedButton('cancel-date')}
                onPressOut={() => setPressedButton(null)}
                activeOpacity={1}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btn, pressedButton === 'save-date' && styles.btnPressed]}
                onPress={() => {
                  // Validate date format
                  if (dob && /^\d{4}-\d{2}-\d{2}$/.test(dob)) {
                    const [year, month, day] = dob.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    
                    // Check if it's a valid date
                    if (date.getFullYear() === year && 
                        date.getMonth() === month - 1 && 
                        date.getDate() === day) {
                      setDobPickerOpen(false);
                    } else {
                      (globalThis as any).alert('Please enter a valid date');
                    }
                  } else {
                    (globalThis as any).alert('Please enter date in YYYY-MM-DD format');
                  }
                }}
                onPressIn={() => setPressedButton('save-date')}
                onPressOut={() => setPressedButton(null)}
                activeOpacity={1}
              >
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Role Picker Modal */}
      <Modal visible={rolePickerOpen} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>👤 Select Your Role</Text>
            <Text style={styles.modalHint}>Choose the option that best describes you</Text>
            
            {(["student","professional","other"] as const).map((opt)=> (
              <TouchableOpacity 
                key={opt} 
                style={[
                  styles.roleOption,
                  role === opt && styles.roleOptionSelected
                ]} 
                onPress={()=>{ 
                  setRole(opt); 
                  setRolePickerOpen(false); 
                }}
              >
                <Text style={[
                  styles.roleOptionText,
                  role === opt && styles.roleOptionTextSelected
                ]}>
                  {opt === 'student' && '🎓 '}
                  {opt === 'professional' && '💼 '}
                  {opt === 'other' && '👤 '}
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
                {role === opt && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.btn, pressedButton === 'close-role' && styles.btnPressed]}
                onPress={()=>setRolePickerOpen(false)}
                onPressIn={() => setPressedButton('close-role')}
                onPressOut={() => setPressedButton(null)}
                activeOpacity={1}
              >
                <Text style={styles.btnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Date Picker Modal */}
      <Modal visible={showCustomDatePicker} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.datePickerModal}>
            <Text style={styles.datePickerTitle}>Select Date</Text>
            
            {/* Year Selector */}
            <View style={styles.datePickerSection}>
              <Text style={styles.datePickerLabel}>Year</Text>
              <View style={styles.datePickerRow}>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setTempYear(Math.max(1900, tempYear - 1))}
                >
                  <Text style={styles.datePickerButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerValue}>{tempYear}</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setTempYear(Math.min(2030, tempYear + 1))}
                >
                  <Text style={styles.datePickerButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Month Selector */}
            <View style={styles.datePickerSection}>
              <Text style={styles.datePickerLabel}>Month</Text>
              <View style={styles.datePickerRow}>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setTempMonth((tempMonth + 11) % 12)}
                >
                  <Text style={styles.datePickerButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerValue}>
                  {new Date(tempYear, tempMonth).toLocaleDateString('en-US', { month: 'long' })}
                </Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setTempMonth((tempMonth + 1) % 12)}
                >
                  <Text style={styles.datePickerButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Day Selector */}
            <View style={styles.datePickerSection}>
              <Text style={styles.datePickerLabel}>Day</Text>
              <View style={styles.datePickerRow}>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => {
                    const daysInMonth = new Date(tempYear, tempMonth + 1, 0).getDate();
                    setTempDay(tempDay > 1 ? tempDay - 1 : daysInMonth);
                  }}
                >
                  <Text style={styles.datePickerButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerValue}>{tempDay}</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => {
                    const daysInMonth = new Date(tempYear, tempMonth + 1, 0).getDate();
                    setTempDay(tempDay < daysInMonth ? tempDay + 1 : 1);
                  }}
                >
                  <Text style={styles.datePickerButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Preview */}
            <View style={styles.datePreview}>
              <Text style={styles.datePreviewLabel}>Selected Date:</Text>
              <Text style={styles.datePreviewText}>
                {`${tempYear}-${String(tempMonth + 1).padStart(2, '0')}-${String(tempDay).padStart(2, '0')}`}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.btn, pressedButton === 'cancel-custom-date' && styles.btnPressed]}
                onPress={() => setShowCustomDatePicker(false)}
                onPressIn={() => setPressedButton('cancel-custom-date')}
                onPressOut={() => setPressedButton(null)}
                activeOpacity={1}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btn, pressedButton === 'save-custom-date' && styles.btnPressed]}
                onPress={() => {
                  // Validate and set the date
                  const daysInMonth = new Date(tempYear, tempMonth + 1, 0).getDate();
                  const validDay = Math.min(tempDay, daysInMonth);
                  const formattedDate = `${tempYear}-${String(tempMonth + 1).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
                  setDob(formattedDate);
                  setShowCustomDatePicker(false);
                }}
                onPressIn={() => setPressedButton('save-custom-date')}
                onPressOut={() => setPressedButton(null)}
                activeOpacity={1}
              >
                <Text style={styles.btnText}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FooterBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:"#ffffff" },
  header: { flexDirection:"row", alignItems:"center", padding:16, backgroundColor:"#eef6ff" },
  avatar: { width:60, height:60, borderRadius:30, marginRight:12 },
  name: { fontSize:18, fontWeight:"700", color:"#111827" },
  email: { fontSize:13, color:"#6b7280" },
  separator: { height:1, backgroundColor:"#e5e7eb" },
  row: { paddingVertical:14, paddingHorizontal:8, backgroundColor:"#ffffff" },
  rowLabel: { fontSize:16, color:"#111827" },
  modalBackdrop: { flex:1, backgroundColor:"rgba(0,0,0,0.35)", justifyContent:"flex-end" },
  modalCard: { backgroundColor:"#ffffff", padding:16, borderTopLeftRadius:16, borderTopRightRadius:16 },
  modalTitle: { fontSize:18, fontWeight:"700", color:"#111827" },
  modalHint: { marginTop:4, color:"#6b7280" },
  fieldLabel: { marginTop:12, color:"#374151", fontWeight:"600" },
  input: { marginTop:12, borderWidth:1, borderColor:"#e5e7eb", borderRadius:10, paddingHorizontal:12, height:44, color:"#111827" },
  radioRow: { flexDirection:"row", gap:16, marginTop:10 },
  radioItem: { flexDirection:"row", alignItems:"center", gap:8 },
  radioOuter: { width:18, height:18, borderRadius:9, borderWidth:2, borderColor:"#9ca3af", alignItems:"center", justifyContent:"center" },
  radioOuterActive: { borderColor: "#111827" },
  radioInner: { width:10, height:10, borderRadius:5, backgroundColor:"#111827" },
  radioLabel: { color: "#111827" },
  previewRow: { flexDirection:"row", gap:12, marginTop:14 },
  previewCol: { flex:1 },
  previewLabel: { fontSize:12, color:"#6b7280", marginBottom:6 },
  previewImg: { width:"100%", height:140, borderRadius:10, backgroundColor:"#f3f4f6" },
  modalActions: { flexDirection:"row", justifyContent:"flex-end", gap:12, marginTop:16 },
  btn: { 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    backgroundColor: "#111827",
    cursor: "pointer"
  },
  btnSecondary: { 
    backgroundColor: "#111827" 
  },
  btnPrimary: { 
    backgroundColor: "#111827" 
  },
  btnPressed: {
    backgroundColor: "#374151"
  },
  btnText: { 
    color: "#ffffff", 
    fontWeight: "600", 
    fontSize: 16 
  },
  profileInfoContainer: { marginTop: 16 },
  profileRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: "#e5e7eb" 
  },
  profileLabel: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#374151", 
    flex: 1 
  },
  profileValue: { 
    fontSize: 16, 
    color: "#111827", 
    flex: 2, 
    textAlign: "right" 
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    cursor: "pointer"
  },
  selectButtonText: {
    flex: 1,
    fontSize: 16
  },
  selectButtonArrow: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 8
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent"
  },
  roleOptionSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb"
  },
  roleOptionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500"
  },
  roleOptionTextSelected: {
    color: "#2563eb",
    fontWeight: "600"
  },
  checkMark: {
    fontSize: 18,
    color: "#2563eb",
    fontWeight: "bold"
  },
  dateInputContainer: {
    marginTop: 16,
    marginBottom: 8
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingRight: 50, // Make space for the icon
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#ffffff",
    flex: 1,
  },
  datePickerIcon: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  datePickerIconText: {
    fontSize: 20,
    color: "#6b7280",
  },
  dateFormatHint: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
    fontStyle: "italic"
  },
  datePickerModal: {
    backgroundColor: "#ffffff",
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 24,
  },
  datePickerSection: {
    marginBottom: 20,
  },
  datePickerLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  datePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  datePickerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  datePickerButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
  datePickerValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    minWidth: 120,
    textAlign: "center",
  },
  datePreview: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  datePreviewLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  datePreviewText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
});
