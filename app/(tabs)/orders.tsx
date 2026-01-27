import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Modal, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';

import { useCart } from '../../context/CartContext';
import { useOrders, Order } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';

// Static Locations
const RESTAURANT_LOC = { latitude: 6.927079, longitude: 79.861244 };
const DEFAULT_USER_LOC = { latitude: 6.9000, longitude: 79.8500 };

export default function OrdersScreen() {
    const params = useLocalSearchParams();
    const { user } = useAuth();
    const { items, getTotalPrice, clearCart } = useCart();
    const { orders, activeOrder, setActiveOrder, addOrderToHistory } = useOrders();

    // View Modes
    const [viewMode, setViewMode] = useState<'history' | 'summary' | 'details' | 'tracking'>('history');

    // Form States
    const [tempName, setTempName] = useState(user?.fullName || "Guest User");
    const [tempPhone, setTempPhone] = useState("0771234567");
    const [tempAddress, setTempAddress] = useState(user?.address || "Colombo 07");

    // Modal States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingStar, setRatingStar] = useState(0);

    // Tracking States
    const [orderStatus, setOrderStatus] = useState("Preparing");
    const [riderLoc, setRiderLoc] = useState(RESTAURANT_LOC);

    // --- USE EFFECT ---
    useEffect(() => {
        if (activeOrder) {
            setViewMode('tracking');
        } else if (params.view === 'checkout' && items.length > 0) {
            setViewMode((prev) => (prev === 'details' ? 'details' : 'summary'));
        } else {
            setViewMode('history');
        }
    }, [params.view, activeOrder, items.length]);

    // --- HANDLERS ---

    const handleCancel = () => {
        router.push('/(tabs)/cart');
        setViewMode('history');
    };

    const handlePayment = (method: string) => {
        setShowPaymentModal(false);
        Alert.alert("Order Placed", `Paid via ${method}.`);

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
                paymentMethod: method
            }
        };

        setActiveOrder(newOrder);
        clearCart();
        setViewMode('tracking');
        startOrderSimulation();
    };

    const startOrderSimulation = () => {
        setOrderStatus("Preparing");
        setRiderLoc(RESTAURANT_LOC);

        setTimeout(() => {
            Alert.alert("Order Ready", "Your food is ready! Rider is coming.");
            setOrderStatus("Delivering");
            startRiderMovement();
        }, 10000);
    };

    const startRiderMovement = () => {
        let steps = 0;
        const maxSteps = 20;
        const interval = setInterval(() => {
            steps++;
            const lat = RESTAURANT_LOC.latitude + (DEFAULT_USER_LOC.latitude - RESTAURANT_LOC.latitude) * (steps / maxSteps);
            const lng = RESTAURANT_LOC.longitude + (DEFAULT_USER_LOC.longitude - RESTAURANT_LOC.longitude) * (steps / maxSteps);
            setRiderLoc({ latitude: lat, longitude: lng });

            if (steps >= maxSteps) {
                clearInterval(interval);
                setOrderStatus("Completed");
                setShowRatingModal(true);
            }
        }, 500);
    };

    const submitRating = () => {
        if (activeOrder) {
            addOrderToHistory({ ...activeOrder, status: 'Completed' });
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
                    <View className="bg-gray-100 p-4 rounded-xl mb-6 flex-row items-center">
                        <Ionicons name="location" size={24} color="#D93800" />
                        <TextInput value={tempAddress} onChangeText={setTempAddress} className="flex-1 ml-2 text-lg text-gray-800" multiline />
                    </View>

                    <TouchableOpacity onPress={() => setShowPaymentModal(true)} className="bg-black py-4 rounded-xl items-center shadow-lg mb-4">
                        <Text className="text-white font-bold text-lg">Proceed to Payment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setViewMode('summary')} className="items-center py-2">
                        <Text className="text-gray-500 font-bold">Back</Text>
                    </TouchableOpacity>
                </ScrollView>

                <Modal visible={showPaymentModal} transparent animationType="slide">
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-white p-6 rounded-t-3xl">
                            <Text className="text-xl font-bold mb-4">Select Payment Method</Text>

                            <TouchableOpacity onPress={() => handlePayment('Saved Card')} className="bg-gray-100 p-4 rounded-xl mb-3 flex-row items-center">
                                <Ionicons name="card" size={24} color="black" />
                                <Text className="ml-3 text-lg font-medium">Saved Card (**** 1234)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => handlePayment('Cash On Delivery')} className="bg-gray-100 p-4 rounded-xl mb-6 flex-row items-center">
                                <Ionicons name="cash" size={24} color="green" />
                                <Text className="ml-3 text-lg font-medium">Cash On Delivery</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setShowPaymentModal(false)} className="items-center bg-gray-200 p-3 rounded-xl">
                                <Text className="text-red-500 font-bold">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    // TRACKING VIEW (OpenStreetMap)
    if (viewMode === 'tracking' && activeOrder) {
        return (
            <View className="flex-1 bg-white">
                <View className="h-[60%] w-full">
                    {/* OpenStreetMap*/}
                    <MapView
                        style={{ flex: 1 }}
                        mapType="none" // Google/Apple Map එක හංගනවා
                        initialRegion={{ ...RESTAURANT_LOC, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
                    >
                        {/* Add OpenStreetMap Tiles */}
                        <UrlTile
                            urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maximumZ={19}
                            zIndex={-1}
                        />

                        <Marker coordinate={RESTAURANT_LOC} title="Restaurant" pinColor="red" />
                        <Marker coordinate={DEFAULT_USER_LOC} title="You" pinColor="blue" />

                        {orderStatus === 'Delivering' && (
                            <Marker coordinate={riderLoc} title="Rider">
                                <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png' }} style={{ width: 40, height: 40 }} />
                            </Marker>
                        )}

                        <Polyline coordinates={[RESTAURANT_LOC, DEFAULT_USER_LOC]} strokeWidth={3} strokeColor="#D93800" />
                    </MapView>
                </View>

                {/* Status Bottom Sheet */}
                <View className="flex-1 bg-white -mt-6 rounded-t-3xl p-6 shadow-2xl">
                    <Text className="text-gray-500 text-center mb-2">Estimated Arrival: 15 mins</Text>
                    <Text className="text-2xl font-bold text-center text-gray-800 mb-6">{orderStatus}</Text>
                    <View className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
                        <View className={`h-full bg-[#D93800] ${orderStatus === 'Preparing' ? 'w-1/3' : orderStatus === 'Delivering' ? 'w-2/3' : 'w-full'}`} />
                    </View>
                    <View className="flex-row items-center bg-gray-50 p-4 rounded-xl">
                        <View className="bg-gray-300 w-12 h-12 rounded-full items-center justify-center">
                            <Ionicons name="person" size={24} color="gray" />
                        </View>
                        <View className="ml-3">
                            <Text className="font-bold text-lg">Kamal Rider</Text>
                            <Text className="text-gray-500">Yamaha FZ - WP BEO 1234</Text>
                        </View>
                        <TouchableOpacity className="ml-auto bg-green-100 p-2 rounded-full">
                            <Ionicons name="call" size={24} color="green" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Rating Modal */}
                <Modal visible={showRatingModal} transparent animationType="fade">
                    <View className="flex-1 justify-center items-center bg-black/60">
                        <View className="bg-white w-[85%] p-6 rounded-3xl items-center">
                            <Text className="text-2xl font-bold mb-2">Order Completed!</Text>
                            <Text className="text-gray-500 mb-6">Please rate your food</Text>
                            <View className="flex-row gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => setRatingStar(star)}>
                                        <Ionicons name={star <= ratingStar ? "star" : "star-outline"} size={32} color="#FFD700" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TextInput placeholder="Write a review..." className="bg-gray-100 w-full p-3 rounded-xl mb-4" />
                            <TouchableOpacity onPress={submitRating} className="bg-black w-full py-3 rounded-xl items-center">
                                <Text className="text-white font-bold">Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    // HISTORY VIEW
    return (
        <View className="flex-1 bg-gray-50 pt-12 px-6">
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-gray-800">My Orders</Text>
                <TouchableOpacity onPress={() => setViewMode('history')}>
                    <Ionicons name="refresh" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {orders.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Ionicons name="receipt-outline" size={80} color="#ccc" />
                    <Text className="text-gray-400 mt-4">No past orders</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View className="bg-white p-4 rounded-2xl mb-4 shadow-sm border border-gray-100">
                            <View className="flex-row justify-between border-b border-gray-100 pb-2 mb-2">
                                <Text className="font-bold">#{item.id}</Text>
                                <Text className={`text-xs font-bold ${item.status === 'Completed' ? 'text-green-600' : 'text-orange-500'}`}>{item.status}</Text>
                            </View>
                            <Text className="text-gray-500 text-xs mb-2">{item.date}</Text>
                            <Text className="text-gray-600 font-medium mb-1">
                                {item.items.map(i => `${i.quantity} x ${i.name}`).join(', ')}
                            </Text>
                            <Text className="text-lg font-extrabold text-[#D93800] text-right mt-2">
                                Rs. {item.total.toFixed(0)}
                            </Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}