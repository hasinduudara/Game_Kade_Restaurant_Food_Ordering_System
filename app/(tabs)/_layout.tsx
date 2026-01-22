import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function TabLayout() {
    return (
        <>
            <StatusBar style="light" backgroundColor="black" />
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: '#D93800',
                    tabBarInactiveTintColor: 'gray',
                    tabBarStyle: {
                        backgroundColor: '#ffffff',
                        borderTopWidth: 1,
                        borderTopColor: '#f0f0f0',
                        height: Platform.OS === 'android' ? 60 : 85,
                        paddingBottom: Platform.OS === 'android' ? 10 : 30,
                        paddingTop: 10,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600',
                    },
                }}
            >
                {/* 1. Home Tab */}
                <Tabs.Screen
                    name="home"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="home" size={size} color={color} />
                        ),
                    }}
                />

                {/* 2. Cart Tab */}
                <Tabs.Screen
                    name="cart"
                    options={{
                        title: 'Cart',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="cart" size={size} color={color} />
                        ),
                    }}
                />

                {/* 3. Orders Tab */}
                <Tabs.Screen
                    name="orders"
                    options={{
                        title: 'Orders',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="receipt" size={size} color={color} />
                        ),
                    }}
                />

                {/* 4. Profile Tab */}
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="person" size={size} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </>
    );
}