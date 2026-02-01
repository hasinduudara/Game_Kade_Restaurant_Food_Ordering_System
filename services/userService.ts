import { db, auth } from './firebaseConfig';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

// 1. Profile Image Upload Function (ImgBB)
export const uploadProfileImage = async (uri: string) => {
    try {
        // Check if user is logged in
        const user = auth.currentUser;
        if (!user) throw new Error("No user logged in");

        // Get ImgBB API Key from environment variables
        const apiKey = process.env.EXPO_PUBLIC_IMGBB_API_KEY;
        if (!apiKey) throw new Error("ImgBB API Key not found");

        console.log("Starting upload to ImgBB...");

        // Create FormData for the image
        const formData = new FormData();
        formData.append("image", {
            uri: uri,
            name: "profile.jpg",
            type: "image/jpeg",
        } as any);

        // Send POST request to ImgBB
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: "POST",
            body: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        const result = await response.json();

        if (result.success) {
            const downloadURL = result.data.url; // ImgBB Download URL
            console.log("Upload Success! URL:", downloadURL);

            // Update user's photoURL in Firestore
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                photoURL: downloadURL
            });

            return downloadURL;
        } else {
            console.error("ImgBB Error:", result);
            throw new Error("ImgBB Upload Failed");
        }

    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};

// 2. User Profile Update Function (Name, Phone, Email)
export const updateUserProfile = async (data: { fullName?: string; phone?: string; email?: string }) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("No user logged in");

        const userDocRef = doc(db, "users", user.uid);

        // Update user profile data in Firestore
        await updateDoc(userDocRef, data);

        console.log("Profile updated successfully!");
        return true;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

// 3. Add Payment Card Function
export const addCard = async (cardData: any) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("No user logged in");

        const userDocRef = doc(db, "users", user.uid);

        // First, check if user document exists and has savedCards field
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();

            // If savedCards doesn't exist or is not an array, initialize it
            if (!userData.savedCards || !Array.isArray(userData.savedCards)) {
                await updateDoc(userDocRef, {
                    savedCards: [cardData]
                });
            } else {
                // Add Card to Cards Array (using arrayUnion)
                await updateDoc(userDocRef, {
                    savedCards: arrayUnion(cardData)
                });
            }
        } else {
            throw new Error("User document not found");
        }

        console.log("Card added successfully");
        return true;
    } catch (error) {
        console.error("Error adding card:", error);
        throw error;
    }
};

// 4. Remove Payment Card Function
export const removeCard = async (cardData: any) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("No user logged in");

        const userDocRef = doc(db, "users", user.uid);

        // Remove Card from Cards Array (using arrayRemove)
        await updateDoc(userDocRef, {
            savedCards: arrayRemove(cardData)
        });
        return true;
    } catch (error) {
        console.error("Error removing card:", error);
        throw error;
    }
};

// 5. Update Address Function
export const updateAddress = async (address: string, coords: { latitude: number; longitude: number }) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("No user logged in");

        const userDocRef = doc(db, "users", user.uid);

        await updateDoc(userDocRef, {
            address: address,
            location: coords // අලුතින් Coordinates සේව් කරනවා
        });
        return true;
    } catch (error) {
        console.error("Error updating address:", error);
        throw error;
    }
};