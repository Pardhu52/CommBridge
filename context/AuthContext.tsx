    "use client"

    import React, { createContext, useContext, useEffect, useState } from 'react';
    import { onAuthStateChanged, User } from 'firebase/auth';
    import { auth } from '@/lib/firebase';
    import { doc, getDoc } from 'firebase/firestore';
    import { db } from '@/lib/firebase';

    interface AuthContextType {
      user: User | null;
      loading: boolean;
      userData: any | null; // This will hold our Firestore user data
    }

    const AuthContext = createContext<AuthContextType>({ user: null, loading: true, userData: null });

    export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
      const [user, setUser] = useState<User | null>(null);
      const [userData, setUserData] = useState<any | null>(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUser(user);
            // Fetch user data from Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              setUserData(userDocSnap.data());
            }
          } else {
            setUser(null);
            setUserData(null);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      }, []);

      return (
        <AuthContext.Provider value={{ user, loading, userData }}>
          {children}
        </AuthContext.Provider>
      );
    };

    export const useAuth = () => useContext(AuthContext);
    
