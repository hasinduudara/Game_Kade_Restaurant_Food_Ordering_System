import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

// User Data Type Definition
type UserData = {
    uid: string;
    email: string | null;
    fullName?: string;
    phone?: string;
    photoURL?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    savedCards?: any[];
};

type AuthContextType = {
    user: UserData | null;
    loading: boolean;
    refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, refreshUserData: async () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                await fetchUserData(firebaseUser.uid);
            } else {
                setUser(null);
                setLoading(false);
            }
        });
        return unsubscribe;
    }, []);

    const fetchUserData = async (uid: string) => {
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUser({ uid, email: auth.currentUser?.email || null, ...docSnap.data() } as UserData);
            }
        } catch (e) {
            console.error("Error fetching user data:", e);
        } finally {
            setLoading(false);
        }
    };

    // Function to refresh user data
    const refreshUserData = async () => {
        if (auth.currentUser) {
            await fetchUserData(auth.currentUser.uid);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, refreshUserData }}>
            {children}
        </AuthContext.Provider>
    );
};