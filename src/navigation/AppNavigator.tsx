import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { ChatProvider } from '../chat/ChatContext';
import { Loading } from '../components/ui';
import { TAB_BAR_GAP } from '../hooks/useTabBarSpace';
import { colors, fonts } from '../theme';
import type { AuthStackParams, RootStackParams, TabParams } from './types';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { DonationsScreen } from '../screens/DonationsScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { ReservationsScreen } from '../screens/ReservationsScreen';
import { DonationDetailScreen } from '../screens/DonationDetailScreen';
import { DonationFormScreen } from '../screens/DonationFormScreen';
import { PickupScreen } from '../screens/PickupScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { AdminScreen } from '../screens/AdminScreen';

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const Root = createNativeStackNavigator<RootStackParams>();
const Tabs = createBottomTabNavigator<TabParams>();
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.green,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};
const header = {
  headerTitleStyle: { fontFamily: fonts.bold },
  headerShadowVisible: false,
  headerTintColor: colors.green,
  headerStyle: { backgroundColor: colors.background },
};
const tabIcons: Record<keyof TabParams, keyof typeof Ionicons.glyphMap> = {
  Admin: 'shield-checkmark-outline',
  Home: 'home-outline',
  Donations: 'basket-outline',
  Explore: 'compass-outline',
  Reservations: 'bag-handle-outline',
  Chat: 'chatbubbles-outline',
  Account: 'person-outline',
};
const tabScreenOptions =
  (bottomInset: number) =>
  ({ route }: { route: { name: keyof TabParams } }) => ({
    ...header,
    tabBarActiveTintColor: colors.green,
    tabBarInactiveTintColor: colors.muted,
    tabBarLabel: ({
      focused,
      color,
      children,
    }: {
      focused: boolean;
      color: string;
      children: string;
    }) => (
      <View style={{ alignItems: 'center', gap: 3 }}>
        <Text style={{ fontFamily: fonts.bold, fontSize: 11, color }}>{children}</Text>
        <View
          style={{
            width: 22,
            height: 3,
            borderRadius: 2,
            backgroundColor: focused ? colors.green : 'transparent',
          }}
        />
      </View>
    ),
    tabBarStyle: {
      position: 'absolute' as const,
      left: 16,
      right: 16,
      bottom: bottomInset + TAB_BAR_GAP,
      height: 68,
      paddingTop: 8,
      paddingBottom: 6,
      borderRadius: 28,
      borderTopWidth: 0,
      backgroundColor: colors.surface,
      shadowColor: '#0B2B21',
      shadowOpacity: 0.14,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 14,
    },
    tabBarHideOnKeyboard: true,
    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
      <Ionicons name={tabIcons[route.name]} size={size} color={color} />
    ),
  });
function AdminTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs.Navigator screenOptions={tabScreenOptions(insets.bottom)}>
      <Tabs.Screen
        name="Admin"
        component={AdminScreen}
        options={{ title: 'Cadastros', headerTitle: 'Painel administrativo' }}
      />
      <Tabs.Screen
        name="Account"
        component={AccountScreen}
        options={{ title: 'Conta', headerShown: false }}
      />
    </Tabs.Navigator>
  );
}
function MainTabs() {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  return (
    <Tabs.Navigator screenOptions={tabScreenOptions(insets.bottom)}>
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Início', headerShown: false }}
      />
      {session?.papel === 'DOADOR' ? (
        <Tabs.Screen name="Donations" component={DonationsScreen} options={{ title: 'Doações' }} />
      ) : (
        <>
          <Tabs.Screen name="Explore" component={ExploreScreen} options={{ title: 'Explorar' }} />
          <Tabs.Screen
            name="Reservations"
            component={ReservationsScreen}
            options={{ title: 'Reservas' }}
          />
        </>
      )}
      <Tabs.Screen name="Chat" component={ChatScreen} options={{ title: 'Assistente IA' }} />
      <Tabs.Screen
        name="Account"
        component={AccountScreen}
        options={{ title: 'Conta', headerShown: false }}
      />
    </Tabs.Navigator>
  );
}
function PrivateNavigation() {
  const { session } = useAuth();
  return (
    <ChatProvider>
      <Root.Navigator screenOptions={header}>
        {session?.papel === 'ADMIN' ? (
          <Root.Screen name="Main" component={AdminTabs} options={{ headerShown: false }} />
        ) : (
          <>
            <Root.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Root.Screen
              name="Details"
              component={DonationDetailScreen}
              options={{ title: 'Detalhes da doação' }}
            />
            {session?.papel === 'DOADOR' && (
              <>
                <Root.Screen
                  name="Create"
                  component={DonationFormScreen}
                  options={{ title: 'Nova doação' }}
                />
                <Root.Screen
                  name="Edit"
                  component={DonationFormScreen}
                  options={{ title: 'Editar doação' }}
                />
                <Root.Screen
                  name="Pickup"
                  component={PickupScreen}
                  options={{ title: 'Retirada' }}
                />
              </>
            )}
          </>
        )}
        <Root.Screen name="About" component={AboutScreen} options={{ title: 'Sobre o App' }} />
      </Root.Navigator>
    </ChatProvider>
  );
}
export function AppNavigator() {
  const { session, restoring } = useAuth();
  if (restoring) return <Loading />;
  return (
    <NavigationContainer theme={theme}>
      {session ? (
        <PrivateNavigation key={`${session.usuarioId}-${session.token}`} />
      ) : (
        <AuthStack.Navigator screenOptions={header}>
          <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Bem-vindo' }} />
          <AuthStack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Cadastro' }}
          />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
