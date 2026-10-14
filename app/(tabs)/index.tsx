import { Link } from 'expo-router';
import { styled } from 'nativewind';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

const Home = () => {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-5xl font-sans-bold text-primary">Home</Text>
      <Link href="/settings" className="mt-4 rounded bg-white font-sans-bold px-4 py-2">Go To Setting</Link>
    </SafeAreaView>
  )
}

export default Home