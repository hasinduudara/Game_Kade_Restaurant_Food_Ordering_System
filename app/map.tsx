import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapView, { UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { updateAddress } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const DEFAULT_REGION = {
    latitude: 6.9271, longitude: 79.8612,
    latitudeDelta: 0.005, longitudeDelta: 0.005,
};

export default function MapScreen() {
    const { refreshUserData } = useAuth();
    const [region, setRegion] = useState(DEFAULT_REGION);
    const [address, setAddress] = useState("Locating...");
    const [isSaving, setIsSaving] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);

    // Debounce Ref
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "Allow location access.");
                setIsMapReady(true);
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005, longitudeDelta: 0.005,
            });
            fetchAddress(location.coords.latitude, location.coords.longitude);
            setIsMapReady(true);
        })();
    }, []);

    const fetchAddress = async (lat: number, lng: number) => {
        setAddress("Fetching address...");
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`,
                { headers: { 'User-Agent': 'GameKade-App/1.0' } }
            );
            const data = await response.json();
            if (data && data.display_name) {
                const addObj = data.address;
                const shortAddress = `${addObj.road || ''} ${addObj.suburb || ''} ${addObj.city || addObj.town || ''}`;
                setAddress(shortAddress.trim() === '' ? data.display_name.split(',')[0] : shortAddress);
            }
        } catch { setAddress("Location Selected"); }
    };

    const onRegionChangeComplete = (newRegion: any) => {
        setRegion(newRegion);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            fetchAddress(newRegion.latitude, newRegion.longitude);
        }, 800);
    };

    const handleConfirmLocation = async () => {
        setIsSaving(true);
        try {
            await updateAddress(address, { latitude: region.latitude, longitude: region.longitude });
            await refreshUserData();
            Alert.alert("Success", "Location Updated!");
            router.back();
        } catch { Alert.alert("Error", "Could not save location."); }
        finally { setIsSaving(false); }
    };

    if (!isMapReady) return <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator size="large" color="#D93800" /></View>;

    return (
        <View className="flex-1 bg-white">
            <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={region}
                mapType="none" // 🛑 Hide Google Tiles
                showsUserLocation={true}
                showsMyLocationButton={false}
                onRegionChangeComplete={onRegionChangeComplete}
                rotateEnabled={false}
            >
                {/* Esri World Street Map Tiles (No Blocking & Professional Look) */}
                <UrlTile
                    urlTemplate="https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                    maximumZ={19}
                    flipY={false}
                />
            </MapView>

            {/* Center Marker */}
            <View className="absolute top-0 bottom-0 left-0 right-0 justify-center items-center" pointerEvents="none">
                <View className="mb-8"><Ionicons name="location" size={40} color="#D93800" /></View>
            </View>

            {/* Back Button */}
            <TouchableOpacity onPress={() => router.back()} className="absolute top-12 left-5 bg-white p-3 rounded-full shadow-lg z-10">
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            {/* Bottom Card */}
            <View className="absolute bottom-0 w-full bg-white rounded-t-3xl p-6 shadow-2xl pb-10">
                <View className="w-12 h-1 bg-gray-200 rounded-full self-center mb-4" />
                <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Selected Location</Text>
                <View className="flex-row items-center mb-6">
                    <View className="bg-orange-100 p-2 rounded-full mr-3"><Ionicons name="map" size={24} color="#D93800" /></View>
                    <Text className="text-xl font-bold text-gray-800 flex-1" numberOfLines={2}>{address}</Text>
                </View>
                <TouchableOpacity onPress={handleConfirmLocation} disabled={isSaving} className="bg-[#D93800] p-4 rounded-2xl items-center flex-row justify-center shadow-lg">
                    {isSaving ? <ActivityIndicator color="white" /> : <><Text className="text-white font-bold text-lg mr-2">Confirm Location</Text><Ionicons name="checkmark-circle" size={24} color="white" /></>}
                </TouchableOpacity>
            </View>
        </View>
    );
}