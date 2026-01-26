import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { updateAddress } from '../services/userService';
import { useAuth } from '../context/AuthContext';

export default function MapScreen() {
    const { refreshUserData } = useAuth();

    // State Variables
    const [location, setLocation] = useState<any>(null);
    const [address, setAddress] = useState("Locating...");
    const [saving, setSaving] = useState(false);

    // Get User's Current Location on Mount (Default Location: Colombo)
    const [initialRegion, setInitialRegion] = useState({ lat: 6.9271, lng: 79.8612 });
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "Allow location access to find you.");
                setMapReady(true);
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});

            // 1. Set Initial Region for Map Centering
            setInitialRegion({
                lat: currentLocation.coords.latitude,
                lng: currentLocation.coords.longitude
            });

            // 2. Working Location State
            setLocation({
                lat: currentLocation.coords.latitude,
                lng: currentLocation.coords.longitude
            });

            // 3. Search Address from OSM
            fetchAddressFromOSM(currentLocation.coords.latitude, currentLocation.coords.longitude);
            setMapReady(true);
        })();
    }, []);

    // Add User-Agent Header
    const fetchAddressFromOSM = async (lat: number, lng: number) => {
        try {
            setAddress("Checking...");

            // Send Request to OSM Nominatim API
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`,
                {
                    headers: {
                        'User-Agent': 'GameKade-StudentApp/1.0',
                    }
                }
            );

            const data = await response.json();

            if (data && data.display_name) {
                const addObj = data.address;
                // Make a short address
                const shortAddress = `${addObj.road || ''} ${addObj.suburb || ''} ${addObj.city || addObj.town || ''}`;

                // Fill the address state
                setAddress(shortAddress.trim() === '' ? data.display_name.split(',')[0] : shortAddress);
            } else {
                setAddress("Location Found (Name Unavailable)");
            }
        } catch (error) {
            console.log("OSM Error:", error);
            setAddress("Unknown Location");
        }
    };

    // Catch Map Messages
    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'moveEnd') {
                // Update Location State
                setLocation(data.coords);
                fetchAddressFromOSM(data.coords.lat, data.coords.lng);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const handleConfirmLocation = async () => {
        if (!location) {
            Alert.alert("Error", "Please wait for map to load.");
            return;
        }

        setSaving(true);
        try {
            // Save Location to User Profile
            await updateAddress(address, { latitude: location.lat, longitude: location.lng });
            await refreshUserData();
            Alert.alert("Success", "Location Updated!");
            router.back();
        } catch (error) {
            Alert.alert("Error", "Could not save location.");
        } finally {
            setSaving(false);
        }
    };

    // HTML Map Code (Leaflet Map)
    const mapHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { height: 100vh; width: 100vw; }
                .center-marker {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -100%);
                    z-index: 1000;
                    pointer-events: none;
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <div class="center-marker">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#D93800">
                    <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 7 13s7-7.75 7-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                </svg>
            </div>
            <script>
                var map = L.map('map', { zoomControl: false }).setView([${initialRegion.lat}, ${initialRegion.lng}], 16);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(map);

                // Go to user's initial location
                map.on('moveend', function() {
                    var center = map.getCenter();
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'moveEnd',
                        coords: center
                    }));
                });
            </script>
        </body>
        </html>
    `;

    if (!mapReady) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#D93800" />
                <Text className="mt-2 text-gray-500">Getting Location...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <WebView
                source={{ html: mapHTML }}
                style={{ flex: 1 }}
                onMessage={handleMessage}
                scrollEnabled={false}
            />

            <TouchableOpacity onPress={() => router.back()} className="absolute top-12 left-5 bg-white p-3 rounded-full shadow-lg">
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <View className="absolute bottom-0 w-full bg-white rounded-t-3xl p-6 shadow-2xl">
                <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Selected Location</Text>
                <View className="flex-row items-center mb-6">
                    <Ionicons name="map-outline" size={24} color="#D93800" />
                    <Text className="text-xl font-bold text-gray-800 ml-2 flex-1" numberOfLines={2}>
                        {address}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleConfirmLocation}
                    disabled={saving}
                    className="bg-[#D93800] p-4 rounded-2xl items-center flex-row justify-center"
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className="text-white font-bold text-lg mr-2">Confirm Location</Text>
                            <Ionicons name="checkmark-circle" size={24} color="white" />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}