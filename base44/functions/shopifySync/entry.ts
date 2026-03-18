import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const SHOPIFY_DOMAIN = Deno.env.get("SHOPIFY_STORE_DOMAIN");
const SHOPIFY_TOKEN = Deno.env.get("SHOPIFY_ADMIN_API_TOKEN");

async function shopifyFetch(endpoint) {
  const CLIENT_ID = Deno.env.get("SHOPIFY_CLIENT_ID");
  const credentials = btoa(`${CLIENT_ID}:${SHOPIFY_TOKEN}`);
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-10/${endpoint}`, {
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Shopify API error: ${res.status} ${await res.text()}`);
  return res.json();
}

async function syncProducts(base44) {
  const { products } = await shopifyFetch("products.json?limit=250&status=active");
  
  // Clear existing products
  const existing = await base44.asServiceRole.entities.Product.list();
  for (const p of existing) {
    await base44.asServiceRole.entities.Product.delete(p.id);
  }

  // Insert fresh from Shopify
  for (const p of products) {
    const images = p.images.map(img => img.src);
    const variants = p.variants.map(v => ({
      name: v.title,
      price: parseFloat(v.price),
      in_stock: v.inventory_quantity === null || v.inventory_quantity > 0,
    }));
    const basePrice = parseFloat(p.variants[0]?.price || "0");
    const comparePrice = p.variants[0]?.compare_at_price ? parseFloat(p.variants[0].compare_at_price) : null;
    
    // Determine category from product_type or tags
    let category = p.product_type || "Andet";
    const tagList = (p.tags || "").split(", ").filter(Boolean);

    await base44.asServiceRole.entities.Product.create({
      title: p.title,
      description: p.body_html?.replace(/<[^>]*>/g, "").trim() || "",
      price: basePrice,
      compare_at_price: comparePrice,
      images: images,
      category: category,
      tags: tagList,
      variants: variants.filter(v => v.name !== "Default Title"),
      in_stock: p.variants.some(v => v.inventory_quantity === null || v.inventory_quantity > 0),
      shopify_url: `https://${SHOPIFY_DOMAIN}/products/${p.handle}`,
      shopify_id: String(p.id),
    });
  }
  
  return products.length;
}

async function syncBlogs(base44) {
  // Get all blogs first
  const { blogs } = await shopifyFetch("blogs.json");
  
  // Clear existing blog posts
  const existing = await base44.asServiceRole.entities.BlogPost.list();
  for (const b of existing) {
    await base44.asServiceRole.entities.BlogPost.delete(b.id);
  }

  let totalArticles = 0;
  
  for (const blog of blogs) {
    const { articles } = await shopifyFetch(`blogs/${blog.id}/articles.json?limit=250`);
    
    for (const article of articles) {
      if (!article.published_at) continue;
      
      const tagList = (article.tags || "").split(", ").filter(Boolean);
      
      await base44.asServiceRole.entities.BlogPost.create({
        title: article.title,
        slug: article.handle,
        excerpt: article.summary_html?.replace(/<[^>]*>/g, "").trim() || article.body_html?.replace(/<[^>]*>/g, "").substring(0, 200) || "",
        content: article.body_html || "",
        featured_image: article.image?.src || "",
        category: blog.title,
        tags: tagList,
        author_name: article.author || "LALATOTO",
        author_image: "",
        published: true,
        published_date: article.published_at?.split("T")[0] || "",
      });
      totalArticles++;
    }
  }
  
  return totalArticles;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const type = body.type || "all";

    let result = {};

    if (type === "products" || type === "all") {
      const count = await syncProducts(base44);
      result.products = count;
    }

    if (type === "blogs" || type === "all") {
      const count = await syncBlogs(base44);
      result.blogs = count;
    }

    return Response.json({ success: true, synced: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});