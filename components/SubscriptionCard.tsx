import { currencyFormat } from '@/lib/utils'
import clsx from 'clsx'
import dayjs from 'dayjs'
import React from 'react'
import { Image, Pressable, Text, View } from 'react-native'

const SubscriptionCard = ({ name, price, currency, icon, billing, color, category, plan, renewalDate, onPress, expanded, paymentMethod, startDate }: SubscriptionCardProps) => {
    return (
        <Pressable onPress={onPress} className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")} style={!expanded && color ? { backgroundColor: color } : {}}>
            <View className="sub-head">
                <View className="sub-main">
                    <Image
                        source={icon}
                        className="sub-icon"
                    />
                    <View className="sub-copy">
                        <Text numberOfLines={1} className="sub-title">{name}</Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' className="sub-meta">{category?.trim() || plan?.trim() || (renewalDate && dayjs(renewalDate).format("MM/DD"))}</Text>
                    </View>
                </View>

                <View className='sub-price-box'>
                    <Text className="sub-price">{currencyFormat(price, currency)}</Text>
                    <Text className="sub-billing">{billing}</Text>
                </View>
            </View>

            {expanded && (
                <View className="sub-body">
                    <View className="sub-details">
                        <View className="sub-row">
                            <View className='sub-row-copy'>
                                <Text className='sub-label'>Payment:</Text>
                                <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{paymentMethod?.trim()}</Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className='sub-row-copy'>
                                <Text className='sub-label'>Category:</Text>
                                <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{category?.trim() || plan?.trim()}</Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className='sub-row-copy'>
                                <Text className='sub-label'>Started:</Text>
                                <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{startDate ? dayjs(startDate).format("MM/DD/YYYY") : ""}</Text>
                            </View>
                        </View>
                        <View className="sub-row">
                            <View className='sub-row-copy'>
                                <Text className='sub-label'>Renewal Date:</Text>
                                <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{renewalDate ? dayjs(renewalDate).format("MM/DD/YYYY") : ""}</Text>
                            </View>
                        </View>
                    </View>

                </View>
            )}
        </Pressable>
    )
}

export default SubscriptionCard