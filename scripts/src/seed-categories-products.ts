import { db, categoriesTable, productsTable, comparisonsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const CATEGORIES = [
  { name: "Top 5 AI Tools for Students", slug: "ai-tools-students", description: "Discover the best AI-powered tools designed to help students study smarter, write better papers, and manage academic workloads efficiently.", icon: "GraduationCap", color: "#6366f1" },
  { name: "Top 5 AI Animation Software", slug: "ai-animation-software", description: "Compare the leading AI animation platforms that make creating professional animations easier than ever.", icon: "Film", color: "#ec4899" },
  { name: "Top 5 AI Writing Tools", slug: "ai-writing-tools", description: "Find the best AI writing assistants for content creation, copywriting, and academic writing.", icon: "PenTool", color: "#8b5cf6" },
  { name: "Top 5 VPN Services", slug: "vpn-services", description: "Compare top VPN services for privacy, speed, streaming, and overall security.", icon: "Shield", color: "#14b8a6" },
  { name: "Top 5 Hosting Providers", slug: "hosting-providers", description: "Find the best web hosting providers for speed, reliability, and value.", icon: "Server", color: "#f97316" },
  { name: "Top 5 Software for Graphic Design", slug: "graphic-design-software", description: "Compare the top graphic design software for professionals and beginners.", icon: "Palette", color: "#e11d48" },
  { name: "Top 5 App for Task Management", slug: "task-management-apps", description: "Discover the best task management apps to boost your productivity.", icon: "CheckSquare", color: "#0ea5e9" },
  { name: "Top 5 Software for Video Editing", slug: "video-editing-software", description: "Compare professional video editing software for creators and filmmakers.", icon: "Video", color: "#7c3aed" },
  { name: "Top 5 AI Tools for Healthcare", slug: "ai-tools-healthcare", description: "Explore AI-powered tools transforming healthcare delivery and patient care.", icon: "Heart", color: "#ef4444" },
  { name: "Top 5 AI Chatbots", slug: "ai-chatbots", description: "Compare the best AI chatbots for customer service, productivity, and conversation.", icon: "MessageSquare", color: "#06b6d4" },
  { name: "Top 5 Software for Project Management", slug: "project-management-software", description: "Find the best project management tools for teams of all sizes.", icon: "Layout", color: "#2563eb" },
  { name: "Top 5 AI Tools for Education", slug: "ai-tools-education", description: "Discover AI tools revolutionizing teaching and learning experiences.", icon: "BookOpen", color: "#16a34a" },
  { name: "Top 5 Software for Data Analysis", slug: "data-analysis-software", description: "Compare powerful data analysis platforms for business intelligence.", icon: "BarChart", color: "#0891b2" },
  { name: "Top 5 AI Tools for Customer Support", slug: "ai-tools-customer-support", description: "Find AI solutions that enhance customer support efficiency and satisfaction.", icon: "Headphones", color: "#9333ea" },
  { name: "Top 5 AI Tools for Content Creation", slug: "ai-tools-content-creation", description: "Compare AI-powered content creation tools for marketers and creators.", icon: "Sparkles", color: "#f59e0b" },
  { name: "Top 5 Software for Accounting", slug: "accounting-software", description: "Find the best accounting software for businesses and freelancers.", icon: "Calculator", color: "#059669" },
  { name: "Top 5 AI Tools for Language Learning", slug: "ai-tools-language-learning", description: "Compare AI language learning apps that make fluency achievable.", icon: "Globe", color: "#3b82f6" },
  { name: "Top 5 Software for Cybersecurity", slug: "cybersecurity-software", description: "Protect your business with the top cybersecurity software solutions.", icon: "Lock", color: "#dc2626" },
  { name: "Top 5 AI Tools for Voice Recognition", slug: "ai-tools-voice-recognition", description: "Compare the best AI voice recognition and transcription tools.", icon: "Mic", color: "#7c3aed" },
  { name: "Top 5 Software for Automation", slug: "automation-software", description: "Automate workflows and boost efficiency with the best automation platforms.", icon: "Zap", color: "#eab308" },
  { name: "Top 5 AI Tools for Image Recognition", slug: "ai-tools-image-recognition", description: "Discover AI image recognition tools for visual analysis and processing.", icon: "Eye", color: "#6366f1" },
  { name: "Top 5 Software for Cloud Computing", slug: "cloud-computing-software", description: "Compare leading cloud computing platforms for scalable infrastructure.", icon: "Cloud", color: "#0284c7" },
  { name: "Top 5 AI Tools for Video Creation", slug: "ai-tools-video-creation", description: "Create professional videos with AI-powered video creation tools.", icon: "Clapperboard", color: "#d946ef" },
  { name: "Top 5 Software for CRM", slug: "crm-software", description: "Find the best CRM software to manage customer relationships effectively.", icon: "Users", color: "#2563eb" },
  { name: "Top 5 AI Tools for Personal Finance", slug: "ai-tools-personal-finance", description: "Manage your finances smarter with AI-powered personal finance tools.", icon: "Wallet", color: "#16a34a" },
  { name: "Top 5 AI Tools for Health Tracking", slug: "ai-tools-health-tracking", description: "Track your health and wellness with AI-powered monitoring tools.", icon: "Activity", color: "#ef4444" },
  { name: "Top 5 AI Tools for Education Analytics", slug: "ai-tools-education-analytics", description: "Leverage AI analytics to improve educational outcomes and insights.", icon: "TrendingUp", color: "#8b5cf6" },
  { name: "Top 5 AI Tools for Workflow Automation", slug: "ai-tools-workflow-automation", description: "Streamline your workflows with intelligent AI automation tools.", icon: "GitBranch", color: "#f97316" },
  { name: "Top 5 AI Tools for Social Media Management", slug: "ai-tools-social-media", description: "Manage social media like a pro with AI-powered scheduling and analytics.", icon: "Share2", color: "#ec4899" },
  { name: "Top 5 AI Tools for Predictive Analytics", slug: "ai-tools-predictive-analytics", description: "Harness predictive analytics AI to forecast trends and make data-driven decisions.", icon: "Brain", color: "#0ea5e9" },
];

const PRODUCT_DATA: Record<string, Array<{ name: string; slug: string; rating: number; pricing: string; shortDesc: string; pros: string[]; cons: string[]; features: Record<string, string> }>> = {
  "ai-tools-students": [
    { name: "Grammarly", slug: "grammarly", rating: 4.8, pricing: "Free / $12/mo", shortDesc: "AI-powered writing assistant for grammar, clarity, and style.", pros: ["Excellent grammar checking", "Browser extension", "Plagiarism detector"], cons: ["Premium is pricey", "Sometimes over-corrects"], features: { "Grammar Check": "Advanced AI", "Plagiarism": "Yes", "Tone Detection": "Yes", "Browser Extension": "Yes", "Free Plan": "Yes" } },
    { name: "Notion AI", slug: "notion-ai", rating: 4.7, pricing: "$8/mo add-on", shortDesc: "AI-enhanced workspace for notes, docs, and project management.", pros: ["All-in-one workspace", "Great AI summaries", "Collaborative"], cons: ["Learning curve", "AI is add-on cost"], features: { "Note Taking": "Advanced", "AI Summaries": "Yes", "Collaboration": "Real-time", "Templates": "1000+", "Free Plan": "Limited" } },
    { name: "Quillbot", slug: "quillbot", rating: 4.5, pricing: "Free / $9.95/mo", shortDesc: "Paraphrasing and summarization tool for academic writing.", pros: ["Great paraphrasing", "Multiple modes", "Citation generator"], cons: ["Free version limited", "Sometimes awkward phrasing"], features: { "Paraphrasing": "7 Modes", "Summarizer": "Yes", "Citations": "APA/MLA/Chicago", "Grammar Check": "Yes", "Free Plan": "Yes" } },
    { name: "Otter.ai", slug: "otter-ai", rating: 4.4, pricing: "Free / $16.99/mo", shortDesc: "AI meeting and lecture transcription with smart summaries.", pros: ["Accurate transcription", "Real-time notes", "Zoom integration"], cons: ["Free plan limits", "Accent challenges"], features: { "Transcription": "Real-time", "Summary": "AI-generated", "Zoom Integration": "Yes", "Export": "Multiple formats", "Free Plan": "300 min/mo" } },
    { name: "Scholarcy", slug: "scholarcy", rating: 4.3, pricing: "Free / $9.99/mo", shortDesc: "Research paper summarizer that creates flashcards from papers.", pros: ["Paper summarization", "Flashcard generation", "Reference extraction"], cons: ["Niche use case", "Limited free tier"], features: { "Paper Summary": "AI-powered", "Flashcards": "Auto-generated", "References": "Extracted", "Browser Extension": "Yes", "Free Plan": "Limited" } },
  ],
  "vpn-services": [
    { name: "NordVPN", slug: "nordvpn", rating: 4.8, pricing: "$3.39/mo (2yr)", shortDesc: "Fast, secure VPN with 5,500+ servers in 60 countries.", pros: ["Excellent speed", "Strong security", "Double VPN"], cons: ["No free plan", "Desktop app can be heavy"], features: { "Servers": "5,500+", "Countries": "60", "Kill Switch": "Yes", "No-Log Policy": "Audited", "Simultaneous": "6 devices" } },
    { name: "ExpressVPN", slug: "expressvpn", rating: 4.7, pricing: "$6.67/mo (1yr)", shortDesc: "Premium VPN known for speed and reliability worldwide.", pros: ["Fastest speeds", "Easy to use", "Wide coverage"], cons: ["More expensive", "5 device limit"], features: { "Servers": "3,000+", "Countries": "94", "Kill Switch": "Yes", "No-Log Policy": "Audited", "Simultaneous": "5 devices" } },
    { name: "Surfshark", slug: "surfshark", rating: 4.6, pricing: "$2.49/mo (2yr)", shortDesc: "Budget-friendly VPN with unlimited device connections.", pros: ["Unlimited devices", "Great value", "CleanWeb ad blocker"], cons: ["Slower on some servers", "Newer provider"], features: { "Servers": "3,200+", "Countries": "65", "Kill Switch": "Yes", "No-Log Policy": "Yes", "Simultaneous": "Unlimited" } },
    { name: "CyberGhost", slug: "cyberghost", rating: 4.4, pricing: "$2.19/mo (2yr)", shortDesc: "User-friendly VPN optimized for streaming and torrenting.", pros: ["Streaming optimized", "45-day guarantee", "Huge network"], cons: ["Slower long-distance", "Owned by Kape"], features: { "Servers": "9,000+", "Countries": "91", "Kill Switch": "Yes", "No-Log Policy": "Yes", "Simultaneous": "7 devices" } },
    { name: "ProtonVPN", slug: "protonvpn", rating: 4.5, pricing: "Free / $4.99/mo", shortDesc: "Privacy-focused VPN from the makers of ProtonMail.", pros: ["Free plan available", "Swiss privacy", "Open source"], cons: ["Slower free servers", "Fewer server locations"], features: { "Servers": "1,700+", "Countries": "63", "Kill Switch": "Yes", "No-Log Policy": "Swiss law", "Simultaneous": "10 devices" } },
  ],
  "hosting-providers": [
    { name: "Cloudways", slug: "cloudways", rating: 4.7, pricing: "$14/mo", shortDesc: "Managed cloud hosting with choice of infrastructure providers.", pros: ["Managed service", "Multiple cloud providers", "Fast SSD servers"], cons: ["No email hosting", "No domain registration"], features: { "Type": "Managed Cloud", "Uptime": "99.99%", "Support": "24/7", "Free SSL": "Yes", "CDN": "Cloudflare Enterprise" } },
    { name: "SiteGround", slug: "siteground", rating: 4.6, pricing: "$2.99/mo", shortDesc: "Reliable shared hosting with excellent WordPress support.", pros: ["Great support", "Free site migration", "Built-in caching"], cons: ["Renewal prices higher", "Limited storage"], features: { "Type": "Shared/Cloud", "Uptime": "99.99%", "Support": "24/7", "Free SSL": "Yes", "CDN": "Yes" } },
    { name: "DigitalOcean", slug: "digitalocean", rating: 4.5, pricing: "$4/mo", shortDesc: "Developer-friendly cloud infrastructure with simple pricing.", pros: ["Simple pricing", "Great documentation", "Developer-friendly"], cons: ["Not for beginners", "No managed WordPress"], features: { "Type": "Cloud VPS", "Uptime": "99.99%", "Support": "Ticket", "Free SSL": "Yes", "CDN": "Spaces CDN" } },
    { name: "Bluehost", slug: "bluehost", rating: 4.3, pricing: "$2.95/mo", shortDesc: "Popular WordPress hosting recommended by WordPress.org.", pros: ["WordPress recommended", "Free domain first year", "Easy setup"], cons: ["Upselling", "Renewal prices high"], features: { "Type": "Shared", "Uptime": "99.98%", "Support": "24/7", "Free SSL": "Yes", "CDN": "Cloudflare" } },
    { name: "Hostinger", slug: "hostinger", rating: 4.4, pricing: "$1.99/mo", shortDesc: "Budget hosting with surprisingly good performance.", pros: ["Very affordable", "Good speed", "AI website builder"], cons: ["Basic support on cheap plans", "Limited backups"], features: { "Type": "Shared/Cloud", "Uptime": "99.9%", "Support": "24/7", "Free SSL": "Yes", "CDN": "Yes" } },
  ],
};

function generateProductsForCategory(catSlug: string, catName: string): Array<{ name: string; slug: string; rating: number; pricing: string; shortDesc: string; pros: string[]; cons: string[]; features: Record<string, string> }> {
  if (PRODUCT_DATA[catSlug]) return PRODUCT_DATA[catSlug];
  const topic = catName.replace("Top 5 ", "");
  return [
    { name: `${topic} Pro`, slug: `${catSlug}-pro`, rating: 4.8, pricing: "$9.99/mo", shortDesc: `Leading solution in ${topic.toLowerCase()} with advanced features.`, pros: ["Feature-rich", "Excellent support", "Regular updates"], cons: ["Higher price point", "Steeper learning curve"], features: { "Best For": "Professionals", "Free Trial": "14 days", "Support": "24/7", "API Access": "Yes", "Mobile App": "Yes" } },
    { name: `${topic} Suite`, slug: `${catSlug}-suite`, rating: 4.6, pricing: "$7.99/mo", shortDesc: `Comprehensive ${topic.toLowerCase()} platform with team features.`, pros: ["Team collaboration", "Great integrations", "Customizable"], cons: ["Can be overwhelming", "Premium pricing"], features: { "Best For": "Teams", "Free Trial": "7 days", "Support": "Business hours", "API Access": "Yes", "Mobile App": "Yes" } },
    { name: `${topic} Lite`, slug: `${catSlug}-lite`, rating: 4.4, pricing: "Free / $4.99/mo", shortDesc: `Budget-friendly ${topic.toLowerCase()} tool with essential features.`, pros: ["Free plan available", "Easy to use", "Quick setup"], cons: ["Limited features on free", "Basic reporting"], features: { "Best For": "Beginners", "Free Trial": "Free plan", "Support": "Email", "API Access": "Limited", "Mobile App": "Yes" } },
    { name: `${topic} Cloud`, slug: `${catSlug}-cloud`, rating: 4.3, pricing: "$12.99/mo", shortDesc: `Cloud-based ${topic.toLowerCase()} with enterprise capabilities.`, pros: ["Enterprise grade", "Scalable", "Advanced analytics"], cons: ["Expensive", "Complex setup"], features: { "Best For": "Enterprise", "Free Trial": "30 days", "Support": "Priority", "API Access": "Full", "Mobile App": "Yes" } },
    { name: `${topic} Express`, slug: `${catSlug}-express`, rating: 4.2, pricing: "$5.99/mo", shortDesc: `Fast and lightweight ${topic.toLowerCase()} for quick results.`, pros: ["Fast performance", "Clean interface", "Good value"], cons: ["Fewer features", "Limited integrations"], features: { "Best For": "Small business", "Free Trial": "14 days", "Support": "Chat", "API Access": "Basic", "Mobile App": "iOS only" } },
  ];
}

async function main() {
  console.log("Seeding 30 categories with products and comparisons...");

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];

    const existing = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, cat.slug));
    let categoryId: number;

    if (existing.length > 0) {
      categoryId = existing[0].id;
      console.log(`  Category exists: ${cat.name} (id=${categoryId})`);
    } else {
      const [inserted] = await db.insert(categoriesTable).values({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        sortOrder: i,
        isVisible: true,
        metaTitle: `${cat.name} - Best Picks & Reviews | QiraHub`,
        metaDescription: cat.description,
      }).returning();
      categoryId = inserted.id;
      console.log(`  Created category: ${cat.name} (id=${categoryId})`);
    }

    const products = generateProductsForCategory(cat.slug, cat.name);
    const insertedProductIds: number[] = [];

    for (let r = 0; r < products.length; r++) {
      const p = products[r];
      const existingProduct = await db.select().from(productsTable).where(eq(productsTable.slug, p.slug));

      if (existingProduct.length > 0) {
        insertedProductIds.push(existingProduct[0].id);
        continue;
      }

      const [product] = await db.insert(productsTable).values({
        name: p.name,
        slug: p.slug,
        categoryId,
        description: `${p.shortDesc}\n\n${p.name} is a leading solution in its category, offering a comprehensive set of features designed to help users achieve their goals efficiently. With competitive pricing and regular updates, it stands out as a top choice for both beginners and professionals.`,
        shortDescription: p.shortDesc,
        rating: p.rating,
        rank: r + 1,
        pros: p.pros,
        cons: p.cons,
        features: p.features,
        pricing: p.pricing,
        websiteUrl: `https://example.com/${p.slug}`,
        imageUrl: `https://picsum.photos/seed/${p.slug}/400/300`,
        metaTitle: `${p.name} Review - Features, Pricing & Alternatives | QiraHub`,
        metaDescription: p.shortDesc,
      }).returning();
      insertedProductIds.push(product.id);
    }

    const existingComparison = await db.select().from(comparisonsTable).where(eq(comparisonsTable.slug, `compare-${cat.slug}`));
    if (existingComparison.length === 0 && insertedProductIds.length >= 2) {
      const allFeatureKeys = new Set<string>();
      products.forEach(p => Object.keys(p.features).forEach(k => allFeatureKeys.add(k)));

      await db.insert(comparisonsTable).values({
        title: `${cat.name} Comparison`,
        slug: `compare-${cat.slug}`,
        categoryId,
        description: `Side-by-side comparison of the ${cat.name.toLowerCase()}. Compare features, pricing, and ratings to find the best fit.`,
        productIds: insertedProductIds,
        comparisonFields: Array.from(allFeatureKeys),
        verdict: `After thorough testing and analysis, each of these ${cat.name.toLowerCase().replace("top 5 ", "")} offers unique strengths. Check the comparison table above to find the best match for your specific needs.`,
        metaTitle: `${cat.name} Comparison - Side by Side Review | QiraHub`,
        metaDescription: `Compare the ${cat.name.toLowerCase()} side by side. Detailed feature comparison, pricing, and expert ratings.`,
      });
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

main().catch(console.error);
