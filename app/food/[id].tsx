import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { foodItems } from '../../constants/menuData';
import { useCart } from '../../context/CartContext';

export default function FoodDetailScreen() {
    const { id } = useLocalSearchParams();
    const item = foodItems.find((f) => f.id.toString() === id);
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const increaseQty = () => setQuantity(prev => prev + 1);
    const decreaseQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = () => {
        if (item) {
            addToCart(item, quantity);
            setShowSuccessModal(true);
        }
    };

    if (!item) return <View className="flex-1 justify-center items-center"><Text>Item not found!</Text></View>;

    return (
        <View className="flex-1 bg-white">
            <View className="relative">
                <Image source={{ uri: item.image }} className="w-full h-80 bg-gray-200" resizeMode="cover"/>
                <TouchableOpacity onPress={() => router.back()} className="absolute top-12 left-5 bg-white p-3 rounded-full shadow-md"><Ionicons name="arrow-back" size={24} color="black" /></TouchableOpacity>
                <TouchableOpacity className="absolute top-12 right-5 bg-white p-3 rounded-full shadow-md"><Ionicons name="heart-outline" size={24} color="black" /></TouchableOpacity>
            </View>

            <View className="flex-1 bg-white -mt-10 rounded-t-3xl px-6 pt-8 pb-6">
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1 pr-4"><Text className="text-2xl font-bold text-gray-800">{item.name}</Text><Text className="text-gray-500 mt-1">Western Cuisine • Fast Food</Text></View>
                        <View className="bg-[#D93800] px-3 py-1 rounded-full flex-row items-center"><Ionicons name="star" size={14} color="white" /><Text className="text-white font-bold ml-1">{item.rating}</Text></View>
                    </View>

                    <View className="flex-row justify-between items-center mt-6">
                        <Text className="text-3xl font-extrabold text-[#D93800]">{item.price}</Text>
                        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                            <TouchableOpacity onPress={decreaseQty} className="p-1"><Ionicons name="remove" size={24} color="black" /></TouchableOpacity>
                            <Text className="mx-4 text-xl font-bold text-gray-800">{quantity}</Text>
                            <TouchableOpacity onPress={increaseQty} className="p-1"><Ionicons name="add" size={24} color="black" /></TouchableOpacity>
                        </View>
                    </View>

                    <Text className="text-lg font-bold text-gray-800 mt-8 mb-2">Description</Text>
                    <Text className="text-gray-500 leading-6 text-base">{item.description}{"\n\n"}This delicious meal is prepared with fresh ingredients and authentic spices. Perfect for lunch or dinner.</Text>
                </ScrollView>

                <View className="pt-4 border-t border-gray-100">
                    <TouchableOpacity onPress={handleAddToCart} className="bg-black w-full py-4 rounded-2xl flex-row justify-center items-center shadow-lg">
                        <Ionicons name="cart-outline" size={24} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">Add to Cart</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Custom Success Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showSuccessModal}
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/60">
                    <View className="bg-white w-[85%] p-6 rounded-3xl items-center shadow-2xl">

                        {/* Success Icon */}
                        <View className="bg-green-100 p-4 rounded-full mb-4">
                            <Ionicons name="checkmark-circle" size={60} color="#22c55e" />
                        </View>

                        <Text className="text-2xl font-bold text-gray-800 mb-2">Added to Cart!</Text>
                        <Text className="text-gray-500 text-center mb-6">
                            {item.name} (x{quantity}) has been added to your cart successfully.
                        </Text>

                        {/* Buttons */}
                        <View className="w-full gap-3">
                            {/* Go to Cart Button */}
                            <TouchableOpacity
                                onPress={() => { setShowSuccessModal(false); router.push('/(tabs)/cart'); }}
                                className="bg-[#D93800] w-full py-3 rounded-xl items-center"
                            >
                                <Text className="text-white font-bold text-lg">Go to Cart</Text>
                            </TouchableOpacity>

                            {/* Keep Shopping Button */}
                            <TouchableOpacity
                                onPress={() => setShowSuccessModal(false)}
                                className="bg-gray-100 w-full py-3 rounded-xl items-center"
                            >
                                <Text className="text-gray-700 font-bold text-lg">Keep Shopping</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>

        </View>
    );
}