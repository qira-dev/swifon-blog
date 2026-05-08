import { db, categoriesTable, tagsTable, postsTable, postTagsTable, usersTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  await db.delete(postTagsTable);
  await db.delete(postsTable);
  await db.delete(tagsTable);
  await db.delete(categoriesTable);

  const [catAI, catTutorials, catReviews, catComparisons, catNews, catTips] = await db
    .insert(categoriesTable)
    .values([
      {
        name: "AI Tools",
        slug: "ai-tools",
        description: "The best AI-powered tools and apps",
        icon: "🤖",
        color: "#14b8a6",
        sortOrder: 1,
        isVisible: true,
        metaTitle: "AI Tools – QiraHub",
        metaDescription: "Discover the best AI tools for productivity, creativity, and more.",
      },
      {
        name: "Tutorials",
        slug: "tutorials",
        description: "Step-by-step guides for developers and tech enthusiasts",
        icon: "📚",
        color: "#eab308",
        sortOrder: 2,
        isVisible: true,
      },
      {
        name: "Tool Reviews",
        slug: "tool-reviews",
        description: "In-depth reviews of software and online tools",
        icon: "⭐",
        color: "#f97316",
        sortOrder: 3,
        isVisible: true,
      },
      {
        name: "Comparisons",
        slug: "comparisons",
        description: "Side-by-side comparisons of popular tools",
        icon: "⚖️",
        color: "#8b5cf6",
        sortOrder: 4,
        isVisible: true,
      },
      {
        name: "AI News",
        slug: "ai-news",
        description: "Latest news from the world of artificial intelligence",
        icon: "📰",
        color: "#ec4899",
        sortOrder: 5,
        isVisible: true,
      },
      {
        name: "Tips & Tricks",
        slug: "tips-tricks",
        description: "Quick tips and tricks to boost your productivity",
        icon: "💡",
        color: "#10b981",
        sortOrder: 6,
        isVisible: true,
      },
    ])
    .returning();

  const [subLLM, subImageAI] = await db
    .insert(categoriesTable)
    .values([
      {
        name: "LLM Models",
        slug: "llm-models",
        description: "Large language models and chatbots",
        icon: "🧠",
        color: "#14b8a6",
        parentId: catAI.id,
        sortOrder: 1,
        isVisible: true,
      },
      {
        name: "Image Generation",
        slug: "image-generation",
        description: "AI image creation and editing tools",
        icon: "🎨",
        color: "#14b8a6",
        parentId: catAI.id,
        sortOrder: 2,
        isVisible: true,
      },
    ])
    .returning();

  const tagRows = await db
    .insert(tagsTable)
    .values([
      { name: "ChatGPT", slug: "chatgpt" },
      { name: "Claude", slug: "claude" },
      { name: "Gemini", slug: "gemini" },
      { name: "Midjourney", slug: "midjourney" },
      { name: "Productivity", slug: "productivity" },
      { name: "Free Tools", slug: "free-tools" },
      { name: "Beginner", slug: "beginner" },
      { name: "Advanced", slug: "advanced" },
      { name: "Automation", slug: "automation" },
      { name: "Prompt Engineering", slug: "prompt-engineering" },
      { name: "Python", slug: "python" },
      { name: "No-Code", slug: "no-code" },
    ])
    .returning();

  const tagMap: Record<string, number> = {};
  for (const tag of tagRows) {
    tagMap[tag.slug] = tag.id;
  }

  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  const posts = await db
    .insert(postsTable)
    .values([
      {
        title: "Top 10 AI Tools You Need in 2025",
        slug: "top-10-ai-tools-2025",
        content: `<h2>The AI landscape in 2025</h2><p>Artificial intelligence has exploded in 2025, with hundreds of new tools launching every month. But which ones are actually worth your time? We've tested dozens of tools over the past year and curated the absolute best for productivity, creativity, and development.</p><h2>1. ChatGPT-5</h2><p>OpenAI's flagship model has made huge leaps forward with multimodal capabilities, longer context windows, and blazing-fast responses. The free tier now includes GPT-4-level intelligence, while Pro users get access to advanced reasoning and code execution.</p><h2>2. Claude 3.7</h2><p>Anthropic's Claude has become the go-to for professionals who need thoughtful, nuanced responses. Its 200k token context window is unmatched, and its writing quality is exceptional.</p><h2>3. Midjourney V7</h2><p>Still the king of AI image generation. Version 7 brings photorealistic quality, better text rendering, and improved consistency across generations.</p>`,
        excerpt: "We tested dozens of AI tools so you don't have to. Here are the 10 most useful AI tools of 2025, from ChatGPT to Midjourney.",
        metaTitle: "Top 10 AI Tools 2025 – QiraHub",
        metaDescription: "Discover the best AI tools of 2025. We compare ChatGPT, Claude, Gemini, Midjourney and more.",
        focusKeyword: "best AI tools 2025",
        featuredImageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
        status: "published",
        position: "featured",
        readTimeMinutes: 8,
        categoryId: catAI.id,
        publishedAt: daysAgo(1),
      },
      {
        title: "Claude vs ChatGPT vs Gemini: The Definitive 2025 Comparison",
        slug: "claude-vs-chatgpt-vs-gemini-2025",
        content: `<h2>Which AI assistant wins in 2025?</h2><p>Three giants dominate the AI assistant space: OpenAI's ChatGPT, Anthropic's Claude, and Google's Gemini. Each has distinct strengths. Let's break down exactly when you should use each one.</p><h2>Reasoning & Analysis</h2><p>Claude 3.7 wins here with its methodical step-by-step reasoning. It rarely hallucinates and gives well-sourced answers. ChatGPT o3 is close, especially for math and coding. Gemini 2.0 lags slightly but excels at Google Workspace integration.</p><h2>Creative Writing</h2><p>ChatGPT remains the most versatile creative writer. Claude produces more literary prose. Gemini is weakest here.</p><h2>Coding</h2><p>ChatGPT with Code Interpreter is the gold standard. Claude is excellent for code review and refactoring. Gemini is improving rapidly with its new code model.</p>`,
        excerpt: "ChatGPT, Claude, or Gemini — which AI assistant should you use in 2025? We run 50+ tests to find the winner.",
        featuredImageUrl: "https://images.unsplash.com/photo-1675557009875-436f7a7b7b8b?w=1200&q=80",
        status: "published",
        position: "featured",
        readTimeMinutes: 12,
        categoryId: catComparisons.id,
        publishedAt: daysAgo(3),
      },
      {
        title: "Build Your First AI Chatbot with Python in 30 Minutes",
        slug: "build-ai-chatbot-python-30-minutes",
        content: `<h2>What you'll build</h2><p>By the end of this tutorial, you'll have a working AI chatbot that can hold multi-turn conversations, remember context, and be deployed to a web server. We'll use Python, the OpenAI API, and FastAPI.</p><h2>Prerequisites</h2><p>Basic Python knowledge, an OpenAI API key (free tier works), and Python 3.10+ installed.</p><h2>Step 1: Set up your environment</h2><pre><code>pip install openai fastapi uvicorn python-dotenv</code></pre><h2>Step 2: Create the chat logic</h2><p>The key is maintaining a messages list that grows with the conversation...</p>`,
        excerpt: "Learn to build a full AI chatbot from scratch using Python and the OpenAI API. Complete beginner-friendly tutorial with working code.",
        featuredImageUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&q=80",
        status: "published",
        position: "featured",
        readTimeMinutes: 15,
        categoryId: catTutorials.id,
        publishedAt: daysAgo(5),
      },
      {
        title: "Midjourney V7 Review: Is It Still the Best AI Image Generator?",
        slug: "midjourney-v7-review-2025",
        content: `<h2>Overview</h2><p>Midjourney has been the dominant force in AI image generation since 2022. Version 7, released in early 2025, makes significant strides in photorealism, text rendering, and consistency. But with DALL-E 3, Ideogram, and Stable Diffusion all improving rapidly, is Midjourney still worth the subscription?</p><h2>What's new in V7</h2><ul><li>4x higher default resolution</li><li>Dramatically improved text rendering in images</li><li>Better face consistency across generations</li><li>New "style tuner" for personalized aesthetics</li></ul><h2>Our verdict</h2><p>Midjourney V7 is still the best for artistic and stylized images. For photorealism, it's neck-and-neck with DALL-E 3.</p>`,
        excerpt: "Midjourney V7 brings huge improvements in photorealism and text rendering. But is it still worth $10/month? Our honest review.",
        featuredImageUrl: "https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5?w=1200&q=80",
        status: "published",
        position: "normal",
        readTimeMinutes: 10,
        categoryId: catReviews.id,
        publishedAt: daysAgo(7),
      },
      {
        title: "10 ChatGPT Prompt Templates That 10x Your Productivity",
        slug: "chatgpt-prompt-templates-productivity",
        content: `<h2>Why prompts matter</h2><p>The difference between a mediocre ChatGPT response and a genuinely useful one usually comes down to the prompt. These 10 templates have saved our team hundreds of hours this year.</p><h2>1. The Socratic Method</h2><p>"Ask me 5 clarifying questions about [topic] before answering, then provide your best response."</p><h2>2. The Devil's Advocate</h2><p>"Give me the strongest possible counterargument to [my position], then help me address it."</p><h2>3. The Step-by-Step Expert</h2><p>"Act as a world-class expert in [field]. Walk me through [task] step by step, explaining your reasoning."</p>`,
        excerpt: "These 10 proven ChatGPT prompt templates will dramatically improve your results. Copy-paste and customize for your workflow.",
        featuredImageUrl: "https://images.unsplash.com/photo-1676299081847-824916de030a?w=1200&q=80",
        status: "published",
        position: "pinned",
        readTimeMinutes: 6,
        categoryId: catTips.id,
        publishedAt: daysAgo(10),
      },
      {
        title: "GPT-5 vs Claude 3.7: Which Model Is Smarter?",
        slug: "gpt5-vs-claude-37-comparison",
        content: `<h2>The race for the smartest AI</h2><p>OpenAI's GPT-5 and Anthropic's Claude 3.7 have been battling for the top spot in AI benchmarks. We put both through 200+ tests across reasoning, coding, writing, and math to find out which is genuinely smarter.</p><h2>Benchmark results</h2><p>On the MMLU benchmark, GPT-5 scores 95.8% vs Claude 3.7's 94.2%. On HumanEval (coding), GPT-5 leads 92% vs 89%. Claude wins on nuanced writing quality in human evaluations.</p>`,
        excerpt: "GPT-5 and Claude 3.7 are the two most capable AI models of 2025. We ran 200 tests to find the real winner.",
        status: "published",
        position: "normal",
        readTimeMinutes: 9,
        categoryId: catComparisons.id,
        publishedAt: daysAgo(14),
      },
      {
        title: "How to Use AI to Automate Your Boring Work Tasks",
        slug: "ai-automate-work-tasks",
        content: `<h2>Work smarter, not harder</h2><p>AI tools have made it possible to automate the tedious, repetitive tasks that eat up your workday. Here's a practical guide to identifying which tasks you can automate and the best tools to use.</p><h2>Email management</h2><p>Use Claude or ChatGPT to draft responses, summarize threads, and categorize your inbox. Zapier + AI can auto-respond to common inquiries.</p>`,
        excerpt: "Stop doing boring work manually. Learn how to automate emails, reports, and data entry with AI tools in this practical guide.",
        status: "published",
        position: "normal",
        readTimeMinutes: 7,
        categoryId: catTips.id,
        publishedAt: daysAgo(18),
      },
      {
        title: "The State of AI in 2025: What's Changed and What's Coming",
        slug: "state-of-ai-2025",
        content: `<h2>A year of breakthroughs</h2><p>2025 has been the most transformative year in AI history. We've seen the launch of multimodal models that can see, hear, and reason in real time, autonomous AI agents that can browse the web and write code, and the first signs of AGI-adjacent capabilities in frontier models.</p>`,
        excerpt: "2025 has been the most transformative year in AI. We recap the biggest breakthroughs and what to expect next.",
        status: "published",
        position: "normal",
        readTimeMinutes: 11,
        categoryId: catNews.id,
        publishedAt: daysAgo(21),
      },
    ])
    .returning();

  await db.insert(postTagsTable).values([
    { postId: posts[0].id, tagId: tagMap["chatgpt"] },
    { postId: posts[0].id, tagId: tagMap["gemini"] },
    { postId: posts[0].id, tagId: tagMap["midjourney"] },
    { postId: posts[0].id, tagId: tagMap["productivity"] },
    { postId: posts[1].id, tagId: tagMap["chatgpt"] },
    { postId: posts[1].id, tagId: tagMap["claude"] },
    { postId: posts[1].id, tagId: tagMap["gemini"] },
    { postId: posts[2].id, tagId: tagMap["python"] },
    { postId: posts[2].id, tagId: tagMap["beginner"] },
    { postId: posts[2].id, tagId: tagMap["chatgpt"] },
    { postId: posts[3].id, tagId: tagMap["midjourney"] },
    { postId: posts[3].id, tagId: tagMap["free-tools"] },
    { postId: posts[4].id, tagId: tagMap["chatgpt"] },
    { postId: posts[4].id, tagId: tagMap["prompt-engineering"] },
    { postId: posts[4].id, tagId: tagMap["productivity"] },
    { postId: posts[5].id, tagId: tagMap["chatgpt"] },
    { postId: posts[5].id, tagId: tagMap["claude"] },
    { postId: posts[6].id, tagId: tagMap["automation"] },
    { postId: posts[6].id, tagId: tagMap["productivity"] },
    { postId: posts[6].id, tagId: tagMap["no-code"] },
    { postId: posts[7].id, tagId: tagMap["chatgpt"] },
    { postId: posts[7].id, tagId: tagMap["claude"] },
  ]);

  const existingAdmin = await db.select().from(usersTable).where(eq(usersTable.email, "admin@qirahub.com")).limit(1);
  if (existingAdmin.length === 0) {
    const seedPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!seedPassword) {
      console.error("SEED_ADMIN_PASSWORD environment variable is not set. Skipping admin user creation.");
      console.error("Set SEED_ADMIN_PASSWORD in your environment secrets and re-run the seed.");
    } else {
      if (seedPassword.length < 8) {
        console.error("SEED_ADMIN_PASSWORD must be at least 8 characters. Skipping admin user creation.");
      } else {
        const hash = await bcrypt.hash(seedPassword, 10);
        await db.insert(usersTable).values({
          username: "admin",
          email: "admin@qirahub.com",
          passwordHash: hash,
          displayName: "QiraHub Admin",
          isAdmin: true,
          isActive: true,
        });
        console.log("Admin user created: admin@qirahub.com");
      }
    }
  } else {
    console.log("Admin user already exists, skipping.");
  }

  console.log("Seeding complete!");
  console.log(`Created ${posts.length} posts, 8 categories (6 root + 2 sub), 12 tags`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
