import { useSubscriptions } from "@/lib/subscriptions";
import { currencyFormat } from "@/lib/utils";
import dayjs, { type Dayjs, type ManipulateType } from "dayjs";
import { styled } from "nativewind";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const chartMonthCount = 6;

interface SubscriptionCharge {
    subscription: Subscription;
    date: Dayjs;
}

const getBillingUnit = (subscription: Subscription): ManipulateType | null => {
    const frequency = (subscription.frequency || subscription.billing).toLowerCase();
    if (frequency === "monthly") return "month";
    if (frequency === "yearly" || frequency === "annual" || frequency === "annually") {
        return "year";
    }
    return null;
};

const getChargesForMonth = (
    subscriptions: Subscription[],
    month: Dayjs,
): SubscriptionCharge[] => {
    const monthStart = month.startOf("month");
    const monthEnd = month.endOf("month");

    return subscriptions.flatMap((subscription) => {
        if (subscription.status !== "active") return [];

        const unit = getBillingUnit(subscription);
        const startDate = dayjs(subscription.startDate || subscription.renewalDate);
        if (!unit || !startDate.isValid() || startDate.isAfter(monthEnd, "day")) {
            return [];
        }

        const elapsedIntervals = Math.max(
            0,
            monthStart.diff(startDate.startOf("day"), unit),
        );
        let chargeDate = startDate.add(elapsedIntervals, unit);
        while (chargeDate.isBefore(monthStart, "day")) {
            chargeDate = chargeDate.add(1, unit);
        }

        const charges: SubscriptionCharge[] = [];
        while (!chargeDate.isAfter(monthEnd, "day")) {
            charges.push({ subscription, date: chargeDate });
            chargeDate = chargeDate.add(1, unit);
        }
        return charges;
    }).sort((first, second) => first.date.valueOf() - second.date.valueOf());
};

const Insights = () => {
    const { subscriptions } = useSubscriptions();
    const currentMonth = dayjs().startOf("month");
    const chartMonths = Array.from({ length: chartMonthCount }, (_, index) =>
        currentMonth.subtract(chartMonthCount - index - 1, "month"),
    );
    const monthlySpending = chartMonths.map((month) => ({
        month,
        total: getChargesForMonth(subscriptions, month).reduce(
            (total, charge) => total + charge.subscription.price,
            0,
        ),
    }));
    const maxSpending = Math.max(...monthlySpending.map(({ total }) => total), 0);
    const currentMonthCharges = getChargesForMonth(subscriptions, currentMonth);
    const currentMonthTotal = currentMonthCharges.reduce(
        (total, charge) => total + charge.subscription.price,
        0,
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                className="flex-1"
                contentContainerClassName="px-5 pt-5 pb-30"
                showsVerticalScrollIndicator={false}
            >
                <Text className="insights-title">Insights</Text>
                <Text className="insights-subtitle">
                    Your recurring subscription spending at a glance.
                </Text>

                <View className="insight-card">
                    <View className="insight-section-heading">
                        <View>
                            <Text className="insight-card-title">Monthly Spending</Text>
                            <Text className="insight-card-caption">
                                Recurring charges over the last 6 months
                            </Text>
                        </View>
                        <Text className="insight-total">{currencyFormat(currentMonthTotal)}</Text>
                    </View>

                    <View className="insight-chart">
                        {monthlySpending.map(({ month, total }) => {
                            const barHeight = maxSpending > 0
                                ? Math.max((total / maxSpending) * 132, total > 0 ? 5 : 2)
                                : 2;

                            return (
                                <View className="insight-chart-column" key={month.format("YYYY-MM")}>
                                    <Text className="insight-chart-value">
                                        {total > 0 ? currencyFormat(total) : "$0"}
                                    </Text>
                                    <View className="insight-chart-bar-track">
                                        <View
                                            className="insight-chart-bar"
                                            style={{
                                                height: barHeight,
                                                opacity: total > 0 ? 1 : 0.25,
                                            }}
                                        />
                                    </View>
                                    <Text className="insight-chart-label">
                                        {month.format("MMM")}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <View className="insight-history-heading">
                    <View>
                        <Text className="insight-card-title">
                            {currentMonth.format("MMMM")} Activity
                        </Text>
                        <Text className="insight-card-caption">
                            {currentMonthCharges.length} recurring{" "}
                            {currentMonthCharges.length === 1 ? "charge" : "charges"} this month
                        </Text>
                    </View>
                    <Text className="insight-history-total">
                        {currencyFormat(currentMonthTotal)}
                    </Text>
                </View>

                {currentMonthCharges.length > 0 ? (
                    <View className="insight-history-list">
                        {currentMonthCharges.map(({ subscription, date }, index) => {
                            const isPast = !date.isAfter(dayjs(), "day");
                            return (
                                <View
                                    className="insight-history-row"
                                    key={`${subscription.id}-${date.format("YYYY-MM-DD")}`}
                                >
                                    <Image
                                        source={subscription.icon}
                                        className="insight-history-icon"
                                    />
                                    <View className="insight-history-copy">
                                        <Text
                                            className="insight-history-name"
                                            numberOfLines={1}
                                        >
                                            {subscription.name}
                                        </Text>
                                        <Text className="insight-history-date">
                                            {date.format("MMM D")} · {isPast ? "Renewed" : "Upcoming"}
                                        </Text>
                                    </View>
                                    <Text className="insight-history-price">
                                        {currencyFormat(
                                            subscription.price,
                                            subscription.currency,
                                        )}
                                    </Text>
                                    {index < currentMonthCharges.length - 1 && (
                                        <View className="insight-history-divider" />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View className="insight-empty-card">
                        <Text className="insight-empty-title">No subscription activity yet</Text>
                        <Text className="insight-empty-copy">
                            Active recurring charges for this month will show here.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Insights;
