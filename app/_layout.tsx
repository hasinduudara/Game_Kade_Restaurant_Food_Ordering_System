import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { configureReanimatedLogger } from 'react-native-reanimated';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { OrderProvider } from '../context/OrderContext';
import "../global.css";
import { View, ActivityIndicator } from 'react-native';

configureReanimatedLogger({
    strict: false,
});

function RootLayoutNav() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#D93800' }}>
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="food/[id]" options={{ presentation: 'card', headerShown: false }} />
            <Stack.Screen name="map" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <CartProvider>
                <OrderProvider>
                    <StatusBar style="light" backgroundColor="#000000" />
                    <RootLayoutNav />
                </OrderProvider>
            </CartProvider>
        </AuthProvider>
    );
}