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

const SafeAreaView = styled(RNSafeAreaView);

export default function ForgotPassword() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [step, setStep] = React.useState<"email" | "reset">("email");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // ── Step 1: Request reset code ──
  const handleRequestCode = async () => {
    if (!signIn) return;

    setError("");
    setIsLoading(true);

    const { error: createError } = await signIn.create({ identifier: emailAddress });
    if (createError) {
      const message = createError.longMessage || createError.message || "Something went wrong. Please try again.";
      setError(message);
      setIsLoading(false);
      return;
    }

    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) {
      const message = sendError.longMessage || sendError.message || "Something went wrong. Please try again.";
      setError(message);
      setIsLoading(false);
      return;
    }

    setStep("reset");
    setIsLoading(false);
  };

  // ── Step 2: Verify code + set new password ──
  const handleReset = async () => {
    if (!signIn) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
    setIsLoading(true);

    const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (verifyError) {
      const message = verifyError.longMessage || verifyError.message || "Invalid code. Please try again.";
      setError(message);
      setIsLoading(false);
      return;
    }

    const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({ password });
    if (submitError) {
      const message = submitError.longMessage || submitError.message || "Could not reset password. Please try again.";
      setError(message);
      setIsLoading(false);
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
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
      console.error("Reset not complete:", signIn);
      setError("Password reset could not be completed. Please try again.");
    }
    
    setIsLoading(false);
  };

  const canRequestCode = emailAddress.trim().length > 0 && !isLoading;
  const canReset =
    code.length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    !isLoading;

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

              <Text className="auth-title">
                {step === "email" ? "Reset password" : "Set new password"}
              </Text>
              <Text className="auth-subtitle">
                {step === "email"
                  ? "Enter your email and we'll send you a reset code"
                  : `Enter the code sent to ${emailAddress}`}
              </Text>
            </View>

            {/* ── Form Card ── */}
            <View className="auth-card">
              <View className="auth-form">
                {step === "email" ? (
                  <>
                    {/* Email */}
                    <View className="auth-field">
                      <Text className="auth-label">Email</Text>
                      <TextInput
                        className={`auth-input ${error ? "auth-input-error" : ""}`}
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={emailAddress}
                        placeholder="Enter your email"
                        placeholderTextColor="rgba(0,0,0,0.35)"
                        onChangeText={(val) => {
                          setEmailAddress(val);
                          setError("");
                        }}
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        autoComplete="email"
                        returnKeyType="done"
                        onSubmitEditing={
                          canRequestCode ? handleRequestCode : undefined
                        }
                        editable={!isLoading}
                      />
                    </View>

                    {/* Error */}
                    {error ? (
                      <Text className="auth-error">{error}</Text>
                    ) : null}

                    {/* Submit */}
                    <Pressable
                      className={`auth-button ${!canRequestCode ? "auth-button-disabled" : ""}`}
                      onPress={handleRequestCode}
                      disabled={!canRequestCode}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#081126" size="small" />
                      ) : (
                        <Text className="auth-button-text">Send reset code</Text>
                      )}
                    </Pressable>
                  </>
                ) : (
                  <>
                    {/* Code */}
                    <View className="auth-field">
                      <Text className="auth-label">Verification code</Text>
                      <TextInput
                        className="auth-input"
                        value={code}
                        placeholder="Enter 6-digit code"
                        placeholderTextColor="rgba(0,0,0,0.35)"
                        onChangeText={(val) => {
                          setCode(val);
                          setError("");
                        }}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        autoComplete="one-time-code"
                        returnKeyType="next"
                        editable={!isLoading}
                      />
                    </View>

                    {/* New password */}
                    <View className="auth-field">
                      <Text className="auth-label">New password</Text>
                      <TextInput
                        className="auth-input"
                        value={password}
                        placeholder="Enter new password"
                        placeholderTextColor="rgba(0,0,0,0.35)"
                        secureTextEntry
                        onChangeText={(val) => {
                          setPassword(val);
                          setError("");
                        }}
                        textContentType="newPassword"
                        autoComplete="new-password"
                        returnKeyType="next"
                        editable={!isLoading}
                      />
                      <Text className="auth-helper">
                        Must be at least 8 characters
                      </Text>
                    </View>

                    {/* Confirm password */}
                    <View className="auth-field">
                      <Text className="auth-label">Confirm password</Text>
                      <TextInput
                        className="auth-input"
                        value={confirmPassword}
                        placeholder="Re-enter new password"
                        placeholderTextColor="rgba(0,0,0,0.35)"
                        secureTextEntry
                        onChangeText={(val) => {
                          setConfirmPassword(val);
                          setError("");
                        }}
                        textContentType="newPassword"
                        returnKeyType="done"
                        onSubmitEditing={canReset ? handleReset : undefined}
                        editable={!isLoading}
                      />
                    </View>

                    {/* Error */}
                    {error ? (
                      <Text className="auth-error">{error}</Text>
                    ) : null}

                    {/* Reset */}
                    <Pressable
                      className={`auth-button ${!canReset ? "auth-button-disabled" : ""}`}
                      onPress={handleReset}
                      disabled={!canReset}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#081126" size="small" />
                      ) : (
                        <Text className="auth-button-text">
                          Reset password
                        </Text>
                      )}
                    </Pressable>

                    {/* Resend */}
                    <Pressable
                      className="auth-secondary-button"
                      onPress={handleRequestCode}
                      disabled={isLoading}
                    >
                      <Text className="auth-secondary-button-text">
                        Resend code
                      </Text>
                    </Pressable>
                  </>
                )}

                {/* Back to sign in */}
                <View className="auth-link-row">
                  <Text className="auth-link-copy">Remember your password? </Text>
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
    </SafeAreaView>
  );
}
