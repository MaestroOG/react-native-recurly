import "@/global.css";
import { PostHogAppProvider } from "@/lib/posthog";
import { SubscriptionsProvider } from "@/lib/subscriptions";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

const publishableKey = String(process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) ?? "";

if (!publishableKey) {
  throw new Error("Missing Publishable Key. Please add it to your .env file");
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(
    {
      'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
      'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
      'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
      'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
      'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
      'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf')
    }
  )

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null;
  }
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <PostHogAppProvider>
        <SubscriptionsProvider>
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(auth)"
              options={{ headerShown: false }}
            />
          </Stack>
        </SubscriptionsProvider>
      </PostHogAppProvider>
    </ClerkProvider>
  );
}
