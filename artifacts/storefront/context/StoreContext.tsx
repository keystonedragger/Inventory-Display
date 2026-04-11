import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  description: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  searchQuery: string;
  selectedCategory: string;
  isImporting: boolean;
  lastImportDate: string | null;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string) => void;
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  importCSV: () => Promise<void>;
  clearProducts: () => void;
  cartTotal: number;
  cartCount: number;
  filteredProducts: Product[];
  categories: string[];
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  PRODUCTS: "@storefront_products",
  CART: "@storefront_cart",
  LAST_IMPORT: "@storefront_last_import",
};

function parseCSV(text: string): Product[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const products: Product[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    header.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });

    const sku = row["sku"] || row["sku number"] || row["item"] || values[0] || "";
    if (!sku) continue;

    const name = row["name"] || row["product name"] || row["title"] || row["item name"] || sku;
    const rawPrice = row["price"] || row["cost"] || row["msrp"] || "0";
    const price = parseFloat(rawPrice.replace(/[^0-9.]/g, "")) || 0;
    const category = row["category"] || row["type"] || row["department"] || "General";
    const description = row["description"] || row["desc"] || row["details"] || "";
    const inStockRaw = (row["instock"] || row["in stock"] || row["stock"] || row["available"] || "true").toLowerCase();
    const inStock = inStockRaw !== "false" && inStockRaw !== "0" && inStockRaw !== "no" && inStockRaw !== "out";

    products.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + i,
      sku,
      name,
      price,
      category,
      description,
      inStock,
      rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      reviewCount: Math.floor(Math.random() * 1000) + 5,
    });
  }

  return products;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isImporting, setIsImporting] = useState(false);
  const [lastImportDate, setLastImportDate] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [savedProducts, savedCart, savedImport] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS),
          AsyncStorage.getItem(STORAGE_KEYS.CART),
          AsyncStorage.getItem(STORAGE_KEYS.LAST_IMPORT),
        ]);
        if (savedProducts) setProducts(JSON.parse(savedProducts));
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedImport) setLastImportDate(savedImport);
      } catch {}
    };
    load();
  }, []);

  const saveProducts = async (prods: Product[]) => {
    setProducts(prods);
    await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
  };

  const saveCart = async (c: CartItem[]) => {
    setCart(c);
    await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(c));
  };

  const importCSV = useCallback(async () => {
    setIsImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: Platform.OS === "web" ? "text/csv" : ["text/csv", "text/comma-separated-values", "text/plain", "public.comma-separated-values-text"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsImporting(false);
        return;
      }

      const file = result.assets[0];
      let text = "";

      if (Platform.OS === "web") {
        const response = await fetch(file.uri);
        text = await response.text();
      } else {
        text = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      const parsed = parseCSV(text);

      if (parsed.length === 0) {
        Alert.alert("No Products Found", "Make sure your CSV has a header row with at least a 'sku' column.");
        setIsImporting(false);
        return;
      }

      const dateStr = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      await saveProducts(parsed);
      setLastImportDate(dateStr);
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_IMPORT, dateStr);
      setSelectedCategory("All");

      Alert.alert("Import Successful", `Imported ${parsed.length} product${parsed.length !== 1 ? "s" : ""} successfully.`);
    } catch (err) {
      Alert.alert("Import Failed", "Could not read the CSV file. Please try again.");
    } finally {
      setIsImporting(false);
    }
  }, []);

  const clearProducts = useCallback(async () => {
    await saveProducts([]);
    await saveCart([]);
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_IMPORT);
    setLastImportDate(null);
    setSelectedCategory("All");
  }, []);

  const addToCart = useCallback((product: Product, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      const updated = existing
        ? prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i)
        : [...prev, { product, quantity: qty }];
      AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.product.id !== productId);
      AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateCartQuantity = useCallback((productId: string, qty: number) => {
    setCart((prev) => {
      const updated = qty <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => i.product.id === productId ? { ...i, quantity: qty } : i);
      AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearCart = useCallback(async () => {
    await saveCart([]);
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category))).sort()];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        searchQuery,
        selectedCategory,
        isImporting,
        lastImportDate,
        setSearchQuery,
        setSelectedCategory,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        importCSV,
        clearProducts,
        cartTotal,
        cartCount,
        filteredProducts,
        categories,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
