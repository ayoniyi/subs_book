import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SignUp = () => {
  return (
    <View>
      <Text>SignUp</Text>
      <Link href={"/(auth)/sign-in"}>
        <Text>Go to Onboarding</Text>
      </Link>
    </View>
  );
};

export default SignUp;
