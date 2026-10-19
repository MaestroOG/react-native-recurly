import { INITIAL_SUBSCRIPTIONS } from "@/constants/data";
import dayjs from "dayjs";
import React, { createContext, useContext, useState } from "react";

interface SubscriptionsContextValue {
    subscriptions: Subscription[];
    upcomingSubscriptions: UpcomingSubscription[];
    addSubscription: (subscription: Subscription) => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(null);

export const SubscriptionsProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);

    const today = dayjs().startOf("day");
    const upcomingSubscriptions = subscriptions.flatMap((subscription) => {
        if (subscription.status !== "active" || !subscription.renewalDate) {
            return [];
        }

        const frequency = subscription.frequency || subscription.billing;
        const unit = frequency.toLowerCase() === "monthly"
            ? "month"
            : frequency.toLowerCase() === "yearly"
                ? "year"
                : null;

        if (!unit) {
            return [];
        }

        const renewalDate = dayjs(subscription.renewalDate);
        if (!renewalDate.isValid()) {
            return [];
        }

        const elapsedIntervals = Math.max(0, today.diff(renewalDate.startOf("day"), unit));
        let nextRenewal = renewalDate.add(elapsedIntervals, unit);
        if (nextRenewal.isBefore(today, "day")) {
            nextRenewal = renewalDate.add(elapsedIntervals + 1, unit);
        }

        return [{
            id: subscription.id,
            icon: subscription.icon,
            name: subscription.name,
            price: subscription.price,
            currency: subscription.currency,
            daysLeft: nextRenewal.startOf("day").diff(today, "day"),
        }];
    }).sort((first, second) => first.daysLeft - second.daysLeft);

    const addSubscription = (subscription: Subscription) => {
        setSubscriptions((currentSubscriptions) => [
            subscription,
            ...currentSubscriptions,
        ]);
    };

    return (
        <SubscriptionsContext.Provider
            value={{ subscriptions, upcomingSubscriptions, addSubscription }}
        >
            {children}
        </SubscriptionsContext.Provider>
    );
};

export const useSubscriptions = () => {
    const context = useContext(SubscriptionsContext);

    if (!context) {
        throw new Error("useSubscriptions must be used within a SubscriptionsProvider.");
    }

    return context;
};
