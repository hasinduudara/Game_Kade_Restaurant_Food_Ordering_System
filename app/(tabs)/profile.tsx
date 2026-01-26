import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native'; // 1. KeyboardAvoidingView සහ Platform import කළා
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import { logout } from '../../services/auth';
import { uploadProfileImage, updateUserProfile, addCard, removeCard, updateAddress } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import "../../global.css";

export default function ProfileScreen() {
    const { user, refreshUserData } = useAuth();
    const [uploading, setUploading] = useState(false);

    // --- UI Modals States ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);

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
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
            Alert.alert("Error", "Update failed.");
        }
    };

    const handleUpdateAddress = async () => {
        if(!newAddress) return Alert.alert("Error", "Address required");
        try {
            await updateAddress(newAddress);
            await refreshUserData();
            setShowAddressModal(false);
            Alert.alert("Success", "Address Updated!");
        } catch (error) {
            Alert.alert("Error", "Update failed.");
        }
    };

    const openEditModal = () => {
        setNewName(user?.fullName || '');
        setNewPhone(user?.phone || '');
        setNewEmail(user?.email || '');
        setShowEditModal(true);
    };

    const handleLogout = async () => {
        Alert.alert("Log Out", "Are you sure?", [{ text: "Cancel", style: "cancel" }, { text: "Log Out", style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } }]);
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

                {/* Address Section */}
                <View className="mb-6">
                    <Text className="text-gray-800 font-bold text-lg mb-3">Delivery Address</Text>
                    <TouchableOpacity onPress={() => { setNewAddress(user?.address || ''); setShowAddressModal(true); }} className="bg-white p-4 rounded-2xl flex-row items-center shadow-sm border border-gray-100">
                        <View className="bg-orange-100 p-2 rounded-full"><Ionicons name="location" size={24} color="#D93800" /></View>
                        <View className="flex-1 ml-3"><Text className="text-gray-800 font-medium" numberOfLines={1}>{user?.address || "Set Default Location"}</Text><Text className="text-gray-400 text-xs">Tap to edit address</Text></View>
                        <Ionicons name="pencil" size={20} color="gray" />
                    </TouchableOpacity>
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

                <TouchableOpacity onPress={handleLogout} className="mt-auto mb-10 bg-red-50 p-4 rounded-2xl flex-row justify-center items-center border border-red-100">
                    <Ionicons name="log-out-outline" size={20} color="#FF3B30" /><Text className="ml-2 text-[#FF3B30] font-bold text-lg">Log Out</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* ================= MODALS WITH KEYBOARD AVOIDING VIEW ================= */}

            {/* 1. Add Card Modal */}
            <Modal visible={showCardModal} transparent animationType="slide">
                {/* 👇 KeyboardAvoidingView එකතු කළා */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View className="flex-1 justify-end bg-black/60">
                        <View className="bg-white p-6 rounded-t-3xl h-[85%]">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-gray-800">Add New Card</Text>
                                <TouchableOpacity onPress={() => setShowCardModal(false)}><Ionicons name="close" size={24} color="gray" /></TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Preview Card */}
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

                                {/* Inputs */}
                                <Text className="text-gray-600 font-medium mb-2 ml-1">Card Number</Text>
                                <View className="bg-gray-100 rounded-xl mb-4 flex-row items-center px-4 border border-gray-200">
                                    <Ionicons name="card-outline" size={20} color="gray" />
                                    <TextInput className="flex-1 p-4 text-gray-800 font-bold text-lg" value={cardNumber} onChangeText={handleCardNumberChange} keyboardType="numeric" placeholder="0000 0000 0000 0000" maxLength={19} />
                                </View>

                                <Text className="text-gray-600 font-medium mb-2 ml-1">Card Holder Name</Text>
                                <View className="bg-gray-100 rounded-xl mb-4 flex-row items-center px-4 border border-gray-200">
                                    <Ionicons name="person-outline" size={20} color="gray" />
                                    <TextInput className="flex-1 p-4 text-gray-800 font-medium" value={cardName} onChangeText={setCardName} placeholder="Name on Card" />
                                </View>

                                <View className="flex-row gap-4 mb-6">
                                    <View className="flex-1">
                                        <Text className="text-gray-600 font-medium mb-2 ml-1">Expiry Date</Text>
                                        <View className="bg-gray-100 rounded-xl flex-row items-center px-4 border border-gray-200">
                                            <Ionicons name="calendar-outline" size={20} color="gray" />
                                            <TextInput className="flex-1 p-4 text-gray-800 font-medium" value={cardExpiry} onChangeText={handleExpiryChange} keyboardType="numeric" maxLength={5} placeholder="MM/YY" />
                                        </View>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-600 font-medium mb-2 ml-1">CVC / CVV</Text>
                                        <View className="bg-gray-100 rounded-xl flex-row items-center px-4 border border-gray-200">
                                            <Ionicons name="lock-closed-outline" size={20} color="gray" />
                                            <TextInput className="flex-1 p-4 text-gray-800 font-medium" value={cardCVC} onChangeText={setCardCVC} keyboardType="numeric" maxLength={3} secureTextEntry placeholder="123" />
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity onPress={handleAddCard} className="bg-[#1A1F71] p-4 rounded-xl items-center shadow-md mb-20">
                                    <Text className="text-white font-bold text-lg">Add Card Securely</Text>
                                </TouchableOpacity>
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
        </SafeAreaView>
    );
}