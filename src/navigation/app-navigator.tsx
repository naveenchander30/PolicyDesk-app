import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DashboardScreen from "@/features/dashboard/dashboard-screen";
import ClientListScreen from "@/features/clients/client-list-screen";
import ClientDetailScreen from "@/features/clients/client-detail-screen";
import ClientFormScreen from "@/features/clients/client-form-screen";
import PolicyListScreen from "@/features/policies/policy-list-screen";
import PolicyDetailScreen from "@/features/policies/policy-detail-screen";
import PolicyFormScreen from "@/features/policies/policy-form-screen";
import PaymentListScreen from "@/features/payments/payment-list-screen";
import PaymentFormScreen from "@/features/payments/payment-form-screen";

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const ClientsStack = createNativeStackNavigator();
const PoliciesStack = createNativeStackNavigator();
const PaymentsStack = createNativeStackNavigator();

function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator>
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} options={{ title: "Dashboard" }} />
    </DashboardStack.Navigator>
  );
}

function ClientsStackScreen() {
  return (
    <ClientsStack.Navigator>
      <ClientsStack.Screen name="ClientList" component={ClientListScreen} options={{ title: "Clients" }} />
      <ClientsStack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: "Client" }} />
      <ClientsStack.Screen name="ClientCreate" component={ClientFormScreen} options={{ title: "New Client" }} />
      <ClientsStack.Screen name="ClientEdit" component={ClientFormScreen} options={{ title: "Edit Client" }} />
    </ClientsStack.Navigator>
  );
}

function PoliciesStackScreen() {
  return (
    <PoliciesStack.Navigator>
      <PoliciesStack.Screen name="PolicyList" component={PolicyListScreen} options={{ title: "Policies" }} />
      <PoliciesStack.Screen name="PolicyDetail" component={PolicyDetailScreen} options={{ title: "Policy" }} />
      <PoliciesStack.Screen name="PolicyCreate" component={PolicyFormScreen} options={{ title: "New Policy" }} />
      <PoliciesStack.Screen name="PolicyEdit" component={PolicyFormScreen} options={{ title: "Edit Policy" }} />
    </PoliciesStack.Navigator>
  );
}

function PaymentsStackScreen() {
  return (
    <PaymentsStack.Navigator>
      <PaymentsStack.Screen name="PaymentList" component={PaymentListScreen} options={{ title: "Payments" }} />
      <PaymentsStack.Screen name="PaymentCreate" component={PaymentFormScreen} options={{ title: "New Payment" }} />
    </PaymentsStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            const icons: Record<string, string> = {
              Dashboard: "view-dashboard",
              Clients: "account-group",
              Policies: "file-document",
              Payments: "currency-usd",
            };
            return <MaterialCommunityIcons name={icons[route.name]} size={size} color={color} />;
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardStackScreen} />
        <Tab.Screen name="Clients" component={ClientsStackScreen} />
        <Tab.Screen name="Policies" component={PoliciesStackScreen} />
        <Tab.Screen name="Payments" component={PaymentsStackScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
