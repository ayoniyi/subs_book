// import { Text, View } from "react-native";

// export default function Index() {
//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Text>Edit app/index.tsx to edit this screen.</Text>
//     </View>
//   );
// }

import "@/global.css";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link
        href={"/onboarding"}
        className="mt-4 rounded bg-primary p-4 text-white"
      >
        Go to Onboarding
      </Link>
      <Link
        href={"/(auth)/sign-in"}
        className="mt-4 rounded bg-primary p-4 text-white"
      >
        Go to SignIn
      </Link>
      <Link
        href={"/(auth)/sign-up"}
        className="mt-4 rounded bg-primary p-4 text-white"
      >
        Go to SignUp
      </Link>

      <Link
        href={"/(tabs)/subscriptions/1"}
        className="mt-4 rounded bg-primary p-4 text-white"
      >
        Go to Subscription Details
      </Link>
    </View>
  );
}
