import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

// User Data Type Definition
export type UserData = {
    uid: string;
    email: string | null;
    fullName?: string;
    phone?: string;
    photoURL?: string;
    address?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
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
            // Double-check if user is still logged in before fetching
            if (!auth.currentUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUser({ uid, email: auth.currentUser?.email || null, ...docSnap.data() } as UserData);
            } else {
                // Document doesn't exist but user is authenticated
                setUser({ uid, email: auth.currentUser?.email || null } as UserData);
            }
        } catch (e: any) {
            // Handle permission errors gracefully (usually happens during logout)
            if (e?.code === 'permission-denied' || e?.message?.includes('permission')) {
                console.log("Permission denied - user likely logged out");
                setUser(null);
            } else {
                console.error("Error fetching user data:", e);
            }
        } finally {
            setLoading(false);
        }
    };

    // Function to refresh user data
    const refreshUserData = async () => {
        // Only refresh if user is currently logged in
        if (auth.currentUser) {
            try {
                await fetchUserData(auth.currentUser.uid);
            } catch {
                // Silently fail if user is logging out
                console.log("Could not refresh user data");
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, refreshUserData }}>
            {children}
        </AuthContext.Provider>
    );
};