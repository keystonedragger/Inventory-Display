import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";
import { useColors } from "@/hooks/useColors";

export default function NewThisWeekScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { newProducts, lastImportDate } = useStore();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const pairs = useMemo(() => {
    const result = [];
    for (let i = 0; i < newProducts.length; i += 2) {
      result.push([newProducts[i], newProducts[i + 1] ?? null]);
    }
    return result;
  }, [newProducts]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navBackground, paddingTop: topPadding + 8 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>New This Week</Text>
        {lastImportDate && (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Since the {lastImportDate} import
          </Text>
        )}
      </View>

      {newProducts.length === 0 ? (
        <View style={[styles.emptyState, { paddingBottom: bottomPadding }]}>
          <Feather name="package" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing new yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Items added in your most recent import will show up here.
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
              {newProducts.length} new item{newProducts.length !== 1 ? "s" : ""}
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
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