import "@/global.css";
import { useSignIn } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

  const isLoading = fetchStatus === "fetching";
  const canSubmit =
    emailAddress.trim().length > 0 && password.length > 0 && !isLoading;

  const handleSubmit = async () => {
    const { error } = await signIn.password({
      emailAddress,
      password,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      posthog.capture("user_sign_in_failed");
      return;
    }

    if (signIn.status === "complete") {
      // Use the Clerk user ID (non-PII) as the PostHog distinct ID
      if (signIn.createdUserId) {
        posthog.identify(signIn.createdUserId, {
          $set_once: { first_sign_in_date: new Date().toISOString() },
        });
      }
      posthog.capture("user_signed_in", {
        method: "password",
      });

      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          // Handle session tasks
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as Href);
          }
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      // MFA — not implemented in this flow
      console.error("MFA required:", signIn);
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="auth-screen"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            {/* ── Brand Block ── */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurly</Text>
                  <Text className="auth-wordmark-sub">Smart Billing</Text>
                </View>
              </View>

              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">
                Sign in to continue managing your subscriptions
              </Text>
            </View>

            {/* ── Form Card ── */}
            <View className="auth-card">
              <View className="auth-form">
                {/* Email */}
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={`auth-input ${errors?.fields?.identifier ? "auth-input-error" : ""}`}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={emailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    onChangeText={setEmailAddress}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                    returnKeyType="next"
                    editable={!isLoading}
                  />
                  {errors?.fields?.identifier && (
                    <Text className="auth-error">
                      {errors.fields.identifier.message}
                    </Text>
                  )}
                </View>

                {/* Password */}
                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input ${errors?.fields?.password ? "auth-input-error" : ""}`}
                    value={password}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    secureTextEntry
                    onChangeText={setPassword}
                    textContentType="password"
                    autoComplete="password"
                    returnKeyType="done"
                    onSubmitEditing={canSubmit ? handleSubmit : undefined}
                    editable={!isLoading}
                  />
                  {errors?.fields?.password && (
                    <Text className="auth-error">
                      {errors.fields.password.message}
                    </Text>
                  )}
                </View>

                {/* Forgot password */}
                <View className="items-end -mt-1">
                  <Link href="/(auth)/forgot-password" asChild>
                    <Pressable>
                      <Text className="auth-link">Forgot password?</Text>
                    </Pressable>
                  </Link>
                </View>

                {/* Submit */}
                <Pressable
                  className={`auth-button ${!canSubmit ? "auth-button-disabled" : ""}`}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#081126" size="small" />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </Pressable>

                {/* Global / non-field errors */}
                {errors?.global && errors.global.length > 0 && (
                  <Text className="auth-error">
                    {errors.global[0]?.longMessage || errors.global[0]?.message}
                  </Text>
                )}

                {/* Link to Sign Up */}
                <View className="auth-link-row">
                  <Text className="auth-link-copy">New to Recurly? </Text>
                  <Link href="/(auth)/sign-up" asChild>
                    <Pressable>
                      <Text className="auth-link">Create an account</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
