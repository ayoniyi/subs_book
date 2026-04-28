import { Link, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { usePostHog } from "posthog-react-native";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("subscription_detail_viewed", {
      subscription_id: id,
    });
  }, [id, posthog]);

  return (
    <View>
      <Text>SubscriptionDetails</Text>
      <Link href="/subscriptions">Back</Link>
    </View>
  );
};

export default SubscriptionDetails;
