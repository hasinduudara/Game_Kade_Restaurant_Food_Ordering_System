# Gama Kade 🍛

A modern mobile food ordering application for Sri Lankan cuisine, built with React Native and Expo. Order your favorite rice dishes, kottu, burgers, and drinks with an intuitive and beautiful interface.

## 📱 Features

- **Browse Menu** - Explore a wide variety of Sri Lankan dishes across multiple categories
- **Smart Search** - Quickly find your favorite food items
- **Shopping Cart** - Add items to cart and manage your order
- **Order Tracking** - Keep track of your current and past orders
- **User Authentication** - Secure login and registration with Firebase
- **Interactive Map** - View restaurant location and navigate easily
- **Promotional Carousel** - Stay updated with latest offers and deals
- **User Profile** - Manage your account and preferences

## 🎨 Categories

- 🍚 Rice Dishes
- 🍜 Kottu
- 🍔 Burgers
- 🥤 Drinks

## 🚀 Technologies Used

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tooling
- **TypeScript** - Type-safe code
- **Expo Router** - File-based routing
- **Firebase** - Authentication and backend services
- **NativeWind** - Tailwind CSS for React Native
- **React Native Maps** - Location and map integration
- **AsyncStorage** - Local data persistence
- **Context API** - State management

## 📥 Download APK

[Download the latest APK](https://drive.google.com/file/d/1leuLJ4bwUTVlNfF0eWUGRIVLWwgW38xT/view?usp=sharing)

## 📦 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development) or Xcode (for iOS development)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/hasinduudara/Game_Kade_Restaurant_Food_Ordering_System.git
   cd Gama-Kade
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Add your Firebase configuration to `services/firebaseConfig.ts`

4. **Set up Google Maps API**
   - Get an API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Update the API key in `app.json` under `android.config.googleMaps.apiKey`

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on your device**
   - For Android: `npm run android`
   - For iOS: `npm run ios`
   - Or scan the QR code with Expo Go app

## 🏗️ Project Structure

```
Gama-Kade/
├── app/                    # Application screens and routes
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation screens
│   ├── food/              # Food detail screens
│   └── map.tsx            # Map screen
├── assets/                # Images and static assets
├── components/            # Reusable UI components
├── constants/             # App constants and data
├── context/               # React Context providers
├── services/              # API and Firebase services
└── package.json           # Dependencies and scripts
```

## 🎯 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

## 📸 Screenshots

_Add your app screenshots here_

## 🔐 Environment Variables

Create a Firebase configuration file at `services/firebaseConfig.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License

This project is licensed under the MIT License.

## 👤 Contact

**Developer Name**

- 📧 Email: [your.email@example.com](mailto:hasiduudara@gmail.com)
- 💼 LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/in/hasindu-udara)
- 🐙 GitHub: [YOUR_GITHUB_REPO_LINK_HERE](https://github.com/hasinduudara/Game_Kade_Restaurant_Food_Ordering_System.git)

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- UI inspiration from modern food delivery apps
- Icons by [@expo/vector-icons](https://icons.expo.fyi/)

---

Made with ❤️ for Sri Lankan food lovers

