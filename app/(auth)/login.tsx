import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { ResponseType } from 'expo-auth-session';
import {
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithCredential,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig';
import "../../global.css";

const { width } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    // State management
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // 👁️ Password පෙන්වීමට අලුත් State එකක්

    // Form Inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');

    const redirectUri = "https://auth.expo.io/@hasinduudara/game-kade";

    // --- GOOGLE AUTH SETUP ---
    const [gRequest, gResponse, gPromptAsync] = Google.useIdTokenAuthRequest({
        webClientId: "671726402324-tzufkeqn4j2aogohhlsgfcuvw4af7ld.apps.googleusercontent.com",
        androidClientId: "671726402324-tzufkeqn4j2aogohhlsgfcuvw4af7ld.apps.googleusercontent.com",
        redirectUri: redirectUri
    });

    // --- FACEBOOK AUTH SETUP ---
    const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
        clientId: "1600859444683956",
        responseType: ResponseType.Token,
        redirectUri: redirectUri
    });

    // Handle Google Response
    useEffect(() => {
        if (gResponse?.type === 'success') {
            const { id_token } = gResponse.params;
            const credential = GoogleAuthProvider.credential(id_token);
            socialSignIn(credential, "Google");
        }
    }, [gResponse]);

    // Handle Facebook Response
    useEffect(() => {
        if (fbResponse?.type === 'success') {
            const { access_token } = fbResponse.params;
            const credential = FacebookAuthProvider.credential(access_token);
            socialSignIn(credential, "Facebook");
        }
    }, [fbResponse]);

    // Common function for Social Sign In
    const socialSignIn = async (credential: any, providerName: string) => {
        setLoading(true);
        try {
            const result = await signInWithCredential(auth, credential);
            const user = result.user;

            // Database එකේ මේ User දැනටමත් ඉන්නවද බලමු
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // User කෙනෙක් නැත්නම් විතරක් අලුතෙන් Save කරන්න
                await setDoc(userDocRef, {
                    uid: user.uid,
                    fullName: user.displayName || "Unknown User",
                    email: user.email,
                    phone: "", // Social Login වලින් ෆෝන් නම්බර් එක එන්නේ නෑ
                    createdAt: new Date().toISOString()
                });
            }

            router.replace('/(tabs)/home');

        } catch (error: any) {
            Alert.alert(`${providerName} Error`, error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- MANUAL EMAIL/PASSWORD AUTH ---
    const handleManualAuth = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                // Login Logic
                await signInWithEmailAndPassword(auth, email, password);
                router.replace('/(tabs)/home');
            } else {
                // Registration Logic
                if (!fullName || !phone) {
                    Alert.alert("Error", "Name and Phone number are required");
                    setLoading(false);
                    return;
                }

                // 1. Create User
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 2. Update Profile Name
                await updateProfile(user, { displayName: fullName });

                // 3. Save Extra Data to Firestore
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    fullName: fullName,
                    email: email,
                    phone: phone,
                    createdAt: new Date().toISOString()
                });

                Alert.alert("Success", "Account created successfully!");
                router.replace('/(tabs)/home');
            }
        } catch (error: any) {
            console.error(error);
            let msg = error.message;
            if (error.code === 'auth/email-already-in-use') msg = "That email address is already in use!";
            if (error.code === 'auth/invalid-email') msg = "That email address is invalid!";
            Alert.alert("Authentication Failed", msg);
        } finally {
            setLoading(false);
        }
    };

    // --- PASSWORD RESET ---
    const handleForgotPassword = () => {
        if (!email) {
            Alert.alert("Required", "Please enter your email address first.");
            return;
        }
        sendPasswordResetEmail(auth, email)
            .then(() => Alert.alert("Email Sent", "Check your email to reset your password."))
            .catch((error) => Alert.alert("Error", error.message));
    };

    return (
        <LinearGradient
            colors={['#D93800', '#FF6F00', '#D93800']}
            locations={[0, 0.5, 1]}
            className="flex-1"
        >
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6">

                        {/* Logo & Header */}
                        <View className="items-center mb-6">
                            <View className="bg-white/20 p-4 rounded-full mb-4 border border-white/10 shadow-lg">
                                <Image
                                    source={require('../../assets/images/burger.png')}
                                    className="w-24 h-24 object-contain"
                                />
                            </View>
                            <Text className="text-white text-3xl font-extrabold text-center">
                                {isLogin ? 'Welcome Back!' : 'Create Account'}
                            </Text>
                            <Text className="text-yellow-100 text-center mt-1 text-sm opacity-90">
                                {isLogin ? 'Login to continue' : 'Join Game Kade today!'}
                            </Text>
                        </View>

                        {/* Input Form */}
                        <View className="bg-white p-6 rounded-3xl shadow-xl space-y-4">

                            {/* Registration Extra Fields */}
                            {!isLogin && (
                                <>
                                    <View>
                                        <Text className="text-gray-600 ml-1 mb-1 font-medium">Full Name</Text>
                                        <TextInput
                                            className="bg-gray-100 p-3 rounded-xl text-gray-800 border border-gray-200"
                                            placeholder="John Doe"
                                            value={fullName}
                                            onChangeText={setFullName}
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-gray-600 ml-1 mb-1 font-medium">Phone Number</Text>
                                        <TextInput
                                            className="bg-gray-100 p-3 rounded-xl text-gray-800 border border-gray-200"
                                            placeholder="077xxxxxxx"
                                            keyboardType="phone-pad"
                                            value={phone}
                                            onChangeText={setPhone}
                                        />
                                    </View>
                                </>
                            )}

                            {/* Email Input */}
                            <View>
                                <Text className="text-gray-600 ml-1 mb-1 font-medium">Email Address</Text>
                                <TextInput
                                    className="bg-gray-100 p-3 rounded-xl text-gray-800 border border-gray-200"
                                    placeholder="user@example.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>

                            {/* Password Input with Eye Icon */}
                            <View>
                                <Text className="text-gray-600 ml-1 mb-1 font-medium">Password</Text>
                                <View className="flex-row items-center bg-gray-100 rounded-xl border border-gray-200">
                                    <TextInput
                                        className="flex-1 p-3 text-gray-800"
                                        placeholder="••••••••"
                                        secureTextEntry={!showPassword} // 👁️ මෙතන වෙනස් කළා
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        className="p-3"
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye" : "eye-off"} // ඇහැ අරින/වහන අයිකන් මාරු වීම
                                            size={20}
                                            color="gray"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Forgot Password Link */}
                            {isLogin && (
                                <TouchableOpacity onPress={handleForgotPassword} className="items-end">
                                    <Text className="text-[#D93800] text-xs font-bold">Forgot Password?</Text>
                                </TouchableOpacity>
                            )}

                            {/* Main Action Button */}
                            <TouchableOpacity
                                onPress={handleManualAuth}
                                disabled={loading}
                                className="bg-[#D93800] py-4 rounded-xl shadow-lg mt-2"
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-center font-bold text-lg">
                                        {isLogin ? 'Log In' : 'Sign Up'}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Divider */}
                            <View className="flex-row items-center my-4">
                                <View className="flex-1 h-[1px] bg-gray-300" />
                                <Text className="mx-4 text-gray-400 text-xs">Or continue with</Text>
                                <View className="flex-1 h-[1px] bg-gray-300" />
                            </View>

                            {/* Social Icons Row */}
                            <View className="flex-row justify-center gap-6">
                                {/* Google Icon Button */}
                                <TouchableOpacity
                                    onPress={() => gPromptAsync()}
                                    disabled={!gRequest}
                                    className="bg-gray-100 p-4 rounded-full border border-gray-200 shadow-sm"
                                >
                                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                                </TouchableOpacity>

                                {/* Facebook Icon Button */}
                                <TouchableOpacity
                                    onPress={() => fbPromptAsync()}
                                    disabled={!fbRequest}
                                    className="bg-gray-100 p-4 rounded-full border border-gray-200 shadow-sm"
                                >
                                    <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                                </TouchableOpacity>
                            </View>

                            {/* Toggle Sign Up / Login */}
                            <View className="flex-row justify-center mt-4 pt-2">
                                <Text className="text-gray-500">
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                </Text>
                                <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                                    <Text className="text-[#D93800] font-bold">
                                        {isLogin ? 'Sign Up' : 'Log In'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}