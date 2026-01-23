import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import "../../global.css"; // NativeWind CSS

import { categories, foodItems } from '../../constants/menuData';

export default function HomeScreen() {
    const [activeCategory, setActiveCategory] = useState('Rice');

    return (
        <View className="flex-1 bg-gray-50">

            {/* --- Header Section --- */}
            <View className="bg-white px-6 pt-12 pb-4 shadow-sm z-10">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-gray-500 text-sm font-medium">Deliver to</Text>
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="location" size={20} color="#D93800" />
                            <Text className="text-gray-800 text-lg font-bold">Colombo, Sri Lanka</Text>
                            <Ionicons name="chevron-down" size={16} color="gray" />
                        </View>
                    </View>
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
                    />
                    <TouchableOpacity>
                        <Ionicons name="options-outline" size={20} color="#D93800" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                {/* --- Banner --- */}
                <View className="mx-6 mt-6 rounded-3xl overflow-hidden shadow-lg">
                    <LinearGradient
                        colors={['#D93800', '#FF6F00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="p-6 flex-row items-center justify-between"
                    >
                        <View>
                            <Text className="text-white text-xl font-bold">Special Offer!</Text>
                            <Text className="text-yellow-200 text-3xl font-extrabold mt-1">30% OFF</Text>
                            <TouchableOpacity className="bg-white px-4 py-2 rounded-full mt-3 self-start">
                                <Text className="text-[#D93800] font-bold">Order Now</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Banner Image (Burger) */}
                        <Image
                            source={require('../../assets/images/burger.png')}
                            className="w-24 h-24"
                            resizeMode="contain"
                        />
                    </LinearGradient>
                </View>

                {/* --- Categories --- */}
                <View className="mt-8">
                    <Text className="mx-6 text-lg font-bold text-gray-800 mb-4">Categories</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
                    >
                        {/* menuData.ts එකෙන් එන categories ටික මෙතන loop වෙනවා */}
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                onPress={() => setActiveCategory(cat.name)}
                                className={`flex-row items-center p-3 rounded-full border ${
                                    activeCategory === cat.name
                                        ? 'bg-[#D93800] border-[#D93800]'
                                        : 'bg-white border-gray-200'
                                }`}
                            >
                                <View className={`p-2 rounded-full ${activeCategory === cat.name ? 'bg-white/20' : 'bg-gray-100'}`}>
                                    <Ionicons
                                        name={cat.icon as any}
                                        size={20}
                                        color={activeCategory === cat.name ? 'white' : 'gray'}
                                    />
                                </View>
                                <Text className={`ml-2 font-semibold ${activeCategory === cat.name ? 'text-white' : 'text-gray-600'}`}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* --- Popular Items List --- */}
                <View className="mt-8 mb-24 px-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-800">Popular Now</Text>
                        <TouchableOpacity>
                            <Text className="text-[#FF6F00] font-semibold">See all</Text>
                        </TouchableOpacity>
                    </View>

                    {/* menuData.ts එකෙන් එන foodItems ටික මෙතන loop වෙනවා */}
                    {foodItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.9}
                            className="bg-white p-4 rounded-3xl mb-4 flex-row shadow-sm border border-gray-100 items-center"
                        >
                            <Image
                                source={item.image}
                                className="w-24 h-24 rounded-2xl"
                                resizeMode="contain"
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

                            {/* Add Button */}
                            <TouchableOpacity className="absolute bottom-4 right-4 bg-black p-2 rounded-full">
                                <Ionicons name="add" size={20} color="white" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
}