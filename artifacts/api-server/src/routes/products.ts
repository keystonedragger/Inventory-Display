import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

interface ProductInput {
  id: string;
  name: string;
  sku: string;
  category: string;
}

router.post("/products/enrich", async (req, res) => {
  const products: ProductInput[] = req.body.products;
  if (!Array.isArray(products) || products.length === 0) {
    res.status(400).json({ error: "products array required" });
    return;
  }

  const list = products
    .slice(0, 100)
    .map((p) => `- ID: ${p.id} | SKU: ${p.sku} | Name: ${p.name} | Category: ${p.category}`)
    .join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 8192,
      messages: [
        {
          role: "system",
          content:
            "You are a professional product copywriter. For each product given, write a concise 1-2 sentence product description that a customer would see on a retail website. Focus on the item's main purpose, features, and appeal. Return ONLY a valid JSON array where each element is {\"id\": \"...\", \"description\": \"...\"} — no markdown, no extra text.",
        },
        {
          role: "user",
          content: `Write brief product descriptions for these items:\n${list}\n\nReturn JSON array only.`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "[]";
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const results = JSON.parse(cleaned);

    res.json({ results });
  } catch (err) {
    console.error("Enrich error:", err);
    res.status(500).json({ error: "Failed to generate descriptions" });
  }
});

router.post("/products/image", async (req, res) => {
  const { name, category } = req.body as { name?: string; category?: string };
  if (!name) {
    res.status(400).json({ error: "name required" });
    return;
  }

  try {
    const prompt = `Professional e-commerce product photo of: ${name}. Category: ${category ?? "General"}. Clean white or light gray background, studio lighting, high-quality retail product image. No text, no watermarks, no people.`;

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      n: 1,
    });

    const b64 = (response.data[0] as { b64_json?: string })?.b64_json;
    if (!b64) {
      res.status(500).json({ error: "No image returned" });
      return;
    }

    res.json({ b64_json: b64 });
  } catch (err) {
    console.error("Image gen error:", err);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

export default router;
