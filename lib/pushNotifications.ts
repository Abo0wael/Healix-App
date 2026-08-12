import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// ─── 1. Register and Save Push Token ──────────────────────────────────────────
export async function syncPushToken() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Get the Expo Push Token
    // We use a dummy UUID format for local development in Expo Go without an EAS project
    const projectId = "d8c2323e-8c3b-48af-b33d-c1a1662ddb38"; 
    const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId, 
    }).catch((e) => {
        console.log("Fallback token generation...", e);
        return Notifications.getExpoPushTokenAsync({ projectId });
    }); 
    
    const token = tokenData.data;

    // Save it to Firestore
    await updateDoc(doc(db, "users", user.uid), {
      pushToken: token,
      updatedAt: new Date().toISOString(),
    });
    console.log("✅ Push Token Synced:", token);

  } catch (error) {
    console.log("Notice: Push notifications are disabled in this environment (No valid EAS Project ID).", error);
  }
}

// ─── 2. Send Notification to Caregivers ────────────────────────────────────────
export async function notifyCaregivers(title: string, body: string, data: any = {}) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    // 1. Get current user's profile to find caregivers and patient name
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const caregivers: string[] = userData.caregivers || [];
    const patientName = userData.fullName || "Your family member";

    if (caregivers.length === 0) {
      console.log("No caregivers to notify.");
      return;
    }

    // 2. Fetch push tokens for all caregivers
    const tokens: string[] = [];
    for (const cgUid of caregivers) {
      const cgSnap = await getDoc(doc(db, "users", cgUid));
      if (cgSnap.exists() && cgSnap.data().pushToken) {
        tokens.push(cgSnap.data().pushToken);
      }
    }

    if (tokens.length === 0) {
      console.log("No caregivers have push tokens registered.");
      return;
    }

    // 3. Send Push Notifications via Expo's API
    const messages = tokens.map((token) => ({
      to: token,
      sound: 'default',
      title: title.replace('{patientName}', patientName),
      body: body.replace('{patientName}', patientName),
      data: { ...data, patientUid: user.uid },
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    console.log("✅ Notifications sent to caregivers!", await response.json());
    return true;
  } catch (error) {
    console.error("Error sending notifications to caregivers:", error);
    return false;
  }
}
