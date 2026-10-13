import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to React Native Course!
      </Text>
      <Link href={'/onboarding'} className="mt-4 rounded bg-primary text-white p-4">Go To Onboarding</Link>
      <Link href={'/settings'} className="mt-4 rounded bg-primary text-white p-4">Go To Settings</Link>
      <Link href={'/(auth)/sign-in'} className="mt-4 rounded bg-primary text-white p-4">Go To Sign In</Link>
      <Link href={'/(auth)/sign-up'} className="mt-4 rounded bg-primary text-white p-4">Go To Sign Up</Link>
      <Link href={{
        pathname: '/(tabs)/subscriptions/[id]',
        params: { id: 'spotify' }
      }} className="mt-4 rounded bg-primary text-white p-4">Spotify Subscription</Link>
    </View>
  );
}