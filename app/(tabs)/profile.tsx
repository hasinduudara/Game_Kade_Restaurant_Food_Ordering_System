import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getUserData, logout } from '../../services/auth';
import { uploadProfileImage } from '../../services/userService';
import "../../global.css";

export default function ProfileScreen() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        const data = await getUserData();
        setUser(data);
        setLoading(false);
    };

    // Image Upload Logic
    const pickImage = async () => {
        // Get permission to access media library
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        // Select image
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            handleImageUpload(result.assets[0].uri);
        }
    };

    const handleImageUpload = async (uri: string) => {
        setUploading(true);
        try {
            // Upload image and get download URL
            const downloadUrl = await uploadProfileImage(uri);

            // Update user state with new photoURL
            setUser({ ...user, photoURL: downloadUrl });
            Alert.alert("Success", "Profile Picture Updated!");
        } catch (error) {
            Alert.alert("Error", "Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert("Log Out", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Log Out", style: 'destructive',
                onPress: async () => { await logout(); router.replace('/(auth)/login'); }
            }
        ]);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#D93800" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 px-6">
            <ScrollView showsVerticalScrollIndicator={false}>

                <View className="mt-6 mb-6 items-center">
                    <Text className="text-2xl font-bold text-gray-800 mb-4">My Profile</Text>

                    {/* Profile Image with Click Event */}
                    <TouchableOpacity onPress={pickImage} disabled={uploading} className="relative">
                        <View className="w-28 h-28 bg-gray-200 rounded-full justify-center items-center overflow-hidden border-4 border-white shadow-sm">
                            {uploading ? (
                                <ActivityIndicator color="#D93800" />
                            ) : user?.photoURL ? (
                                <Image source={{ uri: user.photoURL }} className="w-full h-full" />
                            ) : (
                                <Ionicons name="person" size={50} color="gray" />
                            )}
                        </View>
                        <View className="absolute bottom-0 right-0 bg-[#D93800] p-2 rounded-full border-2 border-white">
                            <Ionicons name="camera" size={16} color="white" />
                        </View>
                    </TouchableOpacity>

                    <Text className="text-xl font-bold text-gray-800 mt-3">{user?.fullName || "User"}</Text>
                    <Text className="text-gray-500">{user?.email}</Text>
                </View>

                {/* Placeholder for future features */}
                <View className="mb-6 opacity-50">
                    <Text className="text-gray-400 text-center">Payment & Address settings coming soon...</Text>
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    className="mt-auto mb-10 bg-red-50 p-4 rounded-2xl flex-row justify-center items-center border border-red-100"
                >
                    <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                    <Text className="ml-2 text-[#FF3B30] font-bold text-lg">Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}