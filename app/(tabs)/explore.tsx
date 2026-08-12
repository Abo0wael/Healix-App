import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { auth, db } from '../../lib/firebase';
import i18n from '../../lib/i18n';
import { useTheme } from '../../lib/ThemeContext';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Types ---

interface Medication {
  name: string;
  type: string;
  frequency: string;
}

interface DocLink {
  title: string;
  url: string;
}

interface UserProfileData {
  // Read-only Header Data
  fullName: string;
  phone: string;
  gender: string; // "Male" | "Female" | "Other"

  // Step 1: Basic
  age: string;
  bloodType: string;
  weight: string;
  height: string;

  // Step 2: History
  chronicDiseases: string[];
  chronicDiseasesOther: string;
  allergies: string[];
  allergiesOther: string;
  isPregnantOrBreastfeeding: string; // "Yes" | "No" | "N/A"
  previousSurgeries: string;
  familyHistory: string[];

  // Step 3: Meds
  isTakingMedications: boolean; // toggle
  medications: Medication[];
  currentTreatments: string[];
  treatmentOther: string;

  // Step 4: Lifestyle
  smokingStatus: string;
  physicalActivity: string;
  sleepHours: string;

  // Step 5: Docs (Links Only)
  documentsLinks: DocLink[];
}

const INITIAL_DATA: UserProfileData = {
  fullName: "Loading...",
  phone: "Loading...",
  gender: "Male",
  age: "25",
  bloodType: "",
  weight: "",
  height: "",
  chronicDiseases: [],
  chronicDiseasesOther: "",
  allergies: [],
  allergiesOther: "",
  isPregnantOrBreastfeeding: "N/A",
  previousSurgeries: "None",
  familyHistory: [],
  isTakingMedications: false,
  medications: [],
  currentTreatments: [],
  treatmentOther: "",
  smokingStatus: "",
  physicalActivity: "",
  sleepHours: "",
  documentsLinks: [],
};

// --- Constants ---

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];
const CHRONIC_OPTIONS = ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Other'];
const ALLERGY_OPTIONS = ['Food Allergy', 'Medication Allergy', 'Seasonal', 'Other'];
const PREGNANT_OPTIONS = ['Yes', 'No', 'Not Applicable'];
const SURGERY_OPTIONS = ['None', 'Last 6 months', '1–2 years ago', 'More than 2 years ago'];
const FAMILY_HISTORY_OPTIONS = ['No significant history', 'Diabetes', 'Heart Disease', 'Cancer'];
const MED_TYPES = ['Prescription', 'Over-the-counter', 'Supplements/Vitamins'];
const MED_FREQUENCIES = ['Once daily', 'Twice daily', 'Multiple times', 'As needed'];
const TREATMENT_OPTIONS = ['Physiotherapy', 'Dialysis', 'Chemotherapy', 'Other'];
const SMOKING_OPTIONS = ['Non-smoker', 'Ex-smoker', 'Occasional', 'Heavy'];
const ACTIVITY_OPTIONS = ['Sedentary', 'Light', 'Moderate', 'Athlete'];
const SLEEP_OPTIONS = ['<5', '5–7', '7–9', '10+'];
const AGES = Array.from({ length: 90 - 18 + 1 }, (_, i) => (i + 18).toString()).concat(['90+']);

// --- Main Component ---

