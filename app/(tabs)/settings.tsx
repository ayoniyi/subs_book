import "@/global.css";
import images from "@/constants/images";
import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const posthog = usePostHog();
  const [signingOut, setSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      posthog.capture("user_signed_out");
      posthog.reset();
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (err) {
      console.error("Sign-out error:", err);
      setSigningOut(false);
    }
  };

  const displayName =
    user?.fullName ??
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "User";

  const email = user?.primaryEmailAddress?.emailAddress ?? "—";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-6 pb-4">
          <Text className="text-2xl font-sans-bold text-primary">Settings</Text>
        </View>

        {/* ── Profile Card ── */}
        <View className="mx-5 rounded-3xl border border-border bg-card p-5">
          <View className="items-center pb-4">
            <Image
              source={
                user?.imageUrl ? { uri: user.imageUrl } : images.avatar
              }
              className="size-24 rounded-full"
            />
            <Text className="mt-4 text-xl font-sans-bold text-primary">
              {displayName}
            </Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
              {email}
            </Text>
          </View>

          {/* Divider */}
          <View className="auth-divider-row">
            <View className="auth-divider-line" />
            <Text className="auth-divider-text">Profile details</Text>
            <View className="auth-divider-line" />
          </View>

          {/* Info Rows */}
          <View className="gap-4">
            <SettingsRow label="Full name" value={displayName} />
            <SettingsRow label="Email" value={email} />
            <SettingsRow label="Member since" value={memberSince} />
            <SettingsRow
              label="User ID"
              value={user?.id?.slice(0, 16) + "…" || "—"}
            />
          </View>
        </View>

        {/* ── Account Section ── */}
        <View className="mx-5 mt-6 gap-3">
          <Text className="mb-1 text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
            Account
          </Text>

          {/* Sign Out */}
          <Pressable
            className="items-center rounded-2xl bg-accent py-4"
            onPress={handleSignOut}
            disabled={signingOut}
            style={signingOut ? { opacity: 0.5 } : undefined}
          >
            {signingOut ? (
              <ActivityIndicator color="#081126" size="small" />
            ) : (
              <Text className="text-base font-sans-bold text-primary">
                Sign out
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/* ── Reusable info row ── */
const SettingsRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-center justify-between gap-3">
    <Text className="shrink-0 text-sm font-sans-medium text-muted-foreground">
      {label}
    </Text>
    <Text
      className="flex-1 text-right text-sm font-sans-bold text-primary"
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {value}
    </Text>
  </View>
);

export default Settings;
