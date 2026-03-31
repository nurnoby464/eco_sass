import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const fix = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  const collection = mongoose.connection.db!.collection("companies");

  // ── drop old indexes ────────────────────────────────────
  try { await collection.dropIndex("domain_1");    console.log("✅ dropped domain_1"); }
  catch { console.log("domain_1 not found"); }

  try { await collection.dropIndex("subdomain_1"); console.log("✅ dropped subdomain_1"); }
  catch { console.log("subdomain_1 not found"); }

  // ── recreate with partialFilterExpression ───────────────
  // only indexes documents where field is an actual string
  // null and missing fields are completely ignored
  await collection.createIndex(
    { domain: 1 },
    {
      unique                 : true,
      partialFilterExpression: { domain: { $type: "string" } },
      name                   : "domain_1",
    }
  );

  await collection.createIndex(
    { subdomain: 1 },
    {
      unique                 : true,
      partialFilterExpression: { subdomain: { $type: "string" } },
      name                   : "subdomain_1",
    }
  );

  console.log("✅ Indexes recreated with partialFilterExpression");
  await mongoose.disconnect();
};

fix().catch(console.error);