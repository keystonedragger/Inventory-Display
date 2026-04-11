import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CartItem, useStore } from "@/context/StoreContext";
import { useColors } from "@/hooks/useColors";

function CartRow({ item }: { item: CartItem }) {
  const colors = useColors();
  const { removeFromCart, updateCartQuantity } = useStore();
  const router = useRouter();

  return (
    <View style={[styles.cartRow, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={[styles.cartImage, { backgroundColor: colors.secondary }]}
        onPress={() => router.push(`/product/${item.product.id}`)}
      >
        <Feather name="package" size={28} color={colors.mutedForeground} />
      </TouchableOpacity>
      <View style={styles.cartInfo}>
        <Text style={[styles.cartName, { color: colors.foreground }]} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={[styles.cartSku, { color: colors.mutedForeground }]}>SKU: {item.product.sku}</Text>
        <Text style={[styles.cartPrice, { color: colors.foreground }]}>
          ${(item.product.price * item.quantity).toFixed(2)}
        </Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={[styles.qtyBtn, { borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              updateCartQuantity(item.product.id, item.quantity - 1);
            }}
          >
            <Feather name="minus" size={14} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.qtyText, { color: colors.foreground }]}>{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.qtyBtn, { borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              updateCartQuantity(item.product.id, item.quantity + 1);
            }}
          >
            <Feather name="plus" size={14} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              removeFromCart(item.product.id);
            }}
          >
            <Feather name="trash-2" size={16} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { cart, cartTotal, cartCount, clearCart } = useStore();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleCheckout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Order Placed!", `Your order of ${cartCount} item${cartCount !== 1 ? "s" : ""} has been placed.`, [
      { text: "OK", onPress: clearCart },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navBackground, paddingTop: topPadding + 8 }]}>
        <Text style={[styles.headerTitle, { color: colors.navForeground }]}>
          Shopping Cart {cartCount > 0 ? `(${cartCount})` : ""}
        </Text>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="shopping-cart" size={56} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your cart is empty</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Browse products and add items to your cart
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.product.id}
            renderItem={({ item }) => <CartRow item={item} />}
            contentContainerStyle={{ paddingBottom: 200 }}
            showsVerticalScrollIndicator={false}
          />
          <View
            style={[
              styles.checkout,
              { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPadding + 16 },
            ]}
          >
            <View style={styles.subtotalRow}>
              <Text style={[styles.subtotalLabel, { color: colors.mutedForeground }]}>
                Subtotal ({cartCount} item{cartCount !== 1 ? "s" : ""})
              </Text>
              <Text style={[styles.subtotalValue, { color: colors.foreground }]}>
                ${cartTotal.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutBtn, { backgroundColor: colors.addToCart }]}
              onPress={handleCheckout}
              activeOpacity={0.85}
            >
              <Text style={[styles.checkoutBtnText, { color: colors.foreground }]}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  cartRow: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  cartImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cartInfo: {
    flex: 1,
    gap: 4,
  },
  cartName: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 20,
  },
  cartSku: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  cartPrice: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    minWidth: 24,
    textAlign: "center",
  },
  removeBtn: {
    marginLeft: 8,
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  checkout: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subtotalLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  subtotalValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  checkoutBtn: {
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
  },
  checkoutBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
