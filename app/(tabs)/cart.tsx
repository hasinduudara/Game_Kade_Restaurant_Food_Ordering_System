import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart } from '../../context/CartContext';

export default function CartScreen() {

    const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart();

    // Check if Cart is empty
    if (items.length === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Ionicons name="cart-outline" size={80} color="#ccc" />
                <Text className="text-gray-400 text-lg mt-4 font-semibold">Your cart is empty!</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/home')}
                    className="mt-6 bg-[#D93800] px-6 py-3 rounded-full"
                >
                    <Text className="text-white font-bold">Start Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Updated Checkout Logic
    const handleCheckout = () => {
        // Navigate to Orders tab with 'checkout' parameter
        // Cart is NOT cleared here so users can cancel later if they want
        router.push({ pathname: '/(tabs)/orders', params: { view: 'checkout' } });
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-6 pt-12 pb-4 shadow-sm">
                <Text className="text-2xl font-bold text-gray-800">My Cart</Text>
                <Text className="text-gray-500">{items.length} items</Text>
            </View>

            <ScrollView className="flex-1 px-4 mt-4" showsVerticalScrollIndicator={false}>
                {items.map((item) => (
                    <View key={item.id} className="bg-white p-4 rounded-2xl mb-4 flex-row items-center shadow-sm border border-gray-100">
                        {/* Image */}
                        <Image source={{ uri: item.image }} className="w-20 h-20 rounded-xl bg-gray-100" resizeMode="cover" />

                        {/* Details */}
                        <View className="flex-1 ml-4">
                            <View className="flex-row justify-between items-start">
                                <Text className="text-lg font-bold text-gray-800 w-[80%]" numberOfLines={1}>{item.name}</Text>
                                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>

                            <Text className="text-[#D93800] font-bold mt-1">{item.price}</Text>

                            {/* Quantity Controls */}
                            <View className="flex-row items-center mt-3 bg-gray-100 self-start rounded-lg px-2 py-1">
                                <TouchableOpacity onPress={() => updateQuantity(item.id, 'decrease')} className="p-1">
                                    <Ionicons name="remove" size={16} color="black" />
                                </TouchableOpacity>
                                <Text className="mx-3 font-bold text-gray-800">{item.quantity}</Text>
                                <TouchableOpacity onPress={() => updateQuantity(item.id, 'increase')} className="p-1">
                                    <Ionicons name="add" size={16} color="black" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
                <View className="h-32" />
            </ScrollView>

            {/* Checkout Footer */}
            <View className="absolute bottom-0 w-full bg-white p-6 rounded-t-3xl shadow-2xl border-t border-gray-100">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-gray-500 font-medium">Total Amount</Text>
                    <Text className="text-3xl font-extrabold text-[#D93800]">Rs. {getTotalPrice().toFixed(0)}</Text>
                </View>

                <TouchableOpacity
                    onPress={handleCheckout}
                    className="bg-black w-full py-4 rounded-2xl flex-row justify-center items-center"
                >
                    <Text className="text-white font-bold text-lg mr-2">Checkout</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}