import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStore } from "@/context/StoreContext";
import { useColors } from "@/hooks/useColors";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, addToCart } = useStore();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={48} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Product not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.accent }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddToCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToCart(product, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Feather
        key={i}
        name="star"
        size={16}
        color={i <= Math.round(product.rating) ? colors.starColor : colors.border}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPadding + 160 }}>
        <View style={[styles.imageBanner, { backgroundColor: colors.secondary }]}>
          <Feather name="package" size={72} color={colors.mutedForeground} />
          {!product.inStock && (
            <View style={[styles.outBadge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Text style={[styles.outBadgeText, { color: colors.mutedForeground }]}>Out of Stock</Text>
            </View>
          )}
        </View>

        <View style={styles.details}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.categoryText, { color: colors.mutedForeground }]}>{product.category}</Text>
          </View>

          <Text style={[styles.name, { color: colors.foreground }]}>{product.name}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.stars}>{stars}</View>
            <Text style={[styles.ratingText, { color: colors.accent }]}>{product.rating}</Text>
            <Text style={[styles.reviewText, { color: colors.mutedForeground }]}>
              ({product.reviewCount.toLocaleString()} reviews)
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.price, { color: colors.foreground }]}>
            {product.price > 0 ? `$${product.price.toFixed(2)}` : "Price on request"}
          </Text>

          {product.inStock ? (
            <Text style={[styles.stockStatus, { color: "#2E7D32" }]}>In Stock</Text>
          ) : (
            <Text style={[styles.stockStatus, { color: colors.destructive }]}>Currently Unavailable</Text>
          )}

          <Text style={[styles.skuText, { color: colors.mutedForeground }]}>SKU: {product.sku}</Text>

          {product.description ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.descTitle, { color: colors.foreground }]}>About this item</Text>
              <Text style={[styles.description, { color: colors.foreground }]}>{product.description}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>

      {product.inStock && (
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPadding + 16 },
          ]}
        >
          <View style={[styles.qtySelector, { borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Feather name="minus" size={16} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.qtyValue, { color: colors.foreground }]}>{qty}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQty((q) => q + 1)}
            >
              <Feather name="plus" size={16} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.addToCartBtn, { backgroundColor: addedToCart ? "#2E7D32" : colors.addToCart }]}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Feather
              name={addedToCart ? "check" : "shopping-cart"}
              size={18}
              color={addedToCart ? "#FFFFFF" : colors.foreground}
            />
            <Text style={[styles.addToCartText, { color: addedToCart ? "#FFFFFF" : colors.foreground }]}>
              {addedToCart ? "Added!" : "Add to Cart"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  backLink: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  imageBanner: {
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  outBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  outBadgeText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  details: {
    padding: 16,
    gap: 10,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  name: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  reviewText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  price: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  stockStatus: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  skuText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  descTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  qtySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 4,
    overflow: "hidden",
  },
  qtyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  qtyValue: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    minWidth: 28,
    textAlign: "center",
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 4,
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
