import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const IMAGE_CACHE_PREFIX = "@storefront_img_";

async function getCachedImage(productId: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(IMAGE_CACHE_PREFIX + productId);
  } catch {
    return null;
  }
}

async function setCachedImage(productId: string, dataUri: string): Promise<void> {
  try {
    await AsyncStorage.setItem(IMAGE_CACHE_PREFIX + productId, dataUri);
  } catch {}
}

const inFlight = new Set<string>();

export function useProductImage(productId: string, name: string, category: string) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cached = await getCachedImage(productId);
      if (cached) {
        if (!cancelled) setImageUri(cached);
        return;
      }

      if (inFlight.has(productId)) return;
      inFlight.add(productId);
      if (!cancelled) setLoading(true);

      try {
        const domain = process.env.EXPO_PUBLIC_DOMAIN;
        if (!domain) return;

        const response = await fetch(`https://${domain}/api/products/image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, category }),
        });

        if (!response.ok) return;
        const data = await response.json();
        if (data.b64_json) {
          const uri = `data:image/png;base64,${data.b64_json}`;
          await setCachedImage(productId, uri);
          if (!cancelled) setImageUri(uri);
        }
      } catch {}
      finally {
        inFlight.delete(productId);
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [productId, name, category]);

  return { imageUri, loading };
}

export async function clearImageCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const imgKeys = keys.filter((k) => k.startsWith(IMAGE_CACHE_PREFIX));
    if (imgKeys.length > 0) await AsyncStorage.multiRemove(imgKeys);
  } catch {}
}
