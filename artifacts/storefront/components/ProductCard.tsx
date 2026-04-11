import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Product, useStore } from "@/context/StoreContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  product: Product;
}

function StarRating({ rating }: { rating: number }) {
  const colors = useColors();
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Feather
        key={i}
        name="star"
        size={10}
        color={i <= Math.round(rating) ? colors.starColor : colors.border}
      />
    );
  }
  return <View style={styles.stars}>{stars}</View>;
}

export function ProductCard({ product }: Props) {
  const colors = useColors();
  const router = useRouter();
  const { addToCart } = useStore();

  const handleAddToCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addToCart(product);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.85}
    >
      <View style={[styles.imagePlaceholder, { backgroundColor: colors.secondary }]}>
        <Feather name="package" size={40} color={colors.mutedForeground} />
        {!product.inStock && (
          <View style={[styles.outOfStockBadge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.outOfStockText, { color: colors.mutedForeground }]}>Out of Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={[styles.sku, { color: colors.mutedForeground }]}>SKU: {product.sku}</Text>
        <View style={styles.ratingRow}>
          <StarRating rating={product.rating} />
          <Text style={[styles.reviewCount, { color: colors.mutedForeground }]}>({product.reviewCount})</Text>
        </View>
        <Text style={[styles.price, { color: colors.foreground }]}>
          {product.price > 0 ? `$${product.price.toFixed(2)}` : "Price on request"}
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: product.inStock ? colors.addToCart : colors.secondary, opacity: product.inStock ? 1 : 0.5 }]}
          onPress={handleAddToCart}
          disabled={!product.inStock}
          activeOpacity={0.7}
        >
          <Text style={[styles.addBtnText, { color: colors.foreground }]}>
            {product.inStock ? "Add to Cart" : "Unavailable"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    borderRadius: 4,
    borderWidth: 1,
    overflow: "hidden",
  },
  imagePlaceholder: {
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  outOfStockBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  outOfStockText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  info: {
    padding: 8,
    gap: 4,
  },
  name: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    lineHeight: 18,
  },
  sku: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stars: {
    flexDirection: "row",
    gap: 1,
  },
  reviewCount: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  price: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    marginTop: 4,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: "center",
  },
  addBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
