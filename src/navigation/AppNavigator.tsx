import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/Home/HomeScreen';
import PlaceListScreen from '../screens/PlaceList/PlaceListScreen';
import PlaceDetailScreen from '../screens/PlaceDetail/PlaceDetailScreen';
import EmergencyScreen from '../screens/Emergency/EmergencyScreen';
import FavoritesScreen from '../screens/Favorites/FavoritesScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import MapViewScreen from '../screens/MapView/MapViewScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        initialRouteName="Home"
      >
        <Stack.Screen name="Home" component={HomeScreen as any} />
        <Stack.Screen name="PlaceList" component={PlaceListScreen as any} />
        <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen as any} />
        <Stack.Screen name="Emergency" component={EmergencyScreen as any} />
        <Stack.Screen name="Favorites" component={FavoritesScreen as any} />
        <Stack.Screen name="Search" component={SearchScreen as any} />
        <Stack.Screen name="MapView" component={MapViewScreen as any} />
        <Stack.Screen name="Settings" component={SettingsScreen as any} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
