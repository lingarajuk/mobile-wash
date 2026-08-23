import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from './src/screens/HomeScreen';
import { ServicesScreen } from './src/screens/ServicesScreen';
import { BookingFlowScreen } from './src/screens/BookingFlowScreen';
import { MyBookingsScreen } from './src/screens/MyBookingsScreen';
import { BookingDetailScreen } from './src/screens/BookingDetailScreen';
import { LiveTrackingScreen } from './src/screens/LiveTrackingScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AuthScreen } from './src/screens/AuthScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { fontWeight: '900', color: '#10213F' },
        headerTintColor: '#1264F5'
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookingFlow" component={BookingFlowScreen} options={{ title: 'Doorstep Booking' }} />
      <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} options={{ title: 'Live Technician Map' }} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: 'Booking Status & Details' }} />
    </Stack.Navigator>
  );
}

function ServicesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { fontWeight: '900', color: '#10213F' },
        headerTintColor: '#1264F5'
      }}
    >
      <Stack.Screen name="ServicesMain" component={ServicesScreen} options={{ title: 'Wash Packages' }} />
      <Stack.Screen name="BookingFlow" component={BookingFlowScreen} options={{ title: 'Doorstep Booking' }} />
    </Stack.Navigator>
  );
}

function BookingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { fontWeight: '900', color: '#10213F' },
        headerTintColor: '#1264F5'
      }}
    >
      <Stack.Screen name="MyBookingsMain" component={MyBookingsScreen} options={{ title: 'My Bookings' }} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: 'Booking Details' }} />
      <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} options={{ title: 'Live Technician Map' }} />
    </Stack.Navigator>
  );
}

function MainTabNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1264F5',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E6ECF5',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700'
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Services') iconName = focused ? 'water' : 'water-outline';
          else if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Notifications') iconName = focused ? 'notifications' : 'notifications-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Services" component={ServicesStack} />
      <Tab.Screen name="Bookings" component={BookingsStack} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState({ name: 'Rahul Sharma', email: 'rahul.sharma@example.com' });

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        {user ? (
          <MainTabNavigator onLogout={() => setUser(null)} />
        ) : (
          <AuthScreen onLoginSuccess={(u) => setUser(u)} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
