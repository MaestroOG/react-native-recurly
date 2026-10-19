import ListHeading from '@/components/ListHeading';
import CreateSubscriptionModal from '@/components/CreateSubscriptionModal';
import SubscriptionCard from '@/components/SubscriptionCard';
import UpcomingSubscriptionCard from '@/components/UpcomingSubscriptionCard';
import { HOME_BALANCE } from '@/constants/data';
import { icons } from '@/constants/icons';
import images from '@/constants/images';
import { currencyFormat } from '@/lib/utils';
import { useSubscriptions } from '@/lib/subscriptions';
import { useUser } from '@clerk/expo';
import dayjs from 'dayjs';
import { styled } from 'nativewind';
import { usePostHog } from 'posthog-react-native';
import React, { useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

const Home = () => {
  const { user } = useUser();
  const posthog = usePostHog();
  const { subscriptions, upcomingSubscriptions, addSubscription } = useSubscriptions();

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const displayName = user?.firstName || user?.fullName || user?.emailAddresses[0]?.emailAddress || 'User';

  const handleSubscriptionPress = (subscription: Subscription) => {
    const isExpanding = expandedId !== subscription.id;

    const subscriptionCategory = subscription.category || subscription.plan || 'uncategorized';

    posthog.capture('subscription_details_toggled', {
      billing_interval: subscription.billing,
      is_expanding: isExpanding,
      subscription_category: subscriptionCategory,
    });
    posthog.logger.info('subscription_details_toggled', {
      billing_interval: subscription.billing,
      is_expanding: isExpanding,
      subscription_category: subscriptionCategory,
    });
    setExpandedId(currentId => (currentId === subscription.id ? null : subscription.id));
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">

      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">

              <View className="home-user">
                <Image
                  source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
                  className="home-avatar"
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>

              <Pressable
                onPress={() => setCreateModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Create subscription"
              >
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className='home-balance-label'>Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">{currencyFormat(HOME_BALANCE.amount)}</Text>
                <Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}</Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text>No Upcoming Renewals Yet.</Text>}
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        className="flex-1"
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (<SubscriptionCard {...item} expanded={expandedId === item.id} onPress={() => handleSubscriptionPress(item)} />)}
        extraData={expandedId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text className='home-empty-state'>No Subscriptions Yet.</Text>
        }
        contentContainerClassName='pb-30'
      />
      <CreateSubscriptionModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={addSubscription}
      />
    </SafeAreaView>
  )
}

export default Home