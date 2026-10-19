import { icons } from "@/constants/icons";
import clsx from "clsx";
import dayjs from "dayjs";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

const categories = [
    "Entertainment",
    "AI Tools",
    "Developer Tools",
    "Design",
    "Productivity",
    "Cloud",
    "Music",
    "Other",
] as const;

type Category = (typeof categories)[number];
type Frequency = "Monthly" | "Yearly";

const categoryColors: Record<Category, string> = {
    Entertainment: "#b8d4e3",
    "AI Tools": "#d8c4f1",
    "Developer Tools": "#e8def8",
    Design: "#f5c542",
    Productivity: "#b8e8d0",
    Cloud: "#a9c8e8",
    Music: "#f2b5a7",
    Other: "#8fd1bd",
};

interface CreateSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (subscription: Subscription) => void;
}

const CreateSubscriptionModal = ({
    visible,
    onClose,
    onCreate,
}: CreateSubscriptionModalProps) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [frequency, setFrequency] = useState<Frequency>("Monthly");
    const [category, setCategory] = useState<Category>("Other");
    const [nameTouched, setNameTouched] = useState(false);
    const [priceTouched, setPriceTouched] = useState(false);

    const parsedPrice = Number(price.trim());
    const nameValid = name.trim().length > 0;
    const priceValid = Number.isFinite(parsedPrice) && parsedPrice > 0;
    const formValid = nameValid && priceValid;

    const resetForm = () => {
        setName("");
        setPrice("");
        setFrequency("Monthly");
        setCategory("Other");
        setNameTouched(false);
        setPriceTouched(false);
    };

    const closeModal = () => {
        onClose();
    };

    const handleSubmit = () => {
        setNameTouched(true);
        setPriceTouched(true);

        if (!formValid) {
            return;
        }

        const startDate = dayjs();
        const subscription: Subscription = {
            id: `subscription-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: name.trim(),
            price: parsedPrice,
            currency: "USD",
            frequency,
            category,
            status: "active",
            startDate: startDate.toISOString(),
            renewalDate: startDate
                .add(1, frequency === "Yearly" ? "year" : "month")
                .toISOString(),
            icon: icons.wallet,
            billing: frequency,
            color: categoryColors[category],
        };

        onCreate(subscription);
        resetForm();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            presentationStyle="overFullScreen"
            statusBarTranslucent
            navigationBarTranslucent
            onRequestClose={closeModal}
        >
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View className="modal-overlay">
                    <BlurView
                        className="absolute inset-0"
                        intensity={32}
                        tint="dark"
                        experimentalBlurMethod="dimezisBlurView"
                        pointerEvents="none"
                    />
                    <Pressable
                        className="absolute inset-0"
                        onPress={closeModal}
                        accessibilityLabel="Close new subscription dialog"
                    />
                    <View className="modal-container">
                        <View className="modal-header">
                            <Text className="modal-title">New Subscription</Text>
                            <Pressable
                                className="modal-close"
                                onPress={closeModal}
                                accessibilityRole="button"
                                accessibilityLabel="Close"
                            >
                                <Text className="modal-close-text">×</Text>
                            </Pressable>
                        </View>

                        <ScrollView
                            className="modal-body"
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View className="auth-field">
                                <Text className="auth-label">Name</Text>
                                <TextInput
                                    className={clsx(
                                        "auth-input",
                                        nameTouched && !nameValid && "auth-input-error",
                                    )}
                                    value={name}
                                    onChangeText={setName}
                                    onBlur={() => setNameTouched(true)}
                                    placeholder="e.g. Netflix"
                                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                    returnKeyType="next"
                                    accessibilityLabel="Subscription name"
                                />
                                {nameTouched && !nameValid && (
                                    <Text className="auth-error">Name is required.</Text>
                                )}
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label">Price</Text>
                                <TextInput
                                    className={clsx(
                                        "auth-input",
                                        priceTouched && !priceValid && "auth-input-error",
                                    )}
                                    value={price}
                                    onChangeText={setPrice}
                                    onBlur={() => setPriceTouched(true)}
                                    placeholder="0.00"
                                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                    keyboardType="decimal-pad"
                                    accessibilityLabel="Subscription price"
                                />
                                {priceTouched && !priceValid && (
                                    <Text className="auth-error">
                                        Enter a price greater than zero.
                                    </Text>
                                )}
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label">Frequency</Text>
                                <View className="picker-row">
                                    {(["Monthly", "Yearly"] as const).map((option) => {
                                        const active = frequency === option;
                                        return (
                                            <Pressable
                                                key={option}
                                                className={clsx(
                                                    "picker-option",
                                                    active && "picker-option-active",
                                                )}
                                                onPress={() => setFrequency(option)}
                                                accessibilityRole="button"
                                                accessibilityState={{ selected: active }}
                                            >
                                                <Text
                                                    className={clsx(
                                                        "picker-option-text",
                                                        active && "picker-option-text-active",
                                                    )}
                                                >
                                                    {option}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label">Category</Text>
                                <View className="category-scroll">
                                    {categories.map((option) => {
                                        const active = category === option;
                                        return (
                                            <Pressable
                                                key={option}
                                                className={clsx(
                                                    "category-chip",
                                                    active && "category-chip-active",
                                                )}
                                                onPress={() => setCategory(option)}
                                                accessibilityRole="button"
                                                accessibilityState={{ selected: active }}
                                            >
                                                <Text
                                                    className={clsx(
                                                        "category-chip-text",
                                                        active && "category-chip-text-active",
                                                    )}
                                                >
                                                    {option}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>

                            <Pressable
                                className={clsx(
                                    "auth-button",
                                    !formValid && "auth-button-disabled",
                                )}
                                onPress={handleSubmit}
                                disabled={!formValid}
                                accessibilityRole="button"
                                accessibilityState={{ disabled: !formValid }}
                            >
                                <Text className="auth-button-text">Create Subscription</Text>
                            </Pressable>
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default CreateSubscriptionModal;
