Step 4 — Add product images (after shirts arrive)
PATCH /api/v1/products/<PRODUCT_ID>
json{
  "images": [
    "https://res.cloudinary.com/yourapp/image/upload/shirt-front.jpg",
    "https://res.cloudinary.com/yourapp/image/upload/shirt-back.jpg"
  ],
  "description": "Premium cotton shirt available in 3 colours and 3 sizes"
}

Step 4b — Add colour-specific image to each variant
PATCH /api/v1/products/<PRODUCT_ID>/variants/<ORANGE_VARIANT_ID>
json{
  "image": "https://res.cloudinary.com/yourapp/image/upload/shirt-orange.jpg"
}

Step 5 — Pay vendor later (partial payment)
PATCH /api/v1/purchases/<PURCHASE_ID>
json{
  "paid_amount": 2000,
  "note": "Partial payment — remaining to be paid next week"
}

Step 5b — Pay remaining balance
PATCH /api/v1/purchases/<PURCHASE_ID>
json{
  "paid_amount": 3600,
  "note": "Full payment completed"
}

Search products GET /api/v1/products?search=cotton&category_id=<ID>&is_active=true

Low stock alert GET /api/v1/products?low_stock=true

All variants of a product GET /api/v1/products/<PRODUCT_ID>/variants

Vendor with outstanding dues GET /api/v1/vendors?sort_by=due&sort_order=desc

Purchases by date range GET /api/v1/purchases?from_date=2026-04-01&to_date=2026-04-30&status=pending

// config/api.js — set once

const SUBDOMAIN = "rubban";
const BASE_URL  = "https://multi-tenency.vercel.app/api/v1/public";

// ── Wrapper around fetch ──────────────────────────────────
export const publicApi = (endpoint, options = {}) => {
  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type" : "application/json",
      "x-subdomain"  : SUBDOMAIN,           // ← always sent
      ...options.headers,                   // ← allow override
    },
  });
};

// config/api.js — set when app loads

const SUBDOMAIN = "rubban"; // hardcode per company frontend

axios.defaults.baseURL = "https://multi-tenency.vercel.app/api/v1/public";
axios.defaults.headers.common["x-subdomain"] = SUBDOMAIN;