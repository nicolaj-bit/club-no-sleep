import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const SHOPIFY_DOMAIN = Deno.env.get("SHOPIFY_STORE_DOMAIN");
const SHOPIFY_TOKEN = Deno.env.get("SHOPIFY_ADMIN_API_TOKEN");

async function shopifyFetch(endpoint) {
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2023-10/${endpoint}`, {
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_TOKEN,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const topic = req.headers.get("X-Shopify-Topic") || "";
    const body = await req.json();

    // Use service role for webhook (no user auth)
    const base44 = createClientFromRequest(req);

    if (topic.startsWith("products/")) {
      const p = body;
      const shopifyId = String(p.id);

      // Find existing product
      const existing = await base44.asServiceRole.entities.Product.filter({ shopify_id: shopifyId });

      if (topic === "products/delete") {
        if (existing.length > 0) {
          await base44.asServiceRole.entities.Product.delete(existing[0].id);
        }
        return Response.json({ ok: true });
      }

      const images = (p.images || []).map(img => img.src);
      const variants = (p.variants || []).map(v => ({
        name: v.title,
        price: parseFloat(v.price),
        in_stock: v.inventory_quantity === null || v.inventory_quantity > 0,
      }));
      const basePrice = parseFloat(p.variants?.[0]?.price || "0");
      const comparePrice = p.variants?.[0]?.compare_at_price ? parseFloat(p.variants[0].compare_at_price) : null;
      const tagList = (p.tags || "").split(", ").filter(Boolean);

      const data = {
        title: p.title,
        description: (p.body_html || "").replace(/<[^>]*>/g, "").trim(),
        price: basePrice,
        compare_at_price: comparePrice,
        images: images,
        category: p.product_type || "Andet",
        tags: tagList,
        variants: variants.filter(v => v.name !== "Default Title"),
        in_stock: (p.variants || []).some(v => v.inventory_quantity === null || v.inventory_quantity > 0),
        shopify_url: `https://${SHOPIFY_DOMAIN}/products/${p.handle}`,
        shopify_id: shopifyId,
      };

      if (existing.length > 0) {
        await base44.asServiceRole.entities.Product.update(existing[0].id, data);
      } else {
        await base44.asServiceRole.entities.Product.create(data);
      }
    }

    if (topic.startsWith("articles/")) {
      const article = body;
      // Find blog by fetching
      const blogId = String(article.blog_id);
      let blogTitle = "Blog";
      try {
        const { blog } = await shopifyFetch(`blogs/${blogId}.json`);
        blogTitle = blog.title;
      } catch (_) {}

      const slug = article.handle;
      const existing = await base44.asServiceRole.entities.BlogPost.filter({ slug });

      if (topic === "articles/delete") {
        if (existing.length > 0) {
          await base44.asServiceRole.entities.BlogPost.delete(existing[0].id);
        }
        return Response.json({ ok: true });
      }

      const tagList = (article.tags || "").split(", ").filter(Boolean);
      const data = {
        title: article.title,
        slug: article.handle,
        excerpt: (article.summary_html || "").replace(/<[^>]*>/g, "").trim() || (article.body_html || "").replace(/<[^>]*>/g, "").substring(0, 200),
        content: article.body_html || "",
        featured_image: article.image?.src || "",
        category: blogTitle,
        tags: tagList,
        author_name: article.author || "LALATOTO",
        author_image: "",
        published: !!article.published_at,
        published_date: article.published_at?.split("T")[0] || "",
      };

      if (existing.length > 0) {
        await base44.asServiceRole.entities.BlogPost.update(existing[0].id, data);
      } else {
        await base44.asServiceRole.entities.BlogPost.create(data);
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});