export default function ProfileWizardScreen() {
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState<UserProfileData>(INITIAL_DATA);

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const savedProfile = userData.healthProfile || {};

          setData(prev => ({
            ...prev,
            fullName: userData.fullName || user.displayName || "Patient",
            phone: userData.phone || user.phoneNumber || "No Phone",
            gender: userData.gender || "Not Specified",
            ...savedProfile,
            documentsLinks: savedProfile.documentsLinks || [] // Ensure array exists
          }));
        } else {
          // Document missing - clear default 'Loading...' state
          setData(prev => ({
            ...prev,
            fullName: user.displayName || "Patient",
            phone: user.phoneNumber || "No Phone",
            gender: "Not Specified",
          }));
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNext = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (activeStep < 4) setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user");

      const ageInt = parseInt(data.age, 10);
      if (!data.age || isNaN(ageInt) || ageInt < 1) {
        Alert.alert(i18n.t('profile_wizard.age'), i18n.t('profile_wizard.age_error'));
        return;
      }

      await setDoc(doc(db, 'users', user.uid), {
        healthProfile: {
          ...data,
          age: ageInt
        }
      }, { merge: true });

      Alert.alert(i18n.t('profile_wizard.success'), i18n.t('profile_wizard.profile_saved'));
    } catch (e: any) {
      Alert.alert(i18n.t('error'), e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={isDarkMode ? ['#121212', '#1E1E1E', '#2C2C2C'] : ['#083D5E', '#145A85', '#1D789F']}
        style={styles.background}
      />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {data.fullName ? data.fullName.substring(0, 1).toUpperCase() : "U"}
          </Text>
        </View>
        <View>
          <Text style={styles.headerName}>{data.fullName}</Text>
          <Text style={styles.headerSub}>{data.phone} • {data.gender}</Text>
        </View>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${((activeStep + 1) / 5) * 100}%` }]} />
        </View>
        <Text style={styles.stepText}>{i18n.t('profile_wizard.step_count', { current: activeStep + 1, total: 5 })}</Text>
      </View>

      {/* Main Content Card */}
      <View style={[styles.card, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {activeStep === 0 && <Step1Basic data={data} setData={setData} theme={theme} isDarkMode={isDarkMode} />}
          {activeStep === 1 && <Step2MedicalHistory data={data} setData={setData} theme={theme} isDarkMode={isDarkMode} />}
          {activeStep === 2 && <Step3Medications data={data} setData={setData} theme={theme} isDarkMode={isDarkMode} />}
          {activeStep === 3 && <Step4Lifestyle data={data} setData={setData} theme={theme} isDarkMode={isDarkMode} />}
          {activeStep === 4 && <Step5Documents data={data} setData={setData} theme={theme} isDarkMode={isDarkMode} />}

          {/* Navigation Buttons */}
          <View style={styles.navContainer}>
            {activeStep > 0 ? (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={20} color="#888" style={{ marginRight: 5 }} />
                <Text style={styles.backText}>{i18n.t('profile_wizard.back')}</Text>
              </TouchableOpacity>
            ) : <View />}

            {activeStep < 4 ? (
              <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                <Text style={styles.nextText}>{i18n.t('profile_wizard.next')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveText}>{i18n.t('profile_wizard.save_profile')}</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

// --- Question Card Component ---

const QuestionCard = ({ title, icon, children, subtitle, theme, isDarkMode }: any) => (
  <View style={[styles.questionCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
    <View style={styles.questionHeader}>
      <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
        <Ionicons name={icon} size={18} color="#FFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.questionTitle, { color: theme.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.questionSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.questionContent}>
      {children}
    </View>
  </View>
);

// --- Step Components ---

const Step1Basic = ({ data, setData, theme, isDarkMode }: any) => {
  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>{i18n.t('profile_wizard.step_basic')}</Text>

      <QuestionCard title={i18n.t('profile_wizard.age')} icon="calendar" theme={theme} isDarkMode={isDarkMode}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
          keyboardType="numeric"
          value={data.age}
          onChangeText={(text) => {
            const clean = text.replace(/[^0-9]/g, '');
            setData({ ...data, age: clean });
          }}
          placeholder={i18n.t('profile_wizard.age_placeholder')}
          placeholderTextColor={theme.textSecondary}
          maxLength={3}
        />
        {data.age && !isNaN(parseInt(data.age)) && parseInt(data.age) < 1 && (
          <Text style={{ color: '#FF5252', fontSize: 12, marginTop: 5, marginLeft: 5 }}>
            {i18n.t('profile_wizard.age_error')}
          </Text>
        )}
      </QuestionCard>

      <QuestionCard title={i18n.t('profile_wizard.blood_type')} icon="water" theme={theme} isDarkMode={isDarkMode}>
        <View style={styles.chipContainer}>
          {BLOOD_TYPES.map(type => (
            <SelectionChip
              key={type}
              label={type}
              selected={data.bloodType === type}
              onPress={() => setData({ ...data, bloodType: type })}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>
      </QuestionCard>

      <QuestionCard title={i18n.t('profile_wizard.body_measurements')} icon="body" theme={theme} isDarkMode={isDarkMode}>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{i18n.t('profile_wizard.weight')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              keyboardType="numeric"
              value={data.weight}
              onChangeText={(t) => setData({ ...data, weight: t })}
              placeholder={i18n.t('profile_wizard.weight_placeholder')}
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{i18n.t('profile_wizard.height')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              keyboardType="numeric"
              value={data.height}
              onChangeText={(t) => setData({ ...data, height: t })}
              placeholder={i18n.t('profile_wizard.height_placeholder')}
              placeholderTextColor={theme.textSecondary}
            />
          </View>
        </View>
      </QuestionCard>
    </View>
  );
};

const Step2MedicalHistory = ({ data, setData, theme, isDarkMode }: any) => {
  const toggleSelection = (field: string, item: string) => {
    const list = data[field] as string[];
    if (list.includes(item)) {
      setData({ ...data, [field]: list.filter((i: string) => i !== item) });
    } else {
      if (item === 'None' || item === 'No significant history') {
        setData({ ...data, [field]: [item] }); // Clear others if None
      } else {
        const cleanupList = list.filter(i => i !== 'None' && i !== 'No significant history');
        setData({ ...data, [field]: [...cleanupList, item] });
      }
    }
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>{i18n.t('profile_wizard.step_history')}</Text>

      <QuestionCard title={i18n.t('profile_wizard.chronic_diseases')} icon="medkit" theme={theme} isDarkMode={isDarkMode}>
        <View style={styles.chipContainer}>
          {CHRONIC_OPTIONS.filter(o => o !== 'Other').map(opt => (
            <SelectionChip
              key={opt}
              label={i18n.t('choices.' + opt, { defaultValue: opt })}
              selected={data.chronicDiseases.includes(opt)}
              onPress={() => toggleSelection('chronicDiseases', opt)}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          ))}
          <TouchableOpacity
            style={[styles.customBtn, data.chronicDiseases.includes('Other') && styles.customBtnActive]}
            onPress={() => toggleSelection('chronicDiseases', 'Other')}
          >
            <Ionicons name={data.chronicDiseases.includes('Other') ? "remove" : "add"} size={16} color={data.chronicDiseases.includes('Other') ? "#FFF" : "#32B5F4"} />
            <Text style={[styles.customBtnText, data.chronicDiseases.includes('Other') && styles.customBtnTextActive]}>
              {data.chronicDiseases.includes('Other') ? i18n.t('profile_wizard.remove_custom') : i18n.t('profile_wizard.enter_custom')}
            </Text>
          </TouchableOpacity>
        </View>

        {data.chronicDiseases.includes('Other') && (
          <View style={styles.customInputContainer}>
            <Text style={styles.customInputLabel}>{i18n.t('profile_wizard.specify_condition')}</Text>
            <TextInput
              style={styles.input}
              placeholder={i18n.t('profile_wizard.condition_placeholder')}
              placeholderTextColor="#B0BEC5"
              value={data.chronicDiseasesOther}
              onChangeText={(t) => setData({ ...data, chronicDiseasesOther: t })}
              autoFocus
            />
          </View>
        )}
      </QuestionCard>

      <QuestionCard title={i18n.t('profile_wizard.allergies')} icon="alert-circle" theme={theme} isDarkMode={isDarkMode}>
        <View style={styles.chipContainer}>
          {ALLERGY_OPTIONS.filter(o => o !== 'Other').map(opt => (
            <SelectionChip
              key={opt}
              label={i18n.t('choices.' + opt, { defaultValue: opt })}
              selected={data.allergies.includes(opt)}
              onPress={() => toggleSelection('allergies', opt)}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          ))}
          <TouchableOpacity
            style={[styles.customBtn, data.allergies.includes('Other') && styles.customBtnActive]}
            onPress={() => toggleSelection('allergies', 'Other')}
          >
            <Ionicons name={data.allergies.includes('Other') ? "remove" : "add"} size={16} color={data.allergies.includes('Other') ? "#FFF" : "#32B5F4"} />
            <Text style={[styles.customBtnText, data.allergies.includes('Other') && styles.customBtnTextActive]}>
              {data.allergies.includes('Other') ? i18n.t('profile_wizard.remove_custom') : i18n.t('profile_wizard.enter_custom')}
            </Text>
          </TouchableOpacity>
        </View>

        {data.allergies.includes('Other') && (
          <View style={styles.customInputContainer}>
            <Text style={styles.customInputLabel}>{i18n.t('profile_wizard.specify_allergy')}</Text>
            <TextInput
              style={styles.input}
              placeholder={i18n.t('profile_wizard.allergy_placeholder')}
              placeholderTextColor="#B0BEC5"
              value={data.allergiesOther}
              onChangeText={(t) => setData({ ...data, allergiesOther: t })}
              autoFocus
            />
          </View>
        )}
      </QuestionCard>

      <QuestionCard title={i18n.t('profile_wizard.pregnant_breastfeeding')} icon="female" theme={theme} isDarkMode={isDarkMode}>
        <View style={styles.chipContainer}>
          {PREGNANT_OPTIONS.map(opt => (
            <SelectionChip
              key={opt}
              label={i18n.t('choices.' + opt, { defaultValue: opt })}
              selected={data.isPregnantOrBreastfeeding === opt}
              onPress={() => setData({ ...data, isPregnantOrBreastfeeding: opt })}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>
      </QuestionCard>

      <QuestionCard title={i18n.t('profile_wizard.surgeries')} icon="cut" theme={theme} isDarkMode={isDarkMode}>
        <View style={styles.chipContainer}>
          {SURGERY_OPTIONS.map(opt => (
            <SelectionChip
              key={opt}
              label={i18n.t('choices.' + opt, { defaultValue: opt })}
              selected={data.previousSurgeries === opt}
              onPress={() => setData({ ...data, previousSurgeries: opt })}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>
      </QuestionCard>

      <QuestionCard title={i18n.t('profile_wizard.family_history')} icon="git-network" theme={theme} isDarkMode={isDarkMode}>
        <View style={styles.chipContainer}>
          {FAMILY_HISTORY_OPTIONS.map(opt => (
            <SelectionChip
              key={opt}
              label={i18n.t('choices.' + opt, { defaultValue: opt })}
              selected={data.familyHistory.includes(opt)}
              onPress={() => toggleSelection('familyHistory', opt)}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>
      </QuestionCard>
    </View>
  );
};

const Step3Medications = ({ data, setData, theme, isDarkMode }: any) => {
  const [medName, setMedName] = useState("");
  const [medType, setMedType] = useState(MED_TYPES[0]);
  const [medFreq, setMedFreq] = useState(MED_FREQUENCIES[0]);
  const [showAddForm, setShowAddForm] = useState(false);

  const addMedication = () => {
    if (!medName.trim()) {
      Alert.alert(i18n.t('input_required'), i18n.t('enter_med_name'));
      return;
    }
    const newMed = { name: medName, type: medType, frequency: medFreq };
    setData({ ...data, medications: [...data.medications, newMed] });
    setMedName("");
    setShowAddForm(false);
  };

  const removeMed = (index: number) => {
    const updated = [...data.medications];
    updated.splice(index, 1);
    setData({ ...data, medications: updated });
  };

  const toggleTreatment = (item: string) => {
    const list = data.currentTreatments;
    if (list.includes(item)) {
      setData({ ...data, currentTreatments: list.filter((i: string) => i !== item) });
    } else {
      const cleanList = list.filter((i: string) => i !== 'None');
      setData({ ...data, currentTreatments: [...cleanList, item] });
    }
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>{i18n.t('profile_wizard.step_meds')}</Text>

      <QuestionCard title={i18n.t('profile_wizard.taking_meds_q')} icon="bandage" theme={theme} isDarkMode={isDarkMode}>
        <View style={styles.switchRowExpanded}>
          <Text style={styles.switchLabel}>
            {data.isTakingMedications ? i18n.t('profile_wizard.taking_meds_yes') : i18n.t('profile_wizard.taking_meds_no')}
          </Text>
          <TouchableOpacity
            onPress={() => setData({ ...data, isTakingMedications: !data.isTakingMedications })}
            style={[styles.toggle, data.isTakingMedications ? styles.toggleOn : styles.toggleOff]}
          >
            <View style={[styles.toggleKnob]} />
          </TouchableOpacity>
        </View>

        {data.isTakingMedications && (
          <View style={styles.medsSection}>
            {data.medications.map((m: Medication, i: number) => (
              <View key={i} style={[styles.medCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <View style={[styles.medIcon, { backgroundColor: theme.surface }]} >
                  <Ionicons name="medical" size={16} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.medName, { color: theme.text }]}>{m.name}</Text>
                  <Text style={[styles.medDetails, { color: theme.textSecondary }]}>{i18n.t('choices.' + m.type, { defaultValue: m.type })} • {i18n.t('choices.' + m.frequency, { defaultValue: m.frequency })}</Text>
                </View>
                <TouchableOpacity onPress={() => removeMed(i)}>
                  <Ionicons name="trash-outline" size={20} color="#FF5252" />
                </TouchableOpacity>
              </View>
            ))}

            {!showAddForm ? (
              <TouchableOpacity style={styles.addButton} onPress={() => setShowAddForm(true)}>
                <Ionicons name="add" size={20} color="#FFF" />
                <Text style={styles.addButtonText}>{i18n.t('profile_wizard.add_med')}</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.addForm, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Text style={[styles.formTitle, { color: theme.text }]}>{i18n.t('profile_wizard.add_new_med')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.text }]}
                  placeholder={i18n.t('profile_wizard.med_name_placeholder')}
                  placeholderTextColor={theme.textSecondary}
                  value={medName}
                  onChangeText={setMedName}
                />

                <Text style={[styles.subLabel, { color: theme.textSecondary }]}>{i18n.t('profile_wizard.med_type')}</Text>
                <View style={styles.chipContainer}>
                  {MED_TYPES.map(t => (
                    <SelectionChip key={t} label={i18n.t('choices.' + t, { defaultValue: t })} selected={medType === t} onPress={() => setMedType(t)} small theme={theme} isDarkMode={isDarkMode} />
                  ))}
                </View>

                <Text style={[styles.subLabel, { color: theme.textSecondary }]}>{i18n.t('profile_wizard.med_freq')}</Text>
                <View style={styles.chipContainer}>
                  {MED_FREQUENCIES.map(f => (
                    <SelectionChip key={f} label={i18n.t('choices.' + f, { defaultValue: f })} selected={medFreq === f} onPress={() => setMedFreq(f)} small theme={theme} isDarkMode={isDarkMode} />
                  ))}
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity onPress={() => setShowAddForm(false)} style={styles.cancelButton}>
                    <Text style={[styles.cancelText, { color: theme.textSecondary }]}>{i18n.t('profile_wizard.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={addMedication} style={styles.confirmButton}>
                    <Text style={styles.confirmText}>{i18n.t('profile_wizard.add')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </QuestionCard>

      <QuestionCard title={i18n.t('profile_wizard.current_treatments')} icon="fitness" theme={theme} isDarkMode={isDarkMode}>
        <View style={styles.chipContainer}>
          {TREATMENT_OPTIONS.filter(o => o !== 'Other').map(opt => (
            <SelectionChip
              key={opt}
              label={i18n.t('choices.' + opt, { defaultValue: opt })}
              selected={data.currentTreatments.includes(opt)}
              onPress={() => toggleTreatment(opt)}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          ))}
          <TouchableOpacity
            style={[styles.customBtn, data.currentTreatments.includes('Other') && styles.customBtnActive]}
            onPress={() => toggleTreatment('Other')}
          >
            <Ionicons name={data.currentTreatments.includes('Other') ? "remove" : "add"} size={16} color={data.currentTreatments.includes('Other') ? "#FFF" : "#32B5F4"} />
            <Text style={[styles.customBtnText, data.currentTreatments.includes('Other') && styles.customBtnTextActive]}>
              {data.currentTreatments.includes('Other') ? i18n.t('profile_wizard.remove_custom') : i18n.t('profile_wizard.enter_custom')}
            </Text>
          </TouchableOpacity>
        </View>

        {data.currentTreatments.includes('Other') && (
          <View style={styles.customInputContainer}>
            <Text style={styles.customInputLabel}>{i18n.t('profile_wizard.specify_treatment')}</Text>
            <TextInput
              style={styles.input}
              placeholder={i18n.t('profile_wizard.treatment_placeholder')}
              placeholderTextColor="#B0BEC5"
              value={data.treatmentOther}
              onChangeText={(t) => setData({ ...data, treatmentOther: t })}
              autoFocus
            />
          </View>
        )}
      </QuestionCard>
    </View>
  );
};

const Step4Lifestyle = ({ data, setData, theme, isDarkMode }: any) => {
  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>{i18n.t('profile_wizard.step_lifestyle')}</Text>

      <QuestionCard title={i18n.t('profile_wizard.smoking_status')} icon="flame" theme={theme} isDarkMode={isDarkMode}>
        <View style={styles.chipContainer}>
          {SMOKING_OPTIONS.map(opt => (
            <SelectionChip
              key={opt}
              label={i18n.t('choices.' + opt, { defaultValue: opt })}
              selected={data.smokingStatus === opt}
              onPress={() => setData({ ...data, smokingStatus: opt })}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>
      </QuestionCard>

      <QuestionCard title={i18n.t('profile_wizard.physical_activity')} icon="walk" theme={theme} isDarkMode={isDarkMode}>
        <View style={styles.chipContainer}>
          {ACTIVITY_OPTIONS.map(opt => (
            <SelectionChip
              key={opt}
              label={i18n.t('choices.' + opt, { defaultValue: opt })}
              selected={data.physicalActivity === opt}
              onPress={() => setData({ ...data, physicalActivity: opt })}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>
      </QuestionCard>

      <QuestionCard title={i18n.t('profile_wizard.sleep_hours')} icon="moon" theme={theme} isDarkMode={isDarkMode}>
        <View style={styles.chipContainer}>
          {SLEEP_OPTIONS.map(opt => (
            <SelectionChip
              key={opt}
              label={i18n.t('choices.' + opt, { defaultValue: opt })}
              selected={data.sleepHours === opt}
              onPress={() => setData({ ...data, sleepHours: opt })}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>
      </QuestionCard>
    </View>
  );
};

const Step5Documents = ({ data, setData, theme, isDarkMode }: any) => {
  const [urlInput, setUrlInput] = useState("");

  const addLink = () => {
    if (!urlInput.trim()) {
      return;
    }
    if (!urlInput.toLowerCase().startsWith('http')) {
      Alert.alert(i18n.t('profile_wizard.invalid_url'), i18n.t('profile_wizard.invalid_url_msg'));
      return;
    }

    const newLink: DocLink = {
      title: "Medical Document",
      url: urlInput.trim()
    };

    // Attempt to guess title from URL
    if (urlInput.includes("drive.google.com")) newLink.title = "Google Drive Link";
    if (urlInput.includes("dropbox")) newLink.title = "Dropbox Link";

    setData({ ...data, documentsLinks: [...data.documentsLinks, newLink] });
    setUrlInput("");
  };

  const removeLink = (index: number) => {
    const updated = [...data.documentsLinks];
    updated.splice(index, 1);
    setData({ ...data, documentsLinks: updated });
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>{i18n.t('profile_wizard.step_docs')}</Text>

      <QuestionCard title={i18n.t('profile_wizard.docs_card_title')} icon="cloud-upload" subtitle={i18n.t('profile_wizard.docs_subtitle')} theme={theme} isDarkMode={isDarkMode}>
        <View style={styles.linkInputContainer}>
          <TextInput
            style={[styles.linkInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            placeholder={i18n.t('profile_wizard.paste_link_placeholder')}
            placeholderTextColor={theme.textSecondary}
            value={urlInput}
            onChangeText={setUrlInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.linkAddBtn} onPress={addLink}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.linksList}>
          {data.documentsLinks.map((link: DocLink, i: number) => (
            <View key={i} style={[styles.linkCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
              <View style={[styles.linkIcon, { backgroundColor: theme.surface }]}>
                <Ionicons name="link" size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.linkTitle, { color: theme.primary }]} numberOfLines={1}>{link.url}</Text>
                <Text style={[styles.linkMeta, { color: theme.textSecondary }]}>{link.title}</Text>
              </View>
              <TouchableOpacity onPress={() => removeLink(i)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle-outline" size={24} color="#FF5252" />
              </TouchableOpacity>
            </View>
          ))}
          {data.documentsLinks.length === 0 && (
            <Text style={styles.emptyText}>{i18n.t('profile_wizard.none')}</Text>
          )}
        </View>
      </QuestionCard>
    </View>
  );
};

// --- Shared UI Components ---

const SelectionChip = ({ label, selected, onPress, small, theme, isDarkMode }: any) => (
  <TouchableOpacity
    style={[
      styles.chip,
      { backgroundColor: theme?.background || '#F0F4F8', borderColor: theme?.border || '#E1E8ED' },
      selected && [styles.chipActive, { backgroundColor: theme ? `${theme.primary}15` : 'rgba(50, 181, 244, 0.15)', borderColor: theme?.primary || '#32B5F4' }],
      small && styles.chipSmall
    ]}
    onPress={onPress}
  >
    <Text style={[
      styles.chipText,
      { color: theme?.textSecondary || '#546E7A' },
      selected && [styles.chipTextActive, { color: theme?.primary || '#0277BD' }],
      small && { fontSize: 13 }
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const CustomDropdown = ({ value, options, onSelect, placeholder }: any) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setVisible(true)}>
        <Text style={[styles.dropdownText, !value && { color: '#90A4AE' }]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#90A4AE" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {value === item && <Ionicons name="checkmark" size={20} color="#32B5F4" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#083D5E'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#083D5E'
  },
  background: {
    ...StyleSheet.absoluteFillObject
  },
  topHeader: {
    marginTop: 60,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#32B5F4',
    marginRight: 15
  },
  avatarText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold'
  },
  headerName: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: 'bold'
  },
  headerSub: {
    color: '#B0BEC5',
    fontSize: 14,
    marginTop: 4
  },
  progressContainer: {
    paddingHorizontal: 25,
    marginBottom: 15
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 3,
    marginBottom: 8
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#32B5F4',
    borderRadius: 3
  },
  stepText: {
    color: '#89CFF0',
    fontSize: 12,
    textAlign: 'right'
  },
  card: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Slightly gray for contrast with white cards
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden'
  },
  scrollContent: {
    padding: 25,
    paddingBottom: 50
  },
  stepContainer: {
    gap: 15
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#083D5E',
    marginBottom: 15
  },

  // Question Cards
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)'
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#32B5F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  questionSubtitle: {
    fontSize: 12,
    color: '#90A4AE',
    marginTop: 2
  },
  questionContent: {
    // Content layout
  },

  fieldLabel: {
    fontSize: 14,
    color: '#546E7A',
    fontWeight: '500',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E6EB'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  // Navigation
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600'
  },
  nextButton: {
    backgroundColor: '#32B5F4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    shadowColor: "#32B5F4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4
  },
  nextText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8
  },
  saveButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 4
  },
  saveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },

  // Chips
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F0F4F8',
    borderWidth: 1,
    borderColor: '#E1E8ED'
  },
  chipActive: {
    backgroundColor: 'rgba(50, 181, 244, 0.15)',
    borderColor: '#32B5F4'
  },
  chipText: {
    color: '#546E7A',
    fontWeight: '500',
    fontSize: 14
  },
  chipTextActive: {
    color: '#0277BD',
    fontWeight: '600'
  },
  chipSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  // Dropdown
  dropdownTrigger: {
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E6EB'
  },
  dropdownText: {
    fontSize: 16,
    color: '#333'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '50%'
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  modalItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalItemText: {
    fontSize: 16,
    color: '#333'
  },

  // Toggle
  switchRowExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5
  },
  switchLabel: {
    color: '#546E7A',
    fontSize: 15,
    flex: 1,
    marginRight: 10
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center'
  },
  toggleOn: {
    backgroundColor: '#32B5F4',
    alignItems: 'flex-end',
  },
  toggleOff: {
    backgroundColor: '#CFD8DC',
    alignItems: 'flex-start',
  },
  toggleKnob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },

  // Meds List
  medsSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    paddingTop: 15
  },
  medCard: {
    backgroundColor: '#F7F9FC',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E6EB'
  },
  medIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  medName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
  },
  medDetails: {
    fontSize: 13,
    color: '#78909C',
    marginTop: 2
  },
  addButton: {
    backgroundColor: '#32B5F4',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8
  },
  addForm: {
    backgroundColor: '#FAFAFA',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  formTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 15,
    color: '#333'
  },
  subLabel: {
    fontSize: 12,
    color: '#78909C',
    marginBottom: 8,
    marginTop: 10
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 10
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 15
  },
  cancelText: {
    color: '#78909C'
  },
  confirmButton: {
    backgroundColor: '#32B5F4',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20
  },
  confirmText: {
    color: '#FFF',
    fontWeight: '600'
  },

  // Docs Link
  linkInputContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20
  },
  linkInput: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E6EB'
  },
  linkAddBtn: {
    backgroundColor: '#32B5F4',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  linksList: {
    gap: 10
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E6EB'
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(50, 181, 244, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  linkTitle: {
    fontSize: 14,
    color: '#32B5F4',
    fontWeight: '500',
    marginBottom: 2
  },
  linkMeta: {
    fontSize: 12,
    color: '#90A4AE'
  },
  emptyText: {
    color: '#90A4AE',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic'
  },

  // Custom Input Styles
  customBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#32B5F4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5
  },
  customBtnActive: {
    backgroundColor: '#32B5F4',
  },
  customBtnText: {
    color: '#32B5F4',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6
  },
  customBtnTextActive: {
    color: '#FFF'
  },
  customInputContainer: {
    marginTop: 15,
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  customInputLabel: {
    fontSize: 12,
    color: '#32B5F4',
    marginBottom: 8,
    fontWeight: '600'
  }
});
