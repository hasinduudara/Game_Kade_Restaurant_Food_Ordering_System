import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import "../global.css";

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {

    const handleStart = () => {
        console.log("Navigating...");
    };

    return (
        <LinearGradient
            colors={['#D93800', '#FF6F00', '#D93800']}
            locations={[0, 0.5, 1]}
            className="flex-1"
        >

            <SafeAreaView className="flex-1 justify-between items-center px-4 py-6">
                <Animated.View
                    entering={FadeInDown.delay(100).springify()}
                    className="items-center"
                >
                    <View className="bg-white/20 px-6 py-2 rounded-full mb-6 border border-white/10">
                        <Text className="text-white font-bold tracking-wider text-xs uppercase">
                            ඇබ්බැහිවෙන සුලුයි
                        </Text>
                    </View>
                    <Text className="text-white text-5xl font-extrabold text-center leading-tight shadow-sm">
                        Welcome to{"\n"}
                        <Text className="text-yellow-100">ගමේ කඩේ</Text>
                    </Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(300).springify()}
                    className="flex-1 justify-center items-center relative z-10"
                >
                    <Image
                        source={require('../assets/images/burger.png')}
                        className="w-80 h-80 object-contain"
                        style={{ width: width * 0.85, height: width * 0.85 }}
                    />
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(500).springify()}
                    className="w-full gap-4 mb-4"
                >
                    <TouchableOpacity
                        activeOpacity={0.9}
                        className="w-full bg-[#FFF0E5] py-4 rounded-3xl items-center justify-center shadow-lg"
                    >
                        <Text className="text-[#FF4200] font-bold text-lg">
                            Start App Now
                        </Text>
                    </TouchableOpacity>

                    <Text className="text-white/60 text-center text-[10px] mt-2 px-4 leading-4">
                        By tapping Continue or Order Delivery, you agree to Game Kade Terms & Conditions and Privacy Policy.
                    </Text>
                </Animated.View>
            </SafeAreaView>
        </LinearGradient>
    );
}