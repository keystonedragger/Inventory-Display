import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function ImportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { importCSV, clearProducts, isImporting, isEnriching, enrichProgress, lastImportDate, products } = useStore();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleClear = () => {
    Alert.alert(
      "Clear All Products",
      "This will remove all imported products and empty the cart. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: clearProducts },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navBackground, paddingTop: topPadding + 8 }]}>
        <Text style={[styles.headerTitle, { color: colors.navForeground }]}>Import Inventory</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Feather name="upload-cloud" size={28} color={colors.accent} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Upload CSV File</Text>
          </View>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
            Export a CSV file from your point-of-sale system and upload it here. Your product catalog will be updated immediately.
          </Text>
          <TouchableOpacity
            style={[styles.importBtn, { backgroundColor: colors.addToCart, opacity: isImporting ? 0.7 : 1 }]}
            onPress={importCSV}
            disabled={isImporting}
            activeOpacity={0.85}
          >
            {isImporting ? (
              <ActivityIndicator size="small" color={colors.foreground} />
            ) : (
              <Feather name="upload" size={18} color={colors.foreground} />
            )}
            <Text style={[styles.importBtnText, { color: colors.foreground }]}>
              {isImporting ? "Importing..." : "Choose CSV File"}
            </Text>
          </TouchableOpacity>

          {isEnriching && (
            <View style={[styles.statusRow, { backgroundColor: colors.secondary }]}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
                Generating descriptions... {enrichProgress}%
              </Text>
            </View>
          )}

          {!isEnriching && lastImportDate && (
            <View style={[styles.statusRow, { backgroundColor: colors.secondary }]}>
              <Feather name="check-circle" size={16} color="#2E7D32" />
              <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
                Last imported: {lastImportDate}
              </Text>
            </View>
          )}

          {products.length > 0 && (
            <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{products.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Products</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {new Set(products.map((p) => p.category)).size}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Categories</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {products.filter((p) => p.inStock).length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>In Stock</Text>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>CSV Format</Text>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
            Your CSV file should have a header row. The following columns are supported:
          </Text>
          <View style={[styles.formatTable, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            {[
              { col: "sku", req: true, desc: "Product SKU / item number" },
              { col: "name", req: false, desc: "Product name or title" },
              { col: "price", req: false, desc: "Price (e.g. 29.99)" },
              { col: "category", req: false, desc: "Product category" },
              { col: "description", req: false, desc: "Product description" },
              { col: "inStock", req: false, desc: "true/false, yes/no" },
            ].map((row, i) => (
              <View
                key={row.col}
                style={[styles.formatRow, i > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}
              >
                <View style={styles.formatLeft}>
                  <Text style={[styles.formatCol, { color: colors.foreground }]}>{row.col}</Text>
                  {row.req && (
                    <View style={[styles.reqBadge, { backgroundColor: colors.badge }]}>
                      <Text style={[styles.reqText, { color: colors.badgeForeground }]}>required</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.formatDesc, { color: colors.mutedForeground }]}>{row.desc}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.exampleBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.exampleTitle, { color: colors.mutedForeground }]}>Example:</Text>
            <Text style={[styles.exampleCode, { color: colors.foreground }]}>
              {"sku,name,price,category\nSKU001,Widget Pro,24.99,Tools\nSKU002,Gadget X,49.99,Electronics"}
            </Text>
          </View>
        </View>

        {products.length > 0 && (
          <TouchableOpacity
            style={[styles.clearBtn, { borderColor: colors.destructive }]}
            onPress={handleClear}
            activeOpacity={0.8}
          >
            <Feather name="trash-2" size={16} color={colors.destructive} />
            <Text style={[styles.clearBtnText, { color: colors.destructive }]}>Clear All Products</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  cardDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 4,
    gap: 8,
  },
  importBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
  },
  formatTable: {
    borderRadius: 6,
    borderWidth: 1,
    overflow: "hidden",
  },
  formatRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  formatLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  formatCol: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  reqBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  reqText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  formatDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  exampleBox: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  exampleTitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  exampleCode: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
  },
  clearBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
