import { db } from "./index";
import { suppliers, investors } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create demo supplier
    const [supplier] = await db
      .insert(suppliers)
      .values({
        name: "GreenTech Manufacturing Ltd.",
        email: "contact@greentech-mfg.example",
      })
      .returning();

    console.log("✅ Supplier created:", {
      id: supplier.id,
      name: supplier.name,
      email: supplier.email,
    });

    // Create demo investor
    const [investor] = await db
      .insert(investors)
      .values({
        name: "ESG Capital Partners",
        email: "invest@esgcapital.example",
      })
      .returning();

    console.log("✅ Investor created:", {
      id: investor.id,
      name: investor.name,
      email: investor.email,
    });

    console.log("\n📋 Copy these IDs for testing:");
    console.log("─────────────────────────────────────");
    console.log("Supplier ID:", supplier.id);
    console.log("Investor ID:", investor.id);
    console.log("─────────────────────────────────────\n");

    console.log("✨ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
