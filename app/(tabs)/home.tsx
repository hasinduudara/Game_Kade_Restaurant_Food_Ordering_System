import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import "../../global.css";
import { router } from 'expo-router';

import { categories, foodItems } from '../../constants/menuData';
import PromoCarousel from '../../components/PromoCarousel';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
    // 👇 2. Get user data from context
    const { user } = useAuth();

    const [activeCategoryId, setActiveCategoryId] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    // Smart Filter Logic
    const filteredFood = foodItems.filter((item) => {
        // Filter for Search Query
        if (searchQuery.length > 0) {
            return item.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return item.categoryId === activeCategoryId;
    });

    return (
        <View className="flex-1 bg-gray-50">

            {/* --- Header Section --- */}
            <View className="bg-white px-6 pt-12 pb-4 shadow-sm z-10">
                <View className="flex-row justify-between items-center">

                    {/* Updated Address Section */}
                    <TouchableOpacity onPress={() => router.push('/map')}>
                        <Text className="text-gray-500 text-sm font-medium">Deliver to</Text>
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="location" size={20} color="#D93800" />
                            <Text
                                className="text-gray-800 text-lg font-bold max-w-[250px]"
                                numberOfLines={1} // Truncate text if it's too long
                            >
                                {/* Display user address or default text */}
                                {user?.address || "Set Current Location"}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="gray" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-gray-100 p-2 rounded-full">
                        <Ionicons name="notifications-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="mt-4 flex-row items-center bg-gray-100 p-3 rounded-xl">
                    <Ionicons name="search" size={20} color="gray" />
                    <TextInput
                        placeholder="Search for food..."
                        className="flex-1 ml-2 text-gray-700 font-medium"
                        value={searchQuery}
                        onChangeText={(text) => setSearchQuery(text)}
                    />
                    {/* Clear Search bar */}
                    {searchQuery.length > 0 ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="gray" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity>
                            <Ionicons name="options-outline" size={20} color="#D93800" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                {/* --- Banner --- */}
                <PromoCarousel />

                {/* --- Categories --- */}
                <View className="mt-8">
                    <Text className="mx-6 text-lg font-bold text-gray-800 mb-4">Categories</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
                    >
                        {categories.map((cat) => {
                            const isActive = activeCategoryId === cat.id;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    onPress={() => {
                                        setActiveCategoryId(cat.id);
                                        setSearchQuery('');
                                    }}
                                    className={`flex-row items-center p-3 rounded-full border ${
                                        isActive
                                            ? 'bg-[#D93800] border-[#D93800]'
                                            : 'bg-white border-gray-200'
                                    }`}
                                >
                                    <View className={`p-2 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                                        <Ionicons
                                            name={cat.icon as any}
                                            size={20}
                                            color={isActive ? 'white' : 'gray'}
                                        />
                                    </View>
                                    <Text className={`ml-2 font-semibold ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* --- Popular Items List --- */}
                <View className="mt-8 mb-24 px-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-800">
                            {searchQuery.length > 0 ? 'Search Results' : 'Popular Now'}
                        </Text>
                        {searchQuery.length === 0 && (
                            <TouchableOpacity>
                                <Text className="text-[#FF6F00] font-semibold">See all</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Show filtered items */}
                    {filteredFood.length > 0 ? (
                        filteredFood.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                activeOpacity={0.9}
                                className="bg-white p-4 rounded-3xl mb-4 flex-row shadow-sm border border-gray-100 items-center"
                            >
                                <Image
                                    source={{ uri: item.image }}
                                    className="w-24 h-24 rounded-2xl"
                                    resizeMode="cover"
                                />
                                <View className="flex-1 ml-4">
                                    <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
                                    <Text className="text-gray-500 text-xs mt-1" numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                    <View className="flex-row justify-between items-center mt-3">
                                        <Text className="text-[#D93800] font-extrabold text-lg">{item.price}</Text>
                                        <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-lg">
                                            <Ionicons name="star" size={12} color="#D97706" />
                                            <Text className="text-xs font-bold ml-1 text-yellow-700">{item.rating}</Text>
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity className="absolute bottom-4 right-4 bg-black p-2 rounded-full">
                                    <Ionicons name="add" size={20} color="white" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))
                    ) : (
                        // Not Found View
                        <View className="items-center mt-10">
                            <Ionicons name="search-outline" size={50} color="#ccc" />
                            <Text className="text-gray-400 mt-2">No food found!</Text>
                        </View>
                    )}
                </View>

            </ScrollView>
        </View>
    );
}