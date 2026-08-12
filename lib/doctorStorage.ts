import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    runTransaction,
    where
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';

let authInitialized = false;

const ensureAuth = async () => {
    if (authInitialized && auth.currentUser) return;

    await new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            authInitialized = true;
            if (!user) {
                try {
                    await signInAnonymously(auth);
                } catch (e) {
                    console.warn("Anonymous login failed:", e);
                }
            }
            resolve();
        });
    });
};

// Helper for local date string YYYY-MM-DD
export const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    imageUrl: string;
    rating: number;
    yearsOfExperience: number;
    clinicName: string;
    about?: string;
    patientsCount?: number;
    reviewsCount?: number;
    fees?: string | number;
}

export interface DoctorSlot {
    id: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    startTime: string;
    endTime: string;
    isBooked: boolean;
}

export interface Appointment {
    id: string;
    doctorId: string;
    userId: string;
    date: string;
    time: string;
    status: 'booked' | 'cancelled' | 'completed';
    createdAt: string;
}

// Collections
const DOCTORS_COLLECTION = 'doctors';
const APPOINTMENTS_COLLECTION = 'appointments';
const SLOTS_SUBCOLLECTION = 'availableSlots';

/**
 * Fetch all doctors, optionally filtered by specialty
 */
import { normalizeSpecialty } from '../constants/specialties';

// ...

/**
 * Fetch all doctors, optionally filtered by specialty
 */
export const getDoctors = async (specialty?: string): Promise<Doctor[]> => {
    try {
        await ensureAuth();
        // Fetch all doctors to ensure we catch all legacy references via normalization
        // This replaces the previous strict query which broke legacy data connectivity
        const q = collection(db, DOCTORS_COLLECTION);
        const querySnapshot = await getDocs(q);

        const allDoctors = querySnapshot.docs.map(doc => {
            const data = doc.data() as any;
            return {
                id: doc.id,
                ...data
            } as Doctor;
        });

        if (specialty) {
            // Use normalization to match legacy data (e.g. "Cardiologist") to strict ID (e.g. "cardiology")
            return allDoctors.filter(d => normalizeSpecialty(d.specialty) === specialty);
        }

        return allDoctors;
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return [];
    }
};

/**
 * Fetch a single doctor by ID
 */
export const getDoctorById = async (doctorId: string): Promise<Doctor | null> => {
    try {
        await ensureAuth();
        const docRef = doc(db, DOCTORS_COLLECTION, doctorId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as any;
            return { id: docSnap.id, ...data } as Doctor;
        }
        return null;
    } catch (error) {
        console.error('Error fetching doctor:', error);
        return null;
    }
};

/**
 * Generate slots for a doctor for the current day from 08:00 to 20:00 (2-hour duration)
 * Only generates if no slots exist for the date to avoid duplicates.
 */
export const generateDailySlots = async (doctorId: string): Promise<void> => {
    try {
        await ensureAuth();
        const today = getLocalDateString();
        const slotsRef = collection(db, DOCTORS_COLLECTION, doctorId, SLOTS_SUBCOLLECTION);

        // Check if slots already exist for today
        const q = query(slotsRef, where('date', '==', today));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            console.log('Slots already exist for today');
            return;
        }

        // Generate 2-hour slots from 08:00 to 20:00
        const startHour = 8;
        const endHour = 20;
        const duration = 2; // hours

        const slotPromises = [];
        for (let h = startHour; h < endHour; h += duration) {
            const startTime = `${h.toString().padStart(2, '0')}:00`;
            const nextH = h + duration;
            const endTime = `${nextH.toString().padStart(2, '0')}:00`;
            const timeRange = `${startTime} - ${endTime}`;

            slotPromises.push(addDoc(slotsRef, {
                date: today,
                time: timeRange,
                startTime: startTime,
                endTime: endTime,
                isBooked: false,
                bookedBy: null
            }));
        }

        await Promise.all(slotPromises);
        console.log('Slots generated for today');

    } catch (error) {
        console.error('Error generating slots:', error);
    }
};

/**
 * Fetch available slots for a doctor
 */
export const getDoctorSlots = async (doctorId: string): Promise<DoctorSlot[]> => {
    try {
        await ensureAuth();
        const slotsRef = collection(db, DOCTORS_COLLECTION, doctorId, SLOTS_SUBCOLLECTION);
        const q = query(slotsRef, where('isBooked', '==', false));

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data() as any;
            return {
                id: doc.id,
                ...data
            } as DoctorSlot;
        }).sort((a, b) => {
            // Sort by date then time
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });
    } catch (error) {
        console.error('Error fetching slots:', error);
        return [];
    }
};

/**
 * Book an appointment transactionally
 */
export const bookAppointment = async (
    slotId: string,
    doctorId: string,
    date: string,
    time: string,
    patientNote?: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        await ensureAuth();
        const user = auth.currentUser;
        if (!user) return { success: false, error: 'User not authenticated' };

        const slotRef = doc(db, DOCTORS_COLLECTION, doctorId, SLOTS_SUBCOLLECTION, slotId);

        await runTransaction(db, async (transaction) => {
            const slotDoc = await transaction.get(slotRef);

            if (!slotDoc.exists()) {
                throw "Slot does not exist!";
            }

            const slotData = slotDoc.data();
            if (slotData.isBooked) {
                throw "Slot is already booked!";
            }

            // Create appointment document
            const appointmentRef = doc(collection(db, APPOINTMENTS_COLLECTION));
            transaction.set(appointmentRef, {
                doctorId,
                userId: user.uid,
                date,
                time,
                status: 'booked',
                patientNote: patientNote || '',
                createdAt: new Date().toISOString()
            });

            // Update slot status
            transaction.update(slotRef, { isBooked: true });
        });

        return { success: true };
    } catch (e) {
        console.error("Transaction failed: ", e);
        return { success: false, error: typeof e === 'string' ? e : 'Booking failed' };
    }
};
