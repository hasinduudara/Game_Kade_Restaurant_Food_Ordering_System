import React from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import { useOrders } from '../../context/OrderContext';
import { Ionicons } from '@expo/vector-icons';

export default function OrdersScreen() {
    const { orders } = useOrders();

    if (orders.length === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <Ionicons name="receipt-outline" size={80} color="#ccc" />
                <Text className="text-gray-400 text-lg mt-4 font-semibold">No orders yet</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 pt-12 px-6">
            <Text className="text-2xl font-bold text-gray-800 mb-6">My Orders</Text>

            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <View className="bg-white p-4 rounded-2xl mb-4 shadow-sm border border-gray-100">
                        {/* Order Header */}
                        <View className="flex-row justify-between items-center border-b border-gray-100 pb-3 mb-3">
                            <View>
                                <Text className="text-xs text-gray-400">Order ID</Text>
                                <Text className="font-bold text-gray-800">#{item.id.toUpperCase()}</Text>
                            </View>
                            <View className="bg-green-100 px-3 py-1 rounded-full">
                                <Text className="text-green-700 text-xs font-bold">{item.status}</Text>
                            </View>
                        </View>

                        {/* Items List (Short summary) */}
                        <View>
                            {item.items.map((food, index) => (
                                <Text key={index} className="text-gray-600 mb-1">
                                    {food.quantity} x {food.name}
                                </Text>
                            ))}
                        </View>

                        {/* Footer (Date & Total) */}
                        <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-gray-100">
                            <Text className="text-xs text-gray-400">{item.date}</Text>
                            <Text className="text-lg font-extrabold text-[#D93800]">
                                Rs. {item.total.toFixed(0)}
                            </Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}