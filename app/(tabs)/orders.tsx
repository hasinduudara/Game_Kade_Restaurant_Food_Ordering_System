import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Modal, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

import { useCart } from '../../context/CartContext';
import { useOrders, Order } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';

// Restaurant Location (Static)
const RESTAURANT_LOC = { latitude: 6.927079, longitude: 79.861244 };
const DEFAULT_LOC = { latitude: 6.9000, longitude: 79.8500 };

export default function OrdersScreen() {
    const params = useLocalSearchParams();
    const { user, refreshUserData } = useAuth();
    const { items, getTotalPrice, clearCart } = useCart();
    const { orders, activeOrder, setActiveOrder, addOrderToHistory, loadingOrders } = useOrders();

    // View Modes
    const [viewMode, setViewMode] = useState<'history' | 'summary' | 'details' | 'tracking'>('history');

    // Form States (Initial values from User Profile)
    const [tempName, setTempName] = useState(user?.fullName || '');
    const [tempPhone, setTempPhone] = useState(user?.phone || '');
    const [tempAddress, setTempAddress] = useState(user?.address || '');

    // Location Picker States
    const [showMapPicker, setShowMapPicker] = useState(false);

    // 👇 1. මුලින්ම User ගේ Saved Location එක දාගන්නවා (නැත්නම් Default එක)
    const [selectedCoords, setSelectedCoords] = useState(
        user?.location && user.location.latitude
            ? { latitude: user.location.latitude, longitude: user.location.longitude }
            : DEFAULT_LOC
    );

    const [loadingLocation, setLoadingLocation] = useState(false);

    // Modal States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingStar, setRatingStar] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCard, setSelectedCard] = useState<any>(null);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({
        visible: false, title: "", message: "", onClose: () => {}
    });

    // Tracking States
    const [orderStatus, setOrderStatus] = useState("Preparing");
    const [riderLoc, setRiderLoc] = useState(RESTAURANT_LOC);

    useEffect(() => {
        if (user) {
            setTempName(user.fullName || '');
            setTempPhone(user.phone || '');
            setTempAddress(user.address || '');

            // User ට Saved Location එකක් තියෙනවා නම් ඒක Select කරනවා
            if (user.location && user.location.latitude && user.location.longitude) {
                setSelectedCoords({
                    latitude: user.location.latitude,
                    longitude: user.location.longitude
                });
            }
        }
    }, [user]);

    // Refresh user data when screen is focused (to load saved cards)
    useFocusEffect(
        useCallback(() => {
            refreshUserData();
        }, [refreshUserData])
    );

    // --- USE EFFECT ---
    useEffect(() => {
        if (activeOrder) {
            setViewMode('tracking');
            if(activeOrder.deliveryDetails?.coordinates) {
                setSelectedCoords(activeOrder.deliveryDetails.coordinates);
            }
        } else if (params.view === 'checkout' && items.length > 0) {
            setViewMode((prev) => (prev === 'details' ? 'details' : 'summary'));
        } else {
            setViewMode('history');
        }
    }, [params.view, activeOrder, items.length]);

    // --- HELPER: Custom Alert ---
    const showCustomAlert = (title: string, message: string, callback?: () => void) => {
        setAlertConfig({
            visible: true, title, message,
            onClose: () => {
                setAlertConfig(prev => ({ ...prev, visible: false }));
                if (callback) callback();
            }
        });
    };

    const renderCustomAlert = () => (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
            <View className="flex-1 justify-center items-center bg-black/60">
                <View className="bg-white w-[85%] p-6 rounded-3xl items-center shadow-2xl">
                    <View className="bg-green-100 p-4 rounded-full mb-4"><Ionicons name="checkmark-circle" size={50} color="#22c55e" /></View>
                    <Text className="text-2xl font-bold text-gray-800 mb-2">{alertConfig.title}</Text>
                    <Text className="text-gray-500 text-center mb-6">{alertConfig.message}</Text>
                    <TouchableOpacity onPress={alertConfig.onClose} className="bg-black w-full py-3 rounded-xl items-center">
                        <Text className="text-white font-bold text-lg">OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // GET CURRENT LOCATION FUNCTION
    const getUserLocation = async () => {
        setLoadingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to select delivery point.');
                setLoadingLocation(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const currentCoords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            };

            setSelectedCoords(currentCoords);

        } catch (error) {
            Alert.alert("Error", "Could not get current location.");
        } finally {
            setLoadingLocation(false);
        }
    };

    // OPEN MAP & GET LOCATION
    const openMapPicker = () => {
        setShowMapPicker(true);
        // Map එක Open කරනකොටම Current Location ඉල්ලන්නේ නෑ (User කැමති නම් button එක ඔබයි)
        // getUserLocation();
    };

    // --- HANDLERS ---
    const handleMapPress = (e: any) => {
        const coords = e.nativeEvent.coordinate;
        setSelectedCoords(coords);
    };

    const handleCancel = () => {
        router.push('/(tabs)/cart');
        setViewMode('history');
    };

    const handlePayment = (method: string) => {
        setShowPaymentModal(false);

        const paymentInfo = method === 'Cash On Delivery'
            ? 'Cash On Delivery'
            : selectedCard
                ? `Card ending in ${selectedCard.lastFourDigits}`
                : method;

        showCustomAlert("Order Placed!", `Paid via ${paymentInfo}. Waiting for restaurant confirmation.`, () => {
            const newOrder: Order = {
                id: Math.random().toString(36).substr(2, 9).toUpperCase(),
                items: [...items],
                total: getTotalPrice(),
                date: new Date().toLocaleString(),
                status: 'Preparing',
                deliveryDetails: {
                    name: tempName,
                    phone: tempPhone,
                    address: tempAddress,
                    paymentMethod: paymentInfo,
                    coordinates: selectedCoords
                }
            };

            setActiveOrder(newOrder);
            clearCart();
            setViewMode('tracking');
            startOrderSimulation(newOrder.deliveryDetails?.coordinates || DEFAULT_LOC);
        });
    };

    const startOrderSimulation = (targetLoc: any) => {
        setOrderStatus("Preparing");
        setRiderLoc(RESTAURANT_LOC);

        setTimeout(() => {
            showCustomAlert("Order Ready!", "Your food is ready! The rider is picking it up.", () => {
                setOrderStatus("Delivering");
                startRiderMovement(targetLoc);
            });
        }, 10000);
    };

    const startRiderMovement = (targetLoc: any) => {
        let steps = 0;
        const maxSteps = 40;
        const interval = setInterval(() => {
            steps++;
            const lat = RESTAURANT_LOC.latitude + (targetLoc.latitude - RESTAURANT_LOC.latitude) * (steps / maxSteps);
            const lng = RESTAURANT_LOC.longitude + (targetLoc.longitude - RESTAURANT_LOC.longitude) * (steps / maxSteps);
            setRiderLoc({ latitude: lat, longitude: lng });

            if (steps >= maxSteps) {
                clearInterval(interval);
                setOrderStatus("Completed");
                setShowRatingModal(true);
            }
        }, 200);
    };

    const submitRating = async () => {
        if (activeOrder) {
            setIsSubmitting(true);
            await addOrderToHistory({ ...activeOrder, status: 'Completed' });
            setIsSubmitting(false);
            setActiveOrder(null);
        }
        setShowRatingModal(false);
        setRatingStar(0);
        router.push('/(tabs)/home');
    };

    // --- VIEWS ---

    // SUMMARY VIEW
    if (viewMode === 'summary') {
        return (
            <View className="flex-1 bg-white pt-12 px-6">
                <Text className="text-2xl font-bold text-gray-800 mb-6">Order Summary</Text>
                <ScrollView className="flex-1 mb-24" showsVerticalScrollIndicator={false}>
                    {items.map((item) => (
                        <View key={item.id} className="flex-row justify-between mb-4 border-b border-gray-100 pb-2">
                            <Text className="text-gray-600 flex-1">{item.quantity} x {item.name}</Text>
                            <Text className="font-bold">Rs. {(parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity).toFixed(0)}</Text>
                        </View>
                    ))}
                    <View className="flex-row justify-between mt-4 border-t border-gray-200 pt-4">
                        <Text className="text-xl font-bold">Total</Text>
                        <Text className="text-xl font-extrabold text-[#D93800]">Rs. {getTotalPrice().toFixed(0)}</Text>
                    </View>
                </ScrollView>
                <View className="absolute bottom-6 left-6 right-6 gap-3 bg-white pt-2">
                    <TouchableOpacity onPress={() => setViewMode('details')} className="bg-black py-4 rounded-xl items-center shadow-lg">
                        <Text className="text-white font-bold text-lg">Order Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCancel} className="bg-gray-100 py-4 rounded-xl items-center">
                        <Text className="text-gray-700 font-bold text-lg">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // DETAILS VIEW
    if (viewMode === 'details') {
        return (
            <View className="flex-1 bg-white pt-12 px-6">
                <Text className="text-2xl font-bold text-gray-800 mb-6">Delivery Details</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text className="text-gray-500 mb-1 font-medium">Contact Name</Text>
                    <TextInput value={tempName} onChangeText={setTempName} className="bg-gray-100 p-4 rounded-xl mb-4 text-lg text-gray-800" />

                    <Text className="text-gray-500 mb-1 font-medium">Phone Number</Text>
                    <TextInput value={tempPhone} onChangeText={setTempPhone} keyboardType="phone-pad" className="bg-gray-100 p-4 rounded-xl mb-4 text-lg text-gray-800" />

                    <Text className="text-gray-500 mb-1 font-medium">Delivery Address</Text>
                    <View className="flex-row gap-2 mb-6">
                        <View className="bg-gray-100 p-4 rounded-xl flex-1 flex-row items-center">
                            <Ionicons name="location" size={24} color="#D93800" />
                            <TextInput value={tempAddress} onChangeText={setTempAddress} className="flex-1 ml-2 text-lg text-gray-800" multiline placeholder="Type address or pick on map ->" />
                        </View>
                        {/* Button to Open Map Picker */}
                        <TouchableOpacity onPress={openMapPicker} className="bg-black w-14 justify-center items-center rounded-xl">
                            <Ionicons name="map" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => setShowPaymentModal(true)} className="bg-black py-4 rounded-xl items-center shadow-lg mb-4">
                        <Text className="text-white font-bold text-lg">Proceed to Payment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setViewMode('summary')} className="items-center py-2">
                        <Text className="text-gray-500 font-bold">Back</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* --- UPDATED LOCATION PICKER MODAL (With Esri Tiles) --- */}
                <Modal visible={showMapPicker} animationType="slide">
                    <View className="flex-1 bg-white">
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={{ flex: 1 }}
                            mapType="none"
                            showsUserLocation={true}
                            // Initial region is set to selectedCoords (User's location)
                            region={{
                                latitude: selectedCoords.latitude,
                                longitude: selectedCoords.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            onPress={handleMapPress}
                        >
                            {/* Esri World Street Map Tiles */}
                            <UrlTile
                                urlTemplate="https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                                maximumZ={19}
                                flipY={false}
                            />
                            <Marker coordinate={selectedCoords} pinColor="red" title="Delivery Location" />
                        </MapView>

                        {loadingLocation && (
                            <View className="absolute top-20 self-center bg-white px-4 py-2 rounded-full shadow-md flex-row items-center">
                                <ActivityIndicator size="small" color="#D93800" />
                                <Text className="ml-2 font-bold text-gray-600">Locating you...</Text>
                            </View>
                        )}

                        <View className="absolute bottom-8 left-6 right-6">
                            <TouchableOpacity onPress={() => setShowMapPicker(false)} className="bg-[#D93800] py-4 rounded-xl items-center shadow-lg">
                                <Text className="text-white font-bold text-lg">Confirm Location</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => setShowMapPicker(false)} className="absolute top-12 left-4 bg-white p-2 rounded-full shadow-md mt-12">
                            <Ionicons name="close" size={20} color="black" />
                        </TouchableOpacity>
                    </View>
                </Modal>

                <Modal visible={showPaymentModal} transparent animationType="slide">
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-white p-6 rounded-t-3xl max-h-[80%]">
                            <Text className="text-xl font-bold mb-4">Select Payment Method</Text>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Display all saved cards */}
                                {user?.savedCards && Array.isArray(user.savedCards) && user.savedCards.length > 0 ? (
                                    <>
                                        <Text className="text-gray-500 text-sm mb-2 font-medium">Saved Cards</Text>
                                        {user.savedCards.map((card: any, index: number) => (
                                            <TouchableOpacity
                                                key={card.id || index}
                                                onPress={() => {
                                                    setSelectedCard(card);
                                                    handlePayment('Card Payment');
                                                }}
                                                className={`${
                                                    card.cardType === 'visa' ? 'bg-blue-50' : 
                                                    card.cardType === 'mastercard' ? 'bg-orange-50' : 
                                                    'bg-purple-50'
                                                } p-4 rounded-xl mb-3 flex-row items-center border-2 ${
                                                    selectedCard?.id === card.id ? 'border-[#D93800]' : 'border-transparent'
                                                }`}
                                            >
                                                <View className="bg-white p-2 rounded-lg">
                                                    <Ionicons
                                                        name="card"
                                                        size={24}
                                                        color={
                                                            card.cardType === 'visa' ? '#1434CB' :
                                                            card.cardType === 'mastercard' ? '#EB001B' :
                                                            '#000'
                                                        }
                                                    />
                                                </View>
                                                <View className="ml-3 flex-1">
                                                    <Text className="text-lg font-bold capitalize">{card.cardType || 'Card'}</Text>
                                                    <Text className="text-gray-600">**** **** **** {card.lastFourDigits}</Text>
                                                    <Text className="text-xs text-gray-400">{card.cardholderName}</Text>
                                                </View>
                                                {selectedCard?.id === card.id && (
                                                    <Ionicons name="checkmark-circle" size={24} color="#D93800" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </>
                                ) : (
                                    <View className="bg-gray-50 p-4 rounded-xl mb-3 items-center">
                                        <Ionicons name="card-outline" size={40} color="#ccc" />
                                        <Text className="text-gray-400 mt-2">No saved cards</Text>
                                        <Text className="text-xs text-gray-400">Add a card in your profile</Text>
                                    </View>
                                )}

                                {/* Cash on Delivery Option */}
                                <Text className="text-gray-500 text-sm mb-2 mt-2 font-medium">Other Payment Methods</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedCard(null);
                                        handlePayment('Cash On Delivery');
                                    }}
                                    className="bg-green-50 p-4 rounded-xl mb-4 flex-row items-center border-2 border-transparent"
                                >
                                    <View className="bg-white p-2 rounded-lg">
                                        <Ionicons name="cash" size={24} color="green" />
                                    </View>
                                    <Text className="ml-3 text-lg font-medium">Cash On Delivery</Text>
                                </TouchableOpacity>
                            </ScrollView>

                            <TouchableOpacity
                                onPress={() => {
                                    setShowPaymentModal(false);
                                    setSelectedCard(null);
                                }}
                                className="items-center bg-gray-200 p-3 rounded-xl mt-2"
                            >
                                <Text className="text-red-500 font-bold">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                {renderCustomAlert()}
            </View>
        );
    }

    // TRACKING VIEW
    if (viewMode === 'tracking' && activeOrder) {
        const targetCoords = activeOrder.deliveryDetails?.coordinates || selectedCoords;
        return (
            <View className="flex-1 bg-white">
                <View className="h-[60%] w-full">
                    {/* --- UPDATED TRACKING MAP (With Esri Tiles) --- */}
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={{ flex: 1 }}
                        mapType="none"
                        initialRegion={{
                            latitude: (RESTAURANT_LOC.latitude + targetCoords.latitude) / 2,
                            longitude: (RESTAURANT_LOC.longitude + targetCoords.longitude) / 2,
                            latitudeDelta: 0.08,
                            longitudeDelta: 0.08
                        }}
                    >
                        {/* Esri World Street Map Tiles */}
                        <UrlTile
                            urlTemplate="https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                            maximumZ={19}
                            flipY={false}
                        />

                        <Marker coordinate={RESTAURANT_LOC} title="Restaurant" pinColor="red" />
                        <Marker coordinate={targetCoords} title="Delivery Location" pinColor="blue" />
                        {orderStatus === 'Delivering' && (<Marker coordinate={riderLoc} title="Rider"><Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png' }} style={{ width: 40, height: 40 }} /></Marker>)}
                        <Polyline coordinates={[RESTAURANT_LOC, targetCoords]} strokeWidth={4} strokeColor="#D93800" />
                    </MapView>
                </View>
                <View className="flex-1 bg-white -mt-6 rounded-t-3xl p-6 shadow-2xl">
                    <Text className="text-gray-500 text-center mb-2">Estimated Arrival: 15 mins</Text>
                    <Text className="text-2xl font-bold text-center text-gray-800 mb-6">{orderStatus}</Text>
                    <View className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden"><View className={`h-full bg-[#D93800] ${orderStatus === 'Preparing' ? 'w-1/3' : orderStatus === 'Delivering' ? 'w-2/3' : 'w-full'}`} /></View>
                    <View className="flex-row items-center bg-gray-50 p-4 rounded-xl">
                        <View className="bg-gray-300 w-12 h-12 rounded-full items-center justify-center"><Ionicons name="person" size={24} color="gray" /></View>
                        <View className="ml-3"><Text className="font-bold text-lg">Kamal Rider</Text><Text className="text-gray-500">Yamaha FZ - WP BEO 1234</Text></View>
                        <TouchableOpacity className="ml-auto bg-green-100 p-2 rounded-full"><Ionicons name="call" size={24} color="green" /></TouchableOpacity>
                    </View>
                </View>
                <Modal visible={showRatingModal} transparent animationType="fade">
                    <View className="flex-1 justify-center items-center bg-black/60">
                        <View className="bg-white w-[85%] p-6 rounded-3xl items-center">
                            <Text className="text-2xl font-bold mb-2">Order Completed!</Text>
                            <Text className="text-gray-500 mb-6">Please rate your food</Text>
                            <View className="flex-row gap-2 mb-6">{[1, 2, 3, 4, 5].map((star) => (<TouchableOpacity key={star} onPress={() => setRatingStar(star)}><Ionicons name={star <= ratingStar ? "star" : "star-outline"} size={32} color="#FFD700" /></TouchableOpacity>))}</View>
                            <TextInput placeholder="Write a review..." className="bg-gray-100 w-full p-3 rounded-xl mb-4" />
                            <TouchableOpacity onPress={submitRating} disabled={isSubmitting} className="bg-black w-full py-3 rounded-xl items-center"><Text className="text-white font-bold">Submit</Text></TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                {renderCustomAlert()}
            </View>
        );
    }

    // HISTORY VIEW (With Loading)
    return (
        <View className="flex-1 bg-gray-50 pt-6 px-6">
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-gray-800">My Orders</Text>
                <TouchableOpacity onPress={() => setViewMode('history')}><Ionicons name="refresh" size={24} color="black" /></TouchableOpacity>
            </View>

            {loadingOrders ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#D93800" />
                    <Text className="text-gray-400 mt-2">Loading History...</Text>
                </View>
            ) : orders.length === 0 ? (
                <View className="flex-1 justify-center items-center"><Ionicons name="receipt-outline" size={80} color="#ccc" /><Text className="text-gray-400 mt-4">No past orders</Text></View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View className="bg-white p-4 rounded-2xl mb-4 shadow-sm border border-gray-100">
                            <View className="flex-row justify-between border-b border-gray-100 pb-2 mb-2">
                                <Text className="font-bold">#{item.id.slice(0, 8)}...</Text>
                                <Text className={`text-xs font-bold ${item.status === 'Completed' ? 'text-green-600' : 'text-orange-500'}`}>{item.status}</Text>
                            </View>
                            <Text className="text-gray-500 text-xs mb-2">{item.date}</Text>
                            <Text className="text-gray-600 font-medium mb-1">{item.items.map(i => `${i.quantity} x ${i.name}`).join(', ')}</Text>
                            <Text className="text-lg font-extrabold text-[#D93800] text-right mt-2">Rs. {item.total.toFixed(0)}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}