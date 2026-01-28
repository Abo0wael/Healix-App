import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { auth, db } from "../../lib/firebase";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface UserData {
  fullName: string;
  email: string;
  age: number | null;
  gender: string;
  phone: string;
  // Health Fields
  isSmoker: boolean | null;
  activityLevel: string;
  sleepHours: string;
  bloodType: string; // Added Blood Type
  hasChronicDiseases: boolean | null;
  chronicDiseasesDetails: string;
  hasSurgeries: boolean | null;
  surgeriesDetails: string;
  underMedicalTreatment: boolean | null;
  hasAllergies: boolean | null;
  allergiesDetails: string;
  hasDepression: boolean | null;
  takingMedications: boolean | null;
  medicationsList: string[];
  lifestyleDescription: string;
}

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Form State
  const [isSmoker, setIsSmoker] = useState<boolean | null>(null);
  const [activityLevel, setActivityLevel] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [bloodType, setBloodType] = useState(""); // Blood Type State

  const [hasChronicDiseases, setHasChronicDiseases] = useState<boolean | null>(null);
  const [chronicDiseasesDetails, setChronicDiseasesDetails] = useState("");

  const [hasSurgeries, setHasSurgeries] = useState<boolean | null>(null);
  const [surgeriesDetails, setSurgeriesDetails] = useState("");

  const [underMedicalTreatment, setUnderMedicalTreatment] = useState<boolean | null>(null);

  const [hasAllergies, setHasAllergies] = useState<boolean | null>(null);
  const [allergiesDetails, setAllergiesDetails] = useState("");

  const [hasDepression, setHasDepression] = useState<boolean | null>(null);

  const [takingMedications, setTakingMedications] = useState<boolean | null>(null);
  const [medicationsList, setMedicationsList] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState("");

  const [lifestyleDescription, setLifestyleDescription] = useState("");

  // Expandable States
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Medication Helper Functions
  const addMedication = () => {
    if (newMedication.trim().length > 0) {
      setMedicationsList([...medicationsList, newMedication.trim()]);
      setNewMedication("");
    }
  };

  const removeMedication = (index: number) => {
    const updatedList = [...medicationsList];
    updatedList.splice(index, 1);
    setMedicationsList(updatedList);
  };

  // Fetch Data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();

          let initialMeds: string[] = [];
          if (Array.isArray(data.medicationsList)) {
            initialMeds = data.medicationsList;
          } else if (data.medicationsDetails && typeof data.medicationsDetails === 'string') {
            initialMeds = data.medicationsDetails.length > 0 ? [data.medicationsDetails] : [];
          }

          setUserData({
            fullName: data.fullName || "User",
            email: currentUser.email || "",
            age: data.age || null,
            gender: data.gender || "Not specified",
            phone: data.phone || "",
            isSmoker: data.isSmoker ?? null,
            activityLevel: data.activityLevel || "",
            sleepHours: data.sleepHours || "",
            bloodType: data.bloodType || "", // Fetch Blood Type
            hasChronicDiseases: data.hasChronicDiseases ?? null,
            chronicDiseasesDetails: data.chronicDiseasesDetails || "",
            hasSurgeries: data.hasSurgeries ?? null,
            surgeriesDetails: data.surgeriesDetails || "",
            underMedicalTreatment: data.underMedicalTreatment ?? null,
            hasAllergies: data.hasAllergies ?? null,
            allergiesDetails: data.allergiesDetails || "",
            hasDepression: data.hasDepression ?? null,
            takingMedications: data.takingMedications ?? null,
            medicationsList: initialMeds,
            lifestyleDescription: data.lifestyleDescription || "",
          });

          // Initialize Form State
          setIsSmoker(data.isSmoker ?? null);
          setActivityLevel(data.activityLevel || "");
          setSleepHours(data.sleepHours || "");
          setBloodType(data.bloodType || "");
          setHasChronicDiseases(data.hasChronicDiseases ?? null);
          setChronicDiseasesDetails(data.chronicDiseasesDetails || "");
          setHasSurgeries(data.hasSurgeries ?? null);
          setSurgeriesDetails(data.surgeriesDetails || "");
          setUnderMedicalTreatment(data.underMedicalTreatment ?? null);
          setHasAllergies(data.hasAllergies ?? null);
          setAllergiesDetails(data.allergiesDetails || "");
          setHasDepression(data.hasDepression ?? null);
          setTakingMedications(data.takingMedications ?? null);
          setMedicationsList(initialMeds);
          setLifestyleDescription(data.lifestyleDescription || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      await updateDoc(doc(db, "users", currentUser.uid), {
        isSmoker,
        activityLevel,
        sleepHours,
        bloodType, // Save Blood Type
        hasChronicDiseases,
        chronicDiseasesDetails,
        hasSurgeries,
        surgeriesDetails,
        underMedicalTreatment,
        hasAllergies,
        allergiesDetails,
        hasDepression,
        takingMedications,
        medicationsList,
        lifestyleDescription,
      });

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#32B5F4" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={['#083D5E', '#062E46']}
        style={styles.background}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Basic Info Header */}
        <View style={styles.headerProfile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userData ? getInitials(userData.fullName) : "U"}</Text>
          </View>
          <Text style={styles.userName}>{userData?.fullName}</Text>
          <Text style={styles.userSubDetails}>
            {userData?.age ? `${userData.age} yrs` : "Age N/A"} • {userData?.gender || "Gender N/A"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Health & Lifestyle</Text>

        {/* 1. Smoking */}
        <AccordionItem
          title="Do you smoke?"
          expanded={expandedSection === 'smoke'}
          onPress={() => toggleSection('smoke')}
        >
          <BooleanSelector value={isSmoker} onChange={setIsSmoker} />
        </AccordionItem>

        {/* 2. Physical Activity */}
        <AccordionItem
          title="Physical activity level:"
          expanded={expandedSection === 'activity'}
          onPress={() => toggleSection('activity')}
        >
          <View style={styles.optionsContainer}>
            {['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.optionChip, activityLevel === opt && styles.optionChipSelected]}
                onPress={() => setActivityLevel(opt)}
              >
                <Text style={[styles.optionText, activityLevel === opt && styles.optionTextSelected]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </AccordionItem>

        {/* 3. Sleep Hours */}
        <AccordionItem
          title="Average sleep hours per day:"
          expanded={expandedSection === 'sleep'}
          onPress={() => toggleSection('sleep')}
        >
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 7-8 hours"
            placeholderTextColor="#90A4AE"
            value={sleepHours}
            onChangeText={setSleepHours}
          />
        </AccordionItem>

        {/* 4. Chronic Diseases */}
        <AccordionItem
          title="Do you have any chronic diseases?"
          expanded={expandedSection === 'chronic'}
          onPress={() => toggleSection('chronic')}
        >
          <BooleanSelector value={hasChronicDiseases} onChange={setHasChronicDiseases} />
          {hasChronicDiseases && (
            <TextInput
              style={[styles.textInput, { marginTop: 15 }]}
              placeholder="Please specify specific diseases..."
              placeholderTextColor="#90A4AE"
              value={chronicDiseasesDetails}
              onChangeText={setChronicDiseasesDetails}
            />
          )}
        </AccordionItem>

        {/* 5. Surgeries */}
        <AccordionItem
          title="Have you had any surgeries before?"
          expanded={expandedSection === 'surgeries'}
          onPress={() => toggleSection('surgeries')}
        >
          <BooleanSelector value={hasSurgeries} onChange={setHasSurgeries} />
          {hasSurgeries && (
            <TextInput
              style={[styles.textInput, { marginTop: 10 }]}
              placeholder="Please specify..."
              placeholderTextColor="#90A4AE"
              value={surgeriesDetails}
              onChangeText={setSurgeriesDetails}
            />
          )}
        </AccordionItem>

        {/* 6. Medical Treatment */}
        <AccordionItem
          title="Are you currently under medical treatment?"
          expanded={expandedSection === 'treatment'}
          onPress={() => toggleSection('treatment')}
        >
          <BooleanSelector value={underMedicalTreatment} onChange={setUnderMedicalTreatment} />
        </AccordionItem>

        {/* 7. Allergies */}
        <AccordionItem
          title="Do you have any allergies?"
          expanded={expandedSection === 'allergies'}
          onPress={() => toggleSection('allergies')}
        >
          <BooleanSelector value={hasAllergies} onChange={setHasAllergies} />
          {hasAllergies && (
            <TextInput
              style={[styles.textInput, { marginTop: 10 }]}
              placeholder="Please specify..."
              placeholderTextColor="#90A4AE"
              value={allergiesDetails}
              onChangeText={setAllergiesDetails}
            />
          )}
        </AccordionItem>

        {/* 8. Depression */}
        <AccordionItem
          title="Do you suffer from depression?"
          expanded={expandedSection === 'depression'}
          onPress={() => toggleSection('depression')}
        >
          <BooleanSelector value={hasDepression} onChange={setHasDepression} />
        </AccordionItem>

        {/* 9. Medications */}
        <AccordionItem
          title="Are you currently taking any medications?"
          subTitle="(If yes, please specify)"
          expanded={expandedSection === 'meds'}
          onPress={() => toggleSection('meds')}
        >
          <BooleanSelector value={takingMedications} onChange={setTakingMedications} />

          {takingMedications && (
            <View style={{ marginTop: 15 }}>
              <View style={styles.addMedRow}>
                <TextInput
                  style={styles.addMedInput}
                  placeholder="Medication name..."
                  placeholderTextColor="#90A4AE"
                  value={newMedication}
                  onChangeText={setNewMedication}
                />
                <TouchableOpacity style={styles.addMedButton} onPress={addMedication}>
                  <Ionicons name="add" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
              {medicationsList.length > 0 && (
                <View style={styles.medListContainer}>
                  {medicationsList.map((med, index) => (
                    <View key={index} style={styles.medItem}>
                      <Text style={styles.medText}>• {med}</Text>
                      <TouchableOpacity onPress={() => removeMedication(index)}>
                        <Ionicons name="trash-outline" size={20} color="#FF5252" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </AccordionItem>

        {/* 10. Blood Type (New Field) */}
        <AccordionItem
          title="Blood Type"
          expanded={expandedSection === 'blood'}
          onPress={() => toggleSection('blood')}
        >
          <View style={styles.optionsContainer}>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.bloodTypeBtn, bloodType === type && styles.bloodTypeBtnSelected]}
                onPress={() => setBloodType(type)}
              >
                <Text style={[styles.bloodTypeText, bloodType === type && styles.bloodTypeTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </AccordionItem>

        {/* 11. Lifestyle */}
        <AccordionItem
          title="What is your lifestyle like?"
          expanded={expandedSection === 'lifestyle'}
          onPress={() => toggleSection('lifestyle')}
        >
          <TextInput
            style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Briefly describe your lifestyle..."
            placeholderTextColor="#90A4AE"
            multiline
            value={lifestyleDescription}
            onChangeText={setLifestyleDescription}
          />
        </AccordionItem>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// Reuseable Components

const AccordionItem = ({ title, subTitle, expanded, onPress, children }: any) => (
  <View style={styles.accordionContainer}>
    <TouchableOpacity style={styles.accordionHeader} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Ionicons name="medical-outline" size={24} color="#FFF" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.accordionTitle}>{title}</Text>
          {subTitle && <Text style={styles.accordionSubtitle}>{subTitle}</Text>}
        </View>
      </View>
      <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#32B5F4" />
    </TouchableOpacity>
    {expanded && (
      <View style={styles.accordionContent}>
        <View style={styles.divider} />
        {children}
      </View>
    )}
  </View>
);

const BooleanSelector = ({ value, onChange }: { value: boolean | null, onChange: (v: boolean) => void }) => (
  <View style={styles.booleanContainer}>
    <TouchableOpacity
      style={[styles.booleanBtn, value === true && styles.booleanBtnSelected]}
      onPress={() => onChange(true)}
    >
      <Text style={[styles.booleanText, value === true && styles.booleanTextSelected]}>Yes</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.booleanBtn, value === false && styles.booleanBtnSelected]}
      onPress={() => onChange(false)}
    >
      <Text style={[styles.booleanText, value === false && styles.booleanTextSelected]}>No</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#083D5E",
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#083D5E",
    justifyContent: "center",
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerProfile: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#32B5F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#0A4A72',
  },
  avatarText: {
    fontSize: 40,
    color: '#FFF',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  userSubDetails: {
    fontSize: 16,
    color: '#B0BEC5',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#32B5F4',
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 10,
  },
  accordionContainer: {
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  accordionTitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  accordionSubtitle: {
    fontSize: 12,
    color: '#B0BEC5',
    marginTop: 4,
  },
  accordionContent: {
    paddingBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 15,
  },
  // Form Elements
  textInput: {
    backgroundColor: '#0A4A72',
    color: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  booleanContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  booleanBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0A4A72',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0A4A72',
  },
  booleanBtnSelected: {
    backgroundColor: '#32B5F4',
    borderColor: '#32B5F4',
  },
  booleanText: {
    color: '#B0BEC5',
    fontWeight: '600',
  },
  booleanTextSelected: {
    color: '#FFF',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#0A4A72',
    borderWidth: 1,
    borderColor: '#0A4A72',
  },
  optionChipSelected: {
    backgroundColor: 'rgba(50, 181, 244, 0.2)',
    borderColor: '#32B5F4',
  },
  optionText: {
    color: '#B0BEC5',
  },
  optionTextSelected: {
    color: '#32B5F4',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#32B5F4',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Dynamic List Styles
  addMedRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  addMedInput: {
    flex: 1,
    backgroundColor: '#0A4A72',
    color: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addMedButton: {
    backgroundColor: '#32B5F4',
    width: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medListContainer: {
    gap: 10,
  },
  medItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#32B5F4',
  },
  medText: {
    color: '#FFF',
    fontSize: 16,
  },
  // Blood Type Chips
  bloodTypeBtn: {
    width: '22%', // 4 per row
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0A4A72',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0A4A72',
    marginBottom: 10,
  },
  bloodTypeBtnSelected: {
    backgroundColor: '#32B5F4',
    borderColor: '#32B5F4',
  },
  bloodTypeText: {
    color: '#B0BEC5',
    fontSize: 18,
    fontWeight: '600',
  },
  bloodTypeTextSelected: {
    color: '#FFF',
  }
});
