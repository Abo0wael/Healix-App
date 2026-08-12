import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export function useUserProfile() {
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number | string>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [rawUserData, setRawUserData] = useState<any>(null); // To pass any extra fields

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            const fetchedName = data.fullName || data.name || user.displayName || 'User';
            const fetchedAge = data.age || 0;
            
            setName(fetchedName);
            setAge(fetchedAge);
            setRawUserData(data);
          } else {
            console.log('Document does not exist, creating default...');
            // Create default document as per TASK 4
            const defaultData = {
              name: 'User',
              fullName: 'User',
              age: 0
            };
            await setDoc(userRef, defaultData, { merge: true });
            
            setName(defaultData.name);
            setAge(defaultData.age);
            setRawUserData(defaultData);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setName(user.displayName || 'User');
          setAge(0);
        }
      } else {
        setName('');
        setAge(0);
        setRawUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { name, age, loading, rawUserData };
}
