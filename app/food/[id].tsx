import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { foodItems } from '../../constants/menuData';

export default function FoodDetailScreen() {

    const { id } = useLocalSearchParams();

    // 2. Find the specific food item from the data array using the ID
    const item = foodItems.find((f) => f.id.toString() === id);

    // 3. Handle case where the item is not found (Safety check)
    if (!item) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Item not found!</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {/* --- Top Image Section --- */}
            <View className="relative">
                <Image
                    source={{ uri: item.image }}
                    className="w-full h-80 bg-gray-200"
                    resizeMode="cover"
                />

                {/* Back Button (Navigates to previous screen) */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute top-12 left-5 bg-white p-3 rounded-full shadow-md"
                >
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>

                {/* Favorite Button */}
                <TouchableOpacity className="absolute top-12 right-5 bg-white p-3 rounded-full shadow-md">
                    <Ionicons name="heart-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* --- Details Content Container --- */}
            <View className="flex-1 bg-white -mt-10 rounded-t-3xl px-6 pt-8 pb-6">
                <ScrollView showsVerticalScrollIndicator={false}>

                    {/* Title, Cuisine & Rating */}
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1 pr-4">
                            <Text className="text-2xl font-bold text-gray-800">{item.name}</Text>
                            <Text className="text-gray-500 mt-1">Western Cuisine • Fast Food</Text>
                        </View>
                        <View className="bg-[#D93800] px-3 py-1 rounded-full flex-row items-center">
                            <Ionicons name="star" size={14} color="white" />
                            <Text className="text-white font-bold ml-1">{item.rating}</Text>
                        </View>
                    </View>

                    {/* Price & Quantity Selector */}
                    <View className="flex-row justify-between items-center mt-6">
                        <Text className="text-3xl font-extrabold text-[#D93800]">{item.price}</Text>

                        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                            <TouchableOpacity>
                                <Ionicons name="remove" size={24} color="black" />
                            </TouchableOpacity>
                            <Text className="mx-4 text-lg font-bold">1</Text>
                            <TouchableOpacity>
                                <Ionicons name="add" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Description Text */}
                    <Text className="text-lg font-bold text-gray-800 mt-8 mb-2">Description</Text>
                    <Text className="text-gray-500 leading-6 text-base">
                        {item.description}
                        {"\n\n"}
                        This delicious meal is prepared with fresh ingredients and authentic spices. Perfect for lunch or dinner. Enjoy the crispy texture and savory taste that will leave you wanting more!
                    </Text>

                </ScrollView>

                {/* --- Bottom Action Button --- */}
                <View className="pt-4 border-t border-gray-100">
                    <TouchableOpacity className="bg-black w-full py-4 rounded-2xl flex-row justify-center items-center shadow-lg">
                        <Ionicons name="cart-outline" size={24} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">Add to Cart</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}