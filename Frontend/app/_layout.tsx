import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
 
function RootGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router   = useRouter();

  const segment = segments[0];
  const inAuth  = segment === '(auth)';
 
  useEffect(() => {
    if (isLoading) return;
 
    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && inAuth) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments, router]);
 
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#060D1F' }}>
        <ActivityIndicator size="large" color="#34D399" />
      </View>
    );
  }
 
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)"  options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)"  options={{ headerShown: false }} />
      <Stack.Screen name="result/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="result/chart"   options={{ headerShown: false }} />
      <Stack.Screen name="result/reference" options={{ headerShown: false }} />
      <Stack.Screen name="admin"   options={{ headerShown: false }} />
    </Stack>
  );
}
 
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootGuard />
    </AuthProvider>
  );
}