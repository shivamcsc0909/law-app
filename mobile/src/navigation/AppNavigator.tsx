import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import {
  Home,
  Search,
  HelpCircle,
  Briefcase,
  FolderLock,
  User,
  Scale
} from 'lucide-react-native';

import { Colors, Typography } from '../theme';
import { useAuth } from '../context/AuthContext';

// Screens
import { HomeScreen } from '../screens/feed/HomeScreen';
import { DiscoverScreen } from '../screens/discover/DiscoverScreen';
import { LegalHelpScreen } from '../screens/legal_help/LegalHelpScreen';
import { CareersScreen } from '../screens/careers/CareersScreen';
import { WorkspaceScreen } from '../screens/workspace/WorkspaceScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: Typography.fontWeights.semibold,
        },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarLabel: 'Advocates',
          tabBarIcon: ({ color, size }) => <Search size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="LegalHelp"
        component={LegalHelpScreen}
        options={{
          tabBarLabel: 'Legal Help',
          tabBarIcon: ({ color, size }) => <HelpCircle size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Careers"
        component={CareersScreen}
        options={{
          tabBarLabel: 'Careers',
          tabBarIcon: ({ color, size }) => <Briefcase size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Workspace"
        component={WorkspaceScreen}
        options={{
          tabBarLabel: 'Workspace',
          tabBarIcon: ({ color, size }) => <FolderLock size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'My Profile',
          tabBarIcon: ({ color, size }) => <User size={size - 2} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
