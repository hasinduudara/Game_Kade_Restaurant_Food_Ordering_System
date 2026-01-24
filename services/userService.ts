import { db, auth } from './firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

// 1. Profile Image Upload Function
export const uploadProfileImage = async (uri: string) => {
    try {
        // Check if user is logged in
        const user = auth.currentUser;
        if (!user) throw new Error("No user logged in");

        const apiKey = process.env.EXPO_PUBLIC_IMGBB_API_KEY;
        if (!apiKey) throw new Error("ImgBB API Key not found");

        console.log("Starting upload to ImgBB...");

        // Create FormData for the image upload
        const formData = new FormData();
        formData.append("image", {
            uri: uri,
            name: "profile.jpg",
            type: "image/jpeg",
        } as any);

        // Send POST request to ImgBB API
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: "POST",
            body: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        const result = await response.json();

        if (result.success) {
            const downloadURL = result.data.url; // Get the image URL
            console.log("Upload Success! URL:", downloadURL);

            // Save the image URL to Firestore under the user's document
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