import "@/global.css";
import { useAuth, useSignUp } from "@clerk/expo";
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

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  const isLoading = fetchStatus === "fetching";

  // ── Step 1: Create account ──
  const handleSubmit = async () => {
    const { error } = await signUp.password({
      emailAddress,
      password,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      posthog.capture("user_sign_up_failed");
      return;
    }

    // Trigger verification
    if (!error) await signUp.verifications.sendEmailCode();
  };

  // ── Step 2: Verify ──
  const handleVerify = async () => {
    posthog.capture("verification_code_submitted");

    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      // Use the Clerk user ID (non-PII) as the PostHog distinct ID
      if (signUp.createdUserId) {
        posthog.identify(signUp.createdUserId, {
          $set_once: { sign_up_date: new Date().toISOString() },
        });
      }
      posthog.capture("user_signed_up");

      await signUp.finalize({
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
    } else {
      console.error("Sign-up attempt not complete:", signUp);
    }
  };

  // Already signed in or just completed — show nothing
  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  // ── Verification Screen ──
  const isVerifying =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  if (isVerifying) {
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

                <Text className="auth-title">Verify your email</Text>
                <Text className="auth-subtitle">
                  We sent a verification code to{"\n"}
                  {emailAddress}
                </Text>
              </View>

              {/* ── Verification Card ── */}
              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className={`auth-input ${errors?.fields?.code ? "auth-input-error" : ""}`}
                      value={code}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      autoComplete="one-time-code"
                      returnKeyType="done"
                      onSubmitEditing={
                        code.length > 0 && !isLoading
                          ? handleVerify
                          : undefined
                      }
                      editable={!isLoading}
                    />
                    {errors?.fields?.code && (
                      <Text className="auth-error">
                        {errors.fields.code.message}
                      </Text>
                    )}
                  </View>

                  {/* Verify */}
                  <Pressable
                    className={`auth-button ${code.length === 0 || isLoading ? "auth-button-disabled" : ""}`}
                    onPress={handleVerify}
                    disabled={code.length === 0 || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#081126" size="small" />
                    ) : (
                      <Text className="auth-button-text">
                        Verify &amp; continue
                      </Text>
                    )}
                  </Pressable>

                  {/* Resend */}
                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signUp.verifications.sendEmailCode()}
                    disabled={isLoading}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
                    </Text>
                  </Pressable>

                  {/* Global errors */}
                  {errors?.global && errors.global.length > 0 && (
                    <Text className="auth-error">
                      {errors.global[0]?.longMessage || errors.global[0]?.message}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Registration Screen ──
  const canSubmit =
    emailAddress.trim().length > 0 && password.length > 0 && !isLoading;

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

              <Text className="auth-title">Create your account</Text>
              <Text className="auth-subtitle">
                Start tracking and managing all your subscriptions
              </Text>
            </View>

            {/* ── Form Card ── */}
            <View className="auth-card">
              <View className="auth-form">
                {/* Email */}
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={`auth-input ${errors?.fields?.emailAddress ? "auth-input-error" : ""}`}
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
                  {errors?.fields?.emailAddress && (
                    <Text className="auth-error">
                      {errors.fields.emailAddress.message}
                    </Text>
                  )}
                </View>

                {/* Password */}
                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input ${errors?.fields?.password ? "auth-input-error" : ""}`}
                    value={password}
                    placeholder="Create a password"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    secureTextEntry
                    onChangeText={setPassword}
                    textContentType="newPassword"
                    autoComplete="new-password"
                    returnKeyType="done"
                    onSubmitEditing={canSubmit ? handleSubmit : undefined}
                    editable={!isLoading}
                  />
                  {errors?.fields?.password && (
                    <Text className="auth-error">
                      {errors.fields.password.message}
                    </Text>
                  )}
                  <Text className="auth-helper">
                    Must be at least 8 characters
                  </Text>
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
                    <Text className="auth-button-text">Create account</Text>
                  )}
                </Pressable>

                {/* Global errors */}
                {errors?.global && errors.global.length > 0 && (
                  <Text className="auth-error">
                    {errors.global[0]?.longMessage || errors.global[0]?.message}
                  </Text>
                )}

                {/* Link to Sign In */}
                <View className="auth-link-row">
                  <Text className="auth-link-copy">
                    Already have an account?{" "}
                  </Text>
                  <Link href="/(auth)/sign-in" asChild>
                    <Pressable>
                      <Text className="auth-link">Sign in</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Required for Clerk bot protection */}
      <View nativeID="clerk-captcha" />
    </SafeAreaView>
  );
}
