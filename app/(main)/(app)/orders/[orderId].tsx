import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';

import { useGetOrderById } from '@/api/order-api';
import { FalllBackMesage } from '@/components/fall-back-message';
import { MapPinned } from '@/components/icons/map-pinned';
import { MessageSquareDiff } from '@/components/icons/message-square-diff';
import { AppOrderedItems } from '@/components/orders/app-ordered-items';
import { Invoice } from '@/components/orders/invoice';
import { OrderChange } from '@/components/orders/order-change';
import { OrderDetailsCard } from '@/components/orders/order-details-card';
import { OrderPopOver } from '@/components/orders/order-popover';
import { OrderTrackingDetailsModal } from '@/components/orders/order-tracking-details-modal';
import { OrderedItems } from '@/components/orders/ordered-items';
import { PaymentInfo } from '@/components/orders/payment-info';
import { UpdateAddressAlert } from '@/components/orders/update-address-alert';
import { UpdateTrackingInfo } from '@/components/orders/update-tracking-info';
import { UserReview } from '@/components/orders/user-review';
import { RefreshingIcon } from '@/components/refreshing-icon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { H4, P } from '@/components/ui/typography';
import { isweb } from '@/constants/data';
import { transformOrderDetails } from '@/data/order/get-orders';
import useI18n from '@/hooks/useI81n';
import { dateTimestampFormatter } from '@/utils/date';

const OrderDetailScreen = () => {
  const accordionRef = useRef<View>(null);
  const [value, setValue] = useState<string | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { getText } = useI18n();
  const {
    data: order,
    isPending,
    refetch,
  } = useGetOrderById({
    id: Number(params.orderId),
  });

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Stack.Screen
          options={{
            title: 'Loading...',
            headerBackTitle: 'back',
          }}
        />
      </View>
    );
  }

  if (!order) return <FalllBackMesage className="flex-1" message="Order not found" />;

  const {
    canShipOrder,
    canApproveAddressUpdate,
    canUpdateAddress,
    isOrderChanged,
    showUserReviews,
    trackingDetailsAvailable,
  } = transformOrderDetails(order);

  return (
    <View className="flex-1 bg-background p-3 md:p-6">
      <RefreshingIcon refreshing={refreshing} />
      <Stack.Screen
        options={{
          title: '#' + order?.transactionId.toString(),
          headerRight: () => (
            <OrderPopOver
              orderId={order?.transactionId}
              canComment={order?.canComment}
              canUpdateAddress={canUpdateAddress}
              orderStatus={order?.orderStatus}
              userId={order?.userDetail?.id}
            />
          ),
          headerBackTitle: 'back',
        }}
      />
      <ScrollView
        scrollEventThrottle={16}
        ref={scrollViewRef}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              refetch().finally(() => setRefreshing(false));
            }}
          />
        }
        showsVerticalScrollIndicator={false}
        className="flex-1 p-2"
        style={{ paddingBottom: 50 }}>
        {canApproveAddressUpdate && (
          <UpdateAddressAlert
            isSellerRequest={order.updateAddressRequest?.sellerRequest}
            orderId={Number(params.orderId)}
          />
        )}

        <View className="flex-row justify-between gap-2 p-4">
          <View className="flex-row items-center gap-3">
            <H4>{getText('order_date')}:</H4>
            <P className="native:sm:text-base native:text-sm pt-1">
              {dateTimestampFormatter(order.transactionDateTimestamp)}
            </P>
          </View>
          {isweb && order?.orderStatus !== 'CANCELLED' && (
            <View className="flex md:hidden">
              <OrderPopOver
                orderStatus={order.orderStatus}
                orderId={order.transactionId}
                canComment={order?.canComment}
                canUpdateAddress={canUpdateAddress}
                userId={order?.userDetail?.id}
              />
            </View>
          )}
          {isweb && (
            <View className="hidden flex-row flex-wrap gap-2 md:flex">
              {canShipOrder && <UpdateTrackingInfo order={order} />}
              {isOrderChanged && (
                <OrderChange
                  variant="secondary"
                  className="h-9"
                  orderId={params.orderId as string}
                  progress={order.orderProgress}
                />
              )}
              {trackingDetailsAvailable && <OrderTrackingDetailsModal />}
              <Button
                onPress={() => router.push(`/chat/${order.userDetail.id}`)}
                className="h-9 flex-row gap-1"
                variant="secondary">
                <MessageSquareDiff size={16} className="text-accent-foreground" />
                <P className="text-accent-foreground">
                  {order.canComment ? getText('send_message') : getText('view_messages')}
                </P>
              </Button>
              {canUpdateAddress && (
                <Link asChild href={`/orders/${order.transactionId}/update-address`}>
                  <Button variant="secondary" className="h-9 flex-row items-center gap-1">
                    <MapPinned size={16} className="text-accent-foreground" />
                    <P className="text-accent-foreground">{getText('update_address')}</P>
                  </Button>
                </Link>
              )}
              <Invoice orderId={order.transactionId} />
            </View>
          )}
        </View>
        <View className="flex-1 gap-y-8 pb-10">
          <View className="gap-5 web:md:flex-row web:md:items-start">
            <OrderDetailsCard order={order} />
            <Card className="native:flex native:flex-1 w-full p-2 shadow-none web:flex sm:w-auto web:md:hidden">
              <Accordion
                value={value}
                onValueChange={(v) => {
                  setValue(value);
                  if (v === 'order_items') {
                    accordionRef.current?.measure((fx, fy, width, height, px, py) => {
                      scrollViewRef.current?.scrollTo({
                        y: py - 100,
                        animated: true,
                      });
                    });
                  } else {
                    scrollViewRef.current?.scrollTo({
                      y: 0,
                      animated: true,
                    });
                  }
                }}
                type="single"
                collapsable>
                <AccordionItem
                  ref={accordionRef}
                  value="order_items"
                  className="border-transparent">
                  <AccordionTrigger className="flex-row justify-between p-3">
                    <P className="font-semibold">
                      {getText('order_items')} ({order.items.length})
                    </P>
                  </AccordionTrigger>
                  <AccordionContent>
                    <View className="gap-2 pt-2">
                      {order.items.map((items, index) => (
                        <View key={items.id + index} className="flex-1">
                          <AppOrderedItems items={items} />
                          {order.items.length - 1 !== index && <Separator />}
                        </View>
                      ))}
                    </View>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
            <View className="native:flex-1 gap-4 md:flex-1">
              <PaymentInfo order={order} />
              {showUserReviews && <UserReview order={order} />}
            </View>
          </View>
          {isweb && <OrderedItems order={order} />}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderDetailScreen;
