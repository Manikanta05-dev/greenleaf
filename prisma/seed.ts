import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const db = new PrismaClient({ adapter });

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

async function main() {
  // ── Categories ──────────────────────────────────────────────────────────────
  const cats = [
    ['Indoor Plants',    'indoor-plants'],
    ['Outdoor Plants',   'outdoor-plants'],
    ['Pots & Planters',  'pots-planters'],
    ['Soil & Fertilizer','soil-fertilizer'],
    ['Tools',            'tools'],
  ];
  const C: Record<string, string> = {};
  for (const [name, slug] of cats) {
    const c = await db.category.upsert({ where: { slug }, update: {}, create: { name, slug } });
    C[slug] = c.id;
  }

  // ── Products ─────────────────────────────────────────────────────────────────
  const products = [
    // ── Indoor Plants ──
    {
      name: 'Monstera Deliciosa', slug: 'monstera-deliciosa',
      price: 1299, compareAtPrice: 1599, stock: 18, cat: 'indoor-plants',
      plantType: 'Tropical', difficulty: 'Easy', sunlight: 'Bright indirect',
      waterNeeds: 'Moderate', size: '6 inch pot', featured: true,
      image: img('photo-1614594975525-e45190c55d0b'),
      desc: 'A statement tropical houseplant with iconic split leaves.',
      care: 'Water when the top 2–3 cm of soil dries. Keep in bright, indirect light and rotate weekly.',
    },
    {
      name: 'Snake Plant', slug: 'snake-plant',
      price: 799, compareAtPrice: 999, stock: 32, cat: 'indoor-plants',
      plantType: 'Succulent', difficulty: 'Beginner', sunlight: 'Low to bright',
      waterNeeds: 'Low', size: '5 inch pot', featured: true,
      image: img('photo-1593482892290-f54927ae1bb2'),
      desc: 'Hardy, architectural foliage that thrives on neglect.',
      care: 'Let soil dry fully between watering. Avoid standing water.',
    },
    {
      name: 'Peace Lily', slug: 'peace-lily',
      price: 899, compareAtPrice: 1099, stock: 20, cat: 'indoor-plants',
      plantType: 'Flowering', difficulty: 'Easy', sunlight: 'Medium indirect',
      waterNeeds: 'Moderate', size: '5 inch pot', featured: true,
      image: img('photo-1593691509543-c55fb32e5cee'),
      desc: 'Elegant glossy foliage and white blooms for indoor spaces.',
      care: 'Keep evenly moist but not soggy. Prefers humid rooms and filtered light.',
    },
    {
      name: 'Pothos Golden', slug: 'pothos-golden',
      price: 349, compareAtPrice: 499, stock: 45, cat: 'indoor-plants',
      plantType: 'Trailing', difficulty: 'Beginner', sunlight: 'Low to medium',
      waterNeeds: 'Low', size: '4 inch pot', featured: true,
      image: img('photo-1622383563227-04401ab4e5ea'),
      desc: 'A fast-growing trailing vine perfect for shelves and hanging baskets.',
      care: 'Allow soil to dry between waterings. Tolerates low light well.',
    },
    {
      name: 'Spider Plant', slug: 'spider-plant',
      price: 299, compareAtPrice: 449, stock: 38, cat: 'indoor-plants',
      plantType: 'Air Purifier', difficulty: 'Beginner', sunlight: 'Indirect light',
      waterNeeds: 'Moderate', size: '4 inch pot', featured: false,
      image: img('photo-1558618666-fcd25c85cd64'),
      desc: 'One of the best air-purifying plants, great for beginners.',
      care: 'Water moderately and keep in bright indirect light. Mist occasionally.',
    },
    {
      name: 'ZZ Plant', slug: 'zz-plant',
      price: 999, compareAtPrice: 1299, stock: 14, cat: 'indoor-plants',
      plantType: 'Tropical', difficulty: 'Beginner', sunlight: 'Low to bright indirect',
      waterNeeds: 'Very low', size: '6 inch pot', featured: false,
      image: img('photo-1600411833196-7c1f6b1a8b90'),
      desc: 'Glossy, waxy leaves and extreme drought tolerance make the ZZ a winner.',
      care: 'Water only every 2–3 weeks. Tolerates deep shade.',
    },
    {
      name: 'Fiddle Leaf Fig', slug: 'fiddle-leaf-fig',
      price: 1899, compareAtPrice: 2399, stock: 8, cat: 'indoor-plants',
      plantType: 'Tropical', difficulty: 'Intermediate', sunlight: 'Bright indirect',
      waterNeeds: 'Moderate', size: '8 inch pot', featured: true,
      image: img('photo-1597655601841-214a4cfe8b2c'),
      desc: 'Large violin-shaped leaves create a dramatic focal point in any room.',
      care: 'Consistent bright indirect light. Water when top inch of soil is dry.',
    },
    {
      name: 'Rubber Plant', slug: 'rubber-plant',
      price: 999, compareAtPrice: 1299, stock: 22, cat: 'indoor-plants',
      plantType: 'Tropical', difficulty: 'Easy', sunlight: 'Bright indirect',
      waterNeeds: 'Moderate', size: '6 inch pot', featured: false,
      image: img('photo-1520412099551-62b6bafeb5bb'),
      desc: 'Bold burgundy leaves with a waxy sheen, a classic statement plant.',
      care: 'Wipe leaves monthly to remove dust. Water when top 2 cm dry.',
    },
    {
      name: 'Aloe Vera', slug: 'aloe-vera',
      price: 249, compareAtPrice: 349, stock: 60, cat: 'indoor-plants',
      plantType: 'Succulent', difficulty: 'Beginner', sunlight: 'Full sun to bright',
      waterNeeds: 'Very low', size: '4 inch pot', featured: false,
      image: img('photo-1509316785289-025f5b846b35'),
      desc: 'Multi-purpose succulent with soothing gel — a household essential.',
      care: 'Water every 2–3 weeks. Place in sunniest window available.',
    },
    {
      name: 'Chinese Evergreen', slug: 'chinese-evergreen',
      price: 699, compareAtPrice: 899, stock: 16, cat: 'indoor-plants',
      plantType: 'Foliage', difficulty: 'Beginner', sunlight: 'Low to medium indirect',
      waterNeeds: 'Low', size: '5 inch pot', featured: false,
      image: img('photo-1617791160505-6f00504e3519'),
      desc: 'Beautiful variegated foliage that tolerates low light and dry air.',
      care: 'Allow soil to dry between waterings. Keep away from cold drafts.',
    },

    // ── Outdoor Plants ──
    {
      name: 'Rosemary Plant', slug: 'rosemary-plant',
      price: 449, compareAtPrice: 599, stock: 25, cat: 'outdoor-plants',
      plantType: 'Herb', difficulty: 'Easy', sunlight: 'Full sun',
      waterNeeds: 'Low', size: '4 inch pot', featured: true,
      image: img('photo-1515586000433-45406d8e6662'),
      desc: 'Fragrant culinary herb for sunny balconies and gardens.',
      care: 'Give 6+ hours of sun. Water deeply, then allow the soil to dry.',
    },
    {
      name: 'Lavender Plant', slug: 'lavender-plant',
      price: 499, compareAtPrice: 699, stock: 20, cat: 'outdoor-plants',
      plantType: 'Herb', difficulty: 'Easy', sunlight: 'Full sun',
      waterNeeds: 'Low', size: '4 inch pot', featured: true,
      image: img('photo-1499002238440-d264edd596ec'),
      desc: 'Fragrant purple blooms that attract pollinators and repel mosquitoes.',
      care: 'Full sun, well-draining soil. Water deeply but infrequently.',
    },
    {
      name: 'Basil Plant', slug: 'basil-plant',
      price: 149, compareAtPrice: 199, stock: 50, cat: 'outdoor-plants',
      plantType: 'Herb', difficulty: 'Beginner', sunlight: 'Full sun',
      waterNeeds: 'Moderate', size: '3 inch pot', featured: false,
      image: img('photo-1601004890684-d8cbf643f5f2'),
      desc: 'Fresh kitchen herb perfect for balconies and window gardens.',
      care: 'Water regularly, pinch flowers to encourage leafy growth.',
    },
    {
      name: 'Marigold Plant', slug: 'marigold-plant',
      price: 99, compareAtPrice: 149, stock: 80, cat: 'outdoor-plants',
      plantType: 'Flowering', difficulty: 'Beginner', sunlight: 'Full sun',
      waterNeeds: 'Moderate', size: '3 inch pot', featured: false,
      image: img('photo-1444930694458-01babf71870c'),
      desc: 'Vibrant orange blooms that repel garden pests naturally.',
      care: 'Full sun, regular watering. Deadhead spent blooms for continuous flowering.',
    },
    {
      name: 'Bougainvillea', slug: 'bougainvillea',
      price: 699, compareAtPrice: 899, stock: 12, cat: 'outdoor-plants',
      plantType: 'Climber', difficulty: 'Easy', sunlight: 'Full sun',
      waterNeeds: 'Low', size: '6 inch pot', featured: true,
      image: img('photo-1568702846914-96b305d2aaeb'),
      desc: 'Spectacular cascading bracts in vivid pink, orange or purple.',
      care: 'Full sun at least 5 hrs. Let soil dry between deep waterings.',
    },
    {
      name: 'Hibiscus Plant', slug: 'hibiscus-plant',
      price: 549, compareAtPrice: 749, stock: 18, cat: 'outdoor-plants',
      plantType: 'Flowering', difficulty: 'Easy', sunlight: 'Full sun',
      waterNeeds: 'Moderate', size: '6 inch pot', featured: false,
      image: img('photo-1597848212624-a19eb35e2651'),
      desc: 'Large tropical blooms in red, pink or yellow — blooms all year.',
      care: 'Water regularly, fertilise monthly during growing season.',
    },

    // ── Pots & Planters ──
    {
      name: 'Terracotta Pot 8"', slug: 'terracotta-pot',
      price: 299, compareAtPrice: 399, stock: 50, cat: 'pots-planters',
      size: '8 inch', featured: false,
      image: img('photo-1485955900006-10f4d324d411'),
      desc: 'Breathable terracotta planter with drainage hole.',
      care: 'Use a saucer indoors and clean mineral deposits periodically.',
    },
    {
      name: 'White Ceramic Pot', slug: 'white-ceramic-pot',
      price: 549, compareAtPrice: 699, stock: 30, cat: 'pots-planters',
      size: '6 inch', featured: false,
      image: img('photo-1481349518771-20055b2a7b24'),
      desc: 'Minimalist white glazed ceramic with drainage — modern & sleek.',
      care: 'Wipe clean with a damp cloth. Pairs well with white or grey interiors.',
    },
    {
      name: 'Hanging Planter Set', slug: 'hanging-planter-set',
      price: 799, compareAtPrice: 999, stock: 24, cat: 'pots-planters',
      size: 'Set of 3', featured: true,
      image: img('photo-1558618047-3c8c76ca7d13'),
      desc: 'Macramé hanging planters in natural cotton — set of three sizes.',
      care: 'Keep rope dry to avoid mould. Hand-wash gently.',
    },
    {
      name: 'Self-Watering Pot', slug: 'self-watering-pot',
      price: 699, compareAtPrice: 899, stock: 20, cat: 'pots-planters',
      size: '7 inch', featured: false,
      image: img('photo-1487530811015-780780169ae5'),
      desc: 'Built-in reservoir keeps soil consistently moist for 2 weeks.',
      care: 'Refill the reservoir when indicator shows low. Empty in winter.',
    },
    {
      name: 'Grow Bag Set 5-Litre', slug: 'grow-bag-5l',
      price: 199, compareAtPrice: 299, stock: 100, cat: 'pots-planters',
      size: '5 litre × 5', featured: false,
      image: img('photo-1416879595882-3373a0480b5b'),
      desc: 'Fabric grow bags promote healthy root pruning and aeration.',
      care: 'Machine washable and reusable season after season.',
    },

    // ── Soil & Fertilizer ──
    {
      name: 'Premium Organic Potting Mix', slug: 'organic-potting-mix',
      price: 599, compareAtPrice: 749, stock: 60, cat: 'soil-fertilizer',
      size: '10 L', featured: true,
      image: img('photo-1416879595882-3373a0480b5b'),
      desc: 'Airy, nutrient-rich blend for healthy container plants.',
      care: 'Store sealed in a dry place. Use fresh mix when repotting.',
    },
    {
      name: 'Balanced Liquid Fertilizer', slug: 'balanced-fertilizer',
      price: 399, compareAtPrice: 499, stock: 45, cat: 'soil-fertilizer',
      size: '500 ml', featured: false,
      image: img('photo-1416879595882-3373a0480b5b'),
      desc: 'Gentle liquid feed for leafy and flowering plants.',
      care: 'Dilute according to label directions and feed during active growth.',
    },
    {
      name: 'Neem Oil Spray', slug: 'neem-oil-spray',
      price: 249, compareAtPrice: 349, stock: 55, cat: 'soil-fertilizer',
      size: '250 ml', featured: false,
      image: img('photo-1416879595882-3373a0480b5b'),
      desc: 'Cold-pressed neem oil — organic solution for pests and fungi.',
      care: 'Spray every 7–14 days in the evening. Avoid spraying in direct sun.',
    },
    {
      name: 'Vermicompost', slug: 'vermicompost',
      price: 299, compareAtPrice: 399, stock: 70, cat: 'soil-fertilizer',
      size: '2 kg', featured: false,
      image: img('photo-1416879595882-3373a0480b5b'),
      desc: 'Rich worm-cast compost that improves soil structure and fertility.',
      care: 'Mix 10–20% by volume into potting mix. Reapply every 2 months.',
    },
    {
      name: 'Cactus & Succulent Mix', slug: 'cactus-mix',
      price: 349, compareAtPrice: 449, stock: 40, cat: 'soil-fertilizer',
      size: '5 L', featured: false,
      image: img('photo-1416879595882-3373a0480b5b'),
      desc: 'Fast-draining gritty mix formulated for succulents and cacti.',
      care: 'Do not add extra perlite — mix is pre-balanced for drainage.',
    },

    // ── Tools ──
    {
      name: 'Pruning Shears', slug: 'pruning-shears',
      price: 549, compareAtPrice: 749, stock: 22, cat: 'tools',
      size: '8 inch', featured: true,
      image: img('photo-1416879595882-3373a0480b5b'),
      desc: 'Sharp stainless-steel shears for clean plant maintenance.',
      care: 'Wipe blades after use and disinfect between plants.',
    },
    {
      name: 'Watering Can 1.5 L', slug: 'watering-can',
      price: 449, compareAtPrice: 599, stock: 30, cat: 'tools',
      size: '1.5 litre', featured: false,
      image: img('photo-1416879595882-3373a0480b5b'),
      desc: 'Copper-finish indoor watering can with a long precision spout.',
      care: 'Empty after use to prevent rust and algae build-up.',
    },
    {
      name: 'Garden Trowel Set', slug: 'garden-trowel-set',
      price: 349, compareAtPrice: 499, stock: 18, cat: 'tools',
      size: 'Set of 3', featured: false,
      image: img('photo-1416879595882-3373a0480b5b'),
      desc: 'Ergonomic stainless-steel trowel, fork and transplanter set.',
      care: 'Wash off soil after each use and store dry.',
    },
    {
      name: 'Moisture Meter', slug: 'moisture-meter',
      price: 299, compareAtPrice: 399, stock: 35, cat: 'tools',
      size: 'Universal', featured: false,
      image: img('photo-1416879595882-3373a0480b5b'),
      desc: 'Instant soil moisture reading — no batteries needed.',
      care: 'Clean probe after each use. Do not leave in soil permanently.',
    },
    {
      name: 'Plant Mister Spray Bottle', slug: 'plant-mister',
      price: 199, compareAtPrice: 299, stock: 50, cat: 'tools',
      size: '500 ml', featured: false,
      image: img('photo-1416879595882-3373a0480b5b'),
      desc: 'Fine mist spray bottle for humidity-loving tropical plants.',
      care: 'Use distilled water to prevent white mineral marks on leaves.',
    },
  ];

  let created = 0;
  for (const p of products) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        stock: p.stock,
        categoryId: C[p.cat],
        plantType:   (p as any).plantType   ?? null,
        difficulty:  (p as any).difficulty  ?? null,
        sunlight:    (p as any).sunlight    ?? null,
        waterNeeds:  (p as any).waterNeeds  ?? null,
        size:        p.size ?? null,
        featured:    p.featured ?? false,
        imageUrl:    p.image,
        description: p.desc,
        careInstructions: p.care,
      },
    });
    created++;
  }

  // ── Admin user ────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
  await db.user.upsert({
    where: { email: 'admin@greenleaf.local' },
    update: { role: 'ADMIN' },
    create: {
      name: 'GreenLeaf Admin',
      email: 'admin@greenleaf.local',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // ── Demo customer ─────────────────────────────────────────────────────────────
  const demoHash = await bcrypt.hash('Demo1234!', 12);
  await db.user.upsert({
    where: { email: 'demo@greenleaf.local' },
    update: {},
    create: {
      name: 'Demo Customer',
      email: 'demo@greenleaf.local',
      passwordHash: demoHash,
      role: 'CUSTOMER',
    },
  });

  console.log(`\n✅  Seed complete — ${created} products upserted across ${cats.length} categories.\n`);
  console.log('  🔐  Admin login:');
  console.log('      Email   : admin@greenleaf.local');
  console.log('      Password: ChangeMe123!');
  console.log('      URL     : http://localhost:3000/account\n');
  console.log('  👤  Demo customer:');
  console.log('      Email   : demo@greenleaf.local');
  console.log('      Password: Demo1234!\n');
  console.log('  ⚠️   Change the admin password immediately for any real deployment.\n');
}

main().finally(() => db.$disconnect());
