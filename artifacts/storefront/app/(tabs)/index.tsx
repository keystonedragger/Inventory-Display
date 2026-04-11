import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";
import { useColors } from "@/hooks/useColors";

export default function BrowseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { filteredProducts, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categories, products } = useStore();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const pairs = useMemo(() => {
    const result = [];
    for (let i = 0; i < filteredProducts.length; i += 2) {
      result.push([filteredProducts[i], filteredProducts[i + 1] ?? null]);
    }
    return result;
  }, [filteredProducts]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navBackground, paddingTop: topPadding + 8 }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
            placeholder="Search products..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {categories.length > 1 && (
        <View style={[styles.categoryRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: selectedCategory === cat ? colors.accent : colors.secondary,
                    borderColor: selectedCategory === cat ? colors.accent : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: selectedCategory === cat ? colors.accentForeground : colors.mutedForeground },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {products.length === 0 ? (
        <View style={[styles.emptyState, { paddingBottom: bottomPadding }]}>
          <Feather name="upload" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No products yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Go to the Import tab to upload your inventory CSV file
          </Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={[styles.emptyState, { paddingBottom: bottomPadding }]}>
          <Feather name="search" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Try a different search or category
          </Text>
        </View>
      ) : (
        <FlatList
          data={pairs}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.half}>
                <ProductCard product={item[0]} />
              </View>
              <View style={styles.half}>
                {item[1] ? <ProductCard product={item[1]} /> : <View style={styles.placeholder} />}
              </View>
            </View>
          )}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPadding + 100 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
              {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  categoryRow: {
    borderBottomWidth: 1,
  },
  categoryScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  list: {
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  row: {
    flexDirection: "row",
  },
  half: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    margin: 4,
  },
  resultCount: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 4,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
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
});
