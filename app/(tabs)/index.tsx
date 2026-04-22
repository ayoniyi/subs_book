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

import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 p-5  justify-center bg-background">
      <Text className=" font-sans-extrabold text-primary text-5xl">Home</Text>
      <Link
        href={"/onboarding"}
        className="mt-4 font-sans-bold rounded bg-primary p-4 text-white"
      >
        Go to Onboarding
      </Link>
      <Link
        href={"/(auth)/sign-in"}
        className="mt-4 font-sans-bold rounded bg-primary p-4 text-white"
      >
        Go to SignIn
      </Link>
      <Link
        href={"/(auth)/sign-up"}
        className="mt-4 font-sans-bold rounded bg-primary p-4 text-white"
      >
        Go to SignUp
      </Link>

      {/* <Link
        href={"/subscriptions/1"}
        className="mt-4 font-sans-bold rounded bg-primary p-4 text-white"
      >
        Go to Subscription Details
      </Link> */}
    </SafeAreaView>
  );
}
