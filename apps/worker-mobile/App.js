import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { WorkerDashboardScreen } from './src/screens/WorkerDashboardScreen';
import { WorkerJobsScreen } from './src/screens/WorkerJobsScreen';
import { WorkerJobDetailScreen } from './src/screens/WorkerJobDetailScreen';
import { WorkerHistoryScreen } from './src/screens/WorkerHistoryScreen';
import { WorkerProfileScreen } from './src/screens/WorkerProfileScreen';
import { WorkerAuthScreen } from './src/screens/WorkerAuthScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { fontWeight: '900', color: '#10213F' },
        headerTintColor: '#1264F5'
      }}
    >
      <Stack.Screen name="DashboardMain" component={WorkerDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="JobDetail" component={WorkerJobDetailScreen} options={{ title: 'Job Action Console' }} />
    </Stack.Navigator>
  );
}

function JobsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { fontWeight: '900', color: '#10213F' },
        headerTintColor: '#1264F5'
      }}
    >
      <Stack.Screen name="JobsMain" component={WorkerJobsScreen} options={{ title: 'Assigned Doorstep Jobs' }} />
      <Stack.Screen name="JobDetail" component={WorkerJobDetailScreen} options={{ title: 'Job Action Console' }} />
    </Stack.Navigator>
  );
}

function WorkerTabNavigator({ onLogout }) {
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
          if (route.name === 'Dashboard') iconName = focused ? 'speedometer' : 'speedometer-outline';
          else if (route.name === 'Jobs') iconName = focused ? 'briefcase' : 'briefcase-outline';
          else if (route.name === 'History') iconName = focused ? 'time' : 'time-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Jobs" component={JobsStack} />
      <Tab.Screen name="History" component={WorkerHistoryScreen} />
      <Tab.Screen name="Profile">
        {(props) => <WorkerProfileScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState({ name: 'Venkatesh Kumar', email: 'venky@aquago.com' });

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        {user ? (
          <WorkerTabNavigator onLogout={() => setUser(null)} />
        ) : (
          <WorkerAuthScreen onLoginSuccess={(u) => setUser(u)} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
