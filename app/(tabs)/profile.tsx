import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';

import { logout } from '../../services/auth';
import { uploadProfileImage, updateUserProfile, addCard, removeCard, updateAddress } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import "../../global.css";

// Default Location (Colombo)
const DEFAULT_LOC = { latitude: 6.927079, longitude: 79.861244 };

export default function ProfileScreen() {
    const { user, refreshUserData } = useAuth();
    const [uploading, setUploading] = useState(false);

    // --- UI Modals States ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // --- Form Data ---
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newAddress, setNewAddress] = useState('');

    // --- Card Data ---
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVC, setCardCVC] = useState('');
    const [cardName, setCardName] = useState('');

    // Screen එකට එන හැම පාරම User Data Refresh කරනවා
    useFocusEffect(
        useCallback(() => {
            refreshUserData();
        }, [])
    );

    // User Location Logic
    const userCoords = {
        latitude: user?.location?.latitude || DEFAULT_LOC.latitude,
        longitude: user?.location?.longitude || DEFAULT_LOC.longitude
    };

    // Image Upload Logic
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions!');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5,
        });
        if (!result.canceled) handleImageUpload(result.assets[0].uri);
    };

    const handleImageUpload = async (uri: string) => {
        setUploading(true);
        try {
            await uploadProfileImage(uri);
            await refreshUserData();
            Alert.alert("Success", "Profile Picture Updated!");
        } catch {
            Alert.alert("Error", "Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    // Formatting Logic
    const handleCardNumberChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        if (cleaned.length <= 16) setCardNumber(formatted);
    };

    const handleExpiryChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        if (cleaned.length >= 2) {
            setCardExpiry(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4));
        } else {
            setCardExpiry(cleaned);
        }
    };

    // Add Card Logic
    const handleAddCard = async () => {
        const cleanNumber = cardNumber.replace(/\s/g, '');

        if (cleanNumber.length < 16) return Alert.alert("Error", "Invalid Card Number");
        if (cardExpiry.length < 5) return Alert.alert("Error", "Invalid Expiry Date");
        if (cardCVC.length < 3) return Alert.alert("Error", "Invalid CVC");

        const newCard = {
            id: Date.now().toString(),
            last4: cleanNumber.slice(-4),
            expiry: cardExpiry,
            type: cleanNumber.startsWith('4') ? "Visa" : "MasterCard"
        };

        try {
            await addCard(newCard);
            await refreshUserData();
            setShowCardModal(false);
            setCardNumber(''); setCardExpiry(''); setCardCVC(''); setCardName('');
            Alert.alert("Success", "Card Added!");
        } catch {
            Alert.alert("Error", "Failed to add card");
        }
    };

    const handleRemoveCard = (card: any) => {
        Alert.alert("Remove Card", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Remove", style: 'destructive', onPress: async () => { await removeCard(card); await refreshUserData(); } }
        ]);
    };

    // Update Logics
    const handleUpdateProfile = async () => {
        if (!newName.trim() || !newEmail.trim()) return Alert.alert("Error", "Name/Email required");
        try {
            await updateUserProfile({ fullName: newName, phone: newPhone, email: newEmail });
            await refreshUserData();
            setShowEditModal(false);
            Alert.alert("Success", "Profile Updated!");
        } catch {
            Alert.alert("Error", "Update failed.");
        }
    };

    const handleUpdateAddress = async () => {
        if(!newAddress) return Alert.alert("Error", "Address required");
        try {
            // Keep existing coords if editing text only
            await updateAddress(newAddress, { latitude: userCoords.latitude, longitude: userCoords.longitude });
            await refreshUserData();
            setShowAddressModal(false);
            Alert.alert("Success", "Address Updated!");
        } catch {
            Alert.alert("Error", "Update failed.");
        }
    };

    const openEditModal = () => {
        setNewName(user?.fullName || '');
        setNewPhone(user?.phone || '');
        setNewEmail(user?.email || '');
        setShowEditModal(true);
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const performLogout = async () => {
        setShowLogoutModal(false);
        await logout();
        router.replace('/(auth)/login');
    };

    if (!user) return <View className="flex-1 justify-center items-center bg-gray-50"><ActivityIndicator size="large" color="#D93800" /></View>;

    return (
        <SafeAreaView className="flex-1 bg-gray-50 px-6">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="mt-6 mb-6 items-center">
                    <Text className="text-2xl font-bold text-gray-800 mb-4">My Profile</Text>
                    <TouchableOpacity onPress={pickImage} disabled={uploading} className="relative">
                        <View className="w-28 h-28 bg-gray-200 rounded-full justify-center items-center overflow-hidden border-4 border-white shadow-sm">
                            {uploading ? <ActivityIndicator color="#D93800" /> : user?.photoURL ? <Image source={{ uri: user.photoURL }} className="w-full h-full" /> : <Ionicons name="person" size={50} color="gray" />}
                        </View>
                        <View className="absolute bottom-0 right-0 bg-[#D93800] p-2 rounded-full border-2 border-white"><Ionicons name="camera" size={16} color="white" /></View>
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 mt-3">{user?.fullName || "User"}</Text>
                    <Text className="text-gray-500">{user?.email}</Text>
                    {user?.phone ? <Text className="text-gray-600 mt-1 font-medium">{user.phone}</Text> : <Text className="text-gray-400 mt-1 text-sm">No phone number</Text>}
                    <TouchableOpacity onPress={openEditModal} className="mt-4 bg-gray-100 px-6 py-2 rounded-full flex-row items-center"><Ionicons name="create-outline" size={18} color="#D93800" /><Text className="ml-2 text-gray-700 font-semibold">Edit Profile</Text></TouchableOpacity>
                </View>

                {/* ADDRESS SECTION WITH MAP PREVIEW */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-gray-800 font-bold text-lg">Delivery Address</Text>
                        <TouchableOpacity onPress={() => setShowAddressModal(true)}>
                            <Text className="text-[#D93800] font-bold text-xs">Edit Text</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Map Card Section */}
                    <View className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200">
                        <View className="h-40 w-full pointer-events-none">
                            <MapView
                                provider={PROVIDER_GOOGLE}
                                style={{ flex: 1 }}
                                mapType="none" // Google Map Tiles හංගනවා
                                region={{
                                    latitude: userCoords.latitude,
                                    longitude: userCoords.longitude,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                pitchEnabled={false}
                                rotateEnabled={false}
                            >
                                {/* 👇 Esri World Street Map Tiles (ගොඩක් Professional සහ Free) */}
                                <UrlTile
                                    urlTemplate="https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                                    maximumZ={19}
                                    flipY={false}
                                />
                                <Marker coordinate={userCoords} pinColor="red" />
                            </MapView>
                        </View>

                        {/* Address Text Section */}
                        <TouchableOpacity
                            onPress={() => router.push('/map')}
                            className="bg-white p-4 flex-row items-center justify-between border-t border-gray-100"
                        >
                            <View className="flex-1 mr-2">
                                <View className="flex-row items-center mb-1">
                                    <Ionicons name="location" size={18} color="#D93800" />
                                    <Text className="text-gray-800 font-bold ml-1 text-base">Current Location</Text>
                                </View>
                                <Text className="text-gray-500 text-sm leading-5" numberOfLines={2}>
                                    {user?.address || "No address set. Tap to select on map."}
                                </Text>
                            </View>
                            <View className="bg-gray-100 p-2 rounded-full">
                                <Ionicons name="map-outline" size={20} color="black" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Payment Methods */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-gray-800 font-bold text-lg">Payment Methods</Text>
                        <TouchableOpacity onPress={() => setShowCardModal(true)}><Text className="text-[#D93800] font-bold text-sm">+ Add Card</Text></TouchableOpacity>
                    </View>
                    {user?.savedCards?.map((card: any, index: number) => (
                        <View key={index} className="bg-white p-4 rounded-2xl mb-3 flex-row items-center shadow-sm border border-gray-100 justify-between">
                            <View className="flex-row items-center">
                                <View className="bg-blue-50 p-2 rounded-lg mr-3"><Ionicons name="card" size={24} color="#1A1F71" /></View>
                                <View><Text className="text-gray-800 font-bold text-base">**** **** **** {card.last4}</Text><Text className="text-gray-400 text-xs">Expires: {card.expiry}</Text></View>
                            </View>
                            <TouchableOpacity onPress={() => handleRemoveCard(card)} className="p-2"><Ionicons name="trash-outline" size={20} color="#FF3B30" /></TouchableOpacity>
                        </View>
                    ))}
                </View>

                <TouchableOpacity onPress={handleLogoutClick} className="mt-auto mb-10 bg-red-50 p-4 rounded-2xl flex-row justify-center items-center border border-red-100">
                    <Ionicons name="log-out-outline" size={20} color="#FF3B30" /><Text className="ml-2 text-[#FF3B30] font-bold text-lg">Log Out</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Modals are unchanged */}
            <Modal visible={showCardModal} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View className="flex-1 justify-end bg-black/60">
                        <View className="bg-white p-6 rounded-t-3xl h-[85%]">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-gray-800">Add New Card</Text>
                                <TouchableOpacity onPress={() => setShowCardModal(false)}><Ionicons name="close" size={24} color="gray" /></TouchableOpacity>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="mb-8 shadow-xl">
                                    <LinearGradient colors={['#1A1F71', '#004e92']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="w-full h-48 rounded-2xl p-6 justify-between">
                                        <View className="flex-row justify-between items-center"><Text className="text-white/80 font-medium tracking-widest">Bank Card</Text><Text className="text-white font-bold italic text-lg">{cardNumber.startsWith('4') ? 'VISA' : 'MasterCard'}</Text></View>
                                        <View>
                                            <Text className="text-white text-2xl font-bold tracking-widest font-mono mb-4">{cardNumber || '0000 0000 0000 0000'}</Text>
                                            <View className="flex-row justify-between">
                                                <View><Text className="text-white/60 text-[10px] uppercase">Card Holder</Text><Text className="text-white font-medium tracking-wide uppercase">{cardName || 'YOUR NAME'}</Text></View>
                                                <View><Text className="text-white/60 text-[10px] uppercase">Expires</Text><Text className="text-white font-medium tracking-wide">{cardExpiry || 'MM/YY'}</Text></View>
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </View>
                                <Text className="text-gray-600 font-medium mb-2 ml-1">Card Number</Text>
                                <View className="bg-gray-100 rounded-xl mb-4 flex-row items-center px-4 border border-gray-200"><Ionicons name="card-outline" size={20} color="gray" /><TextInput className="flex-1 p-4 text-gray-800 font-bold text-lg" value={cardNumber} onChangeText={handleCardNumberChange} keyboardType="numeric" placeholder="0000 0000 0000 0000" maxLength={19} /></View>
                                <Text className="text-gray-600 font-medium mb-2 ml-1">Card Holder Name</Text>
                                <View className="bg-gray-100 rounded-xl mb-4 flex-row items-center px-4 border border-gray-200"><Ionicons name="person-outline" size={20} color="gray" /><TextInput className="flex-1 p-4 text-gray-800 font-medium" value={cardName} onChangeText={setCardName} placeholder="Name on Card" /></View>
                                <View className="flex-row gap-4 mb-6"><View className="flex-1"><Text className="text-gray-600 font-medium mb-2 ml-1">Expiry Date</Text><View className="bg-gray-100 rounded-xl flex-row items-center px-4 border border-gray-200"><Ionicons name="calendar-outline" size={20} color="gray" /><TextInput className="flex-1 p-4 text-gray-800 font-medium" value={cardExpiry} onChangeText={handleExpiryChange} keyboardType="numeric" maxLength={5} placeholder="MM/YY" /></View></View><View className="flex-1"><Text className="text-gray-600 font-medium mb-2 ml-1">CVC / CVV</Text><View className="bg-gray-100 rounded-xl flex-row items-center px-4 border border-gray-200"><Ionicons name="lock-closed-outline" size={20} color="gray" /><TextInput className="flex-1 p-4 text-gray-800 font-medium" value={cardCVC} onChangeText={setCardCVC} keyboardType="numeric" maxLength={3} secureTextEntry placeholder="123" /></View></View></View>
                                <TouchableOpacity onPress={handleAddCard} className="bg-[#1A1F71] p-4 rounded-xl items-center shadow-md mb-20"><Text className="text-white font-bold text-lg">Add Card Securely</Text></TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* 2. Edit Profile Modal */}
            <Modal visible={showEditModal} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-white p-6 rounded-t-3xl">
                            <View className="flex-row justify-between items-center mb-6"><Text className="text-xl font-bold text-gray-800">Edit Profile</Text><TouchableOpacity onPress={() => setShowEditModal(false)}><Ionicons name="close" size={24} color="gray" /></TouchableOpacity></View>
                            <TextInput className="bg-gray-100 p-4 rounded-xl mb-4" value={newName} onChangeText={setNewName} placeholder="Full Name" />
                            <TextInput className="bg-gray-100 p-4 rounded-xl mb-4" value={newEmail} onChangeText={setNewEmail} placeholder="Email" />
                            <TextInput className="bg-gray-100 p-4 rounded-xl mb-6" value={newPhone} onChangeText={setNewPhone} placeholder="Phone" keyboardType="phone-pad" />
                            <TouchableOpacity onPress={handleUpdateProfile} className="bg-[#D93800] p-4 rounded-xl items-center mb-3"><Text className="text-white font-bold text-lg">Save Changes</Text></TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* 3. Edit Address Modal */}
            <Modal visible={showAddressModal} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-white p-6 rounded-t-3xl">
                            <View className="flex-row justify-between items-center mb-6"><Text className="text-xl font-bold text-gray-800">Update Address</Text><TouchableOpacity onPress={() => setShowAddressModal(false)}><Ionicons name="close" size={24} color="gray" /></TouchableOpacity></View>
                            <TextInput className="bg-gray-100 p-4 rounded-xl mb-6" value={newAddress} onChangeText={setNewAddress} placeholder="Enter your address (City, Street)" />
                            <TouchableOpacity onPress={handleUpdateAddress} className="bg-[#D93800] p-4 rounded-xl items-center mb-3"><Text className="text-white font-bold">Save Address</Text></TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Custom Logout Modal */}
            <Modal visible={showLogoutModal} transparent animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/60">
                    <View className="bg-white w-[85%] p-6 rounded-3xl items-center shadow-2xl">
                        <View className="bg-red-100 p-4 rounded-full mb-4">
                            <Ionicons name="log-out" size={40} color="#FF3B30" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-800 mb-2">Log Out?</Text>
                        <Text className="text-gray-500 text-center mb-6">Are you sure you want to log out of your account?</Text>

                        <View className="flex-row gap-4 w-full">
                            <TouchableOpacity onPress={() => setShowLogoutModal(false)} className="flex-1 bg-gray-100 py-3 rounded-xl items-center"><Text className="text-gray-700 font-bold text-lg">Cancel</Text></TouchableOpacity>
                            <TouchableOpacity onPress={performLogout} className="flex-1 bg-[#FF3B30] py-3 rounded-xl items-center"><Text className="text-white font-bold text-lg">Log Out</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}