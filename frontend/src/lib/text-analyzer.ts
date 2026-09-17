/**
 * Text Analyzer — Client-side NLP-lite for project text analysis.
 * Extracts concepts, features, technologies, and complexity from user input.
 */

// ─── Known Technology Database ──────────────────────────────────────────────

const TECH_DB: Record<string, { category: string; purpose: string }> = {
  // Frontend
  "react": { category: "Frontend", purpose: "Component-based UI library" },
  "next.js": { category: "Frontend", purpose: "React framework with SSR/SSG" },
  "nextjs": { category: "Frontend", purpose: "React framework with SSR/SSG" },
  "vue": { category: "Frontend", purpose: "Progressive JavaScript framework" },
  "angular": { category: "Frontend", purpose: "Full-featured web framework" },
  "svelte": { category: "Frontend", purpose: "Compile-time web framework" },
  "tailwind": { category: "Frontend", purpose: "Utility-first CSS framework" },
  "tailwindcss": { category: "Frontend", purpose: "Utility-first CSS framework" },
  "typescript": { category: "Frontend", purpose: "Typed JavaScript superset" },
  "javascript": { category: "Frontend", purpose: "Web programming language" },
  "html": { category: "Frontend", purpose: "Markup language" },
  "css": { category: "Frontend", purpose: "Styling language" },
  "bootstrap": { category: "Frontend", purpose: "CSS framework" },
  "flutter": { category: "Mobile", purpose: "Cross-platform mobile framework" },
  "react native": { category: "Mobile", purpose: "Cross-platform mobile with React" },
  "swift": { category: "Mobile", purpose: "iOS development" },
  "kotlin": { category: "Mobile", purpose: "Android development" },

  // Backend
  "fastapi": { category: "Backend", purpose: "High-performance Python API framework" },
  "django": { category: "Backend", purpose: "Full-featured Python web framework" },
  "flask": { category: "Backend", purpose: "Lightweight Python web framework" },
  "express": { category: "Backend", purpose: "Node.js web framework" },
  "node.js": { category: "Backend", purpose: "JavaScript runtime for server-side" },
  "nodejs": { category: "Backend", purpose: "JavaScript runtime for server-side" },
  "spring boot": { category: "Backend", purpose: "Java microservice framework" },
  "spring": { category: "Backend", purpose: "Java application framework" },
  "ruby on rails": { category: "Backend", purpose: "Ruby web framework" },
  "golang": { category: "Backend", purpose: "Go programming language" },
  "rust": { category: "Backend", purpose: "Systems programming language" },
  "graphql": { category: "Backend", purpose: "API query language" },
  "rest api": { category: "Backend", purpose: "RESTful API architecture" },
  "grpc": { category: "Backend", purpose: "High-performance RPC framework" },

  // AI / ML
  "pytorch": { category: "AI / ML", purpose: "Deep learning framework" },
  "tensorflow": { category: "AI / ML", purpose: "Machine learning platform" },
  "keras": { category: "AI / ML", purpose: "High-level neural network API" },
  "scikit-learn": { category: "AI / ML", purpose: "Machine learning library" },
  "sklearn": { category: "AI / ML", purpose: "Machine learning library" },
  "hugging face": { category: "AI / ML", purpose: "NLP model hub and tools" },
  "huggingface": { category: "AI / ML", purpose: "NLP model hub and tools" },
  "transformers": { category: "AI / ML", purpose: "State-of-the-art NLP models" },
  "bert": { category: "AI / ML", purpose: "Bidirectional encoder representations" },
  "gpt": { category: "AI / ML", purpose: "Generative pre-trained transformer" },
  "llm": { category: "AI / ML", purpose: "Large language model" },
  "openai": { category: "AI / ML", purpose: "AI API provider" },
  "langchain": { category: "AI / ML", purpose: "LLM application framework" },
  "opencv": { category: "AI / ML", purpose: "Computer vision library" },
  "yolo": { category: "AI / ML", purpose: "Real-time object detection" },
  "stable diffusion": { category: "AI / ML", purpose: "Image generation model" },
  "rag": { category: "AI / ML", purpose: "Retrieval-augmented generation" },
  "cnn": { category: "AI / ML", purpose: "Convolutional neural network" },
  "rnn": { category: "AI / ML", purpose: "Recurrent neural network" },
  "lstm": { category: "AI / ML", purpose: "Long short-term memory network" },
  "gan": { category: "AI / ML", purpose: "Generative adversarial network" },
  "reinforcement learning": { category: "AI / ML", purpose: "Agent-based learning" },
  "nlp": { category: "AI / ML", purpose: "Natural language processing" },
  "computer vision": { category: "AI / ML", purpose: "Visual data processing" },
  "deep learning": { category: "AI / ML", purpose: "Neural network-based learning" },
  "machine learning": { category: "AI / ML", purpose: "Statistical learning algorithms" },
  "neural network": { category: "AI / ML", purpose: "Computational learning model" },
  "onnx": { category: "AI / ML", purpose: "Open neural network exchange format" },
  "tflite": { category: "AI / ML", purpose: "TensorFlow Lite for mobile" },
  "spacy": { category: "AI / ML", purpose: "Industrial NLP library" },
  "pandas": { category: "Data Science", purpose: "Data manipulation library" },
  "numpy": { category: "Data Science", purpose: "Numerical computing library" },
  "matplotlib": { category: "Data Science", purpose: "Data visualization library" },

  // Database
  "postgresql": { category: "Database", purpose: "Relational database" },
  "postgres": { category: "Database", purpose: "Relational database" },
  "mysql": { category: "Database", purpose: "Relational database" },
  "mongodb": { category: "Database", purpose: "NoSQL document database" },
  "redis": { category: "Database", purpose: "In-memory data store" },
  "supabase": { category: "Database", purpose: "Open-source Firebase alternative" },
  "firebase": { category: "Database", purpose: "Google's app development platform" },
  "sqlite": { category: "Database", purpose: "Lightweight embedded database" },
  "elasticsearch": { category: "Database", purpose: "Search and analytics engine" },
  "neo4j": { category: "Database", purpose: "Graph database" },
  "pinecone": { category: "Database", purpose: "Vector database" },
  "chromadb": { category: "Database", purpose: "AI-native vector database" },
  "pgvector": { category: "Database", purpose: "PostgreSQL vector similarity" },
  "weaviate": { category: "Database", purpose: "Vector search engine" },

  // Cloud & DevOps
  "aws": { category: "Cloud", purpose: "Amazon cloud platform" },
  "gcp": { category: "Cloud", purpose: "Google cloud platform" },
  "azure": { category: "Cloud", purpose: "Microsoft cloud platform" },
  "docker": { category: "DevOps", purpose: "Containerization platform" },
  "kubernetes": { category: "DevOps", purpose: "Container orchestration" },
  "vercel": { category: "Cloud", purpose: "Frontend deployment platform" },
  "netlify": { category: "Cloud", purpose: "Web deployment platform" },
  "github actions": { category: "DevOps", purpose: "CI/CD automation" },
  "terraform": { category: "DevOps", purpose: "Infrastructure as code" },
  "nginx": { category: "DevOps", purpose: "Web server and reverse proxy" },

  // Auth & Security
  "jwt": { category: "Auth", purpose: "Token-based authentication" },
  "oauth": { category: "Auth", purpose: "Authorization framework" },
  "auth0": { category: "Auth", purpose: "Authentication service" },

  // Other
  "blockchain": { category: "Web3", purpose: "Distributed ledger technology" },
  "ethereum": { category: "Web3", purpose: "Smart contract platform" },
  "solidity": { category: "Web3", purpose: "Smart contract language" },
  "websocket": { category: "Networking", purpose: "Real-time communication" },
  "kafka": { category: "Messaging", purpose: "Event streaming platform" },
  "rabbitmq": { category: "Messaging", purpose: "Message broker" },
  "celery": { category: "Backend", purpose: "Distributed task queue" },
};

// ─── Domain / Concept Keywords ──────────────────────────────────────────────

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  "Computer Vision": ["image", "vision", "visual", "object detection", "segmentation", "recognition", "face", "ocr", "camera", "video", "pixel", "cnn", "yolo", "opencv"],
  "Natural Language Processing": ["nlp", "text", "language", "sentiment", "translation", "chatbot", "tokeniz", "embedding", "transformer", "bert", "gpt", "llm", "speech", "voice"],
  "Deep Learning": ["neural", "deep learning", "training", "epoch", "backpropagation", "gradient", "layer", "activation", "loss function", "optimizer"],
  "Machine Learning": ["classification", "regression", "clustering", "prediction", "model", "feature engineering", "training data", "supervised", "unsupervised"],
  "Web Development": ["web", "website", "frontend", "backend", "api", "rest", "http", "browser", "responsive", "seo", "dom"],
  "Mobile Development": ["mobile", "android", "ios", "app", "flutter", "react native", "swift", "kotlin"],
  "Data Science": ["data analysis", "analytics", "visualization", "dashboard", "statistics", "dataset", "pandas", "notebook"],
  "Cloud Computing": ["cloud", "serverless", "microservice", "scalable", "deploy", "container", "aws", "gcp", "azure"],
  "Cybersecurity": ["security", "encryption", "vulnerability", "authentication", "firewall", "penetration", "cyber", "privacy"],
  "IoT": ["iot", "sensor", "embedded", "arduino", "raspberry", "mqtt", "edge computing"],
  "Blockchain": ["blockchain", "crypto", "smart contract", "decentralized", "nft", "token", "ethereum", "solidity"],
  "Healthcare AI": ["medical", "health", "patient", "diagnosis", "clinical", "drug", "hospital", "disease", "treatment"],
  "Agriculture": ["crop", "farm", "plant", "agriculture", "soil", "irrigation", "harvest", "pest"],
  "E-Commerce": ["ecommerce", "shopping", "cart", "payment", "product", "checkout", "marketplace", "store"],
  "Education": ["learning", "education", "student", "course", "quiz", "tutorial", "lms", "e-learning"],
  "Robotics": ["robot", "autonomous", "drone", "navigation", "slam", "actuator", "lidar"],
  "Fintech": ["finance", "banking", "payment", "trading", "stock", "portfolio", "loan", "fintech"],
};

// ─── Stop Words ─────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "have",
  "has", "had", "do", "does", "did", "will", "would", "could", "should", "may",
  "might", "shall", "can", "need", "dare", "to", "of", "in", "for", "on", "with",
  "at", "by", "from", "as", "into", "through", "during", "before", "after", "above",
  "below", "between", "under", "again", "further", "then", "once", "here", "there",
  "when", "where", "why", "how", "all", "both", "each", "few", "more", "most",
  "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than",
  "too", "very", "just", "because", "if", "or", "and", "but", "about", "this",
  "that", "these", "those", "it", "its", "i", "me", "my", "we", "our", "you",
  "your", "he", "him", "his", "she", "her", "they", "them", "their", "what",
  "which", "who", "whom", "also", "using", "use", "used", "based", "provide",
  "include", "system", "approach", "method", "paper", "propose", "proposed",
  "implement", "implementation", "result", "show", "work", "make", "new",
]);

// ─── Public API ─────────────────────────────────────────────────────────────

export interface ExtractedConcept {
  concept_name: string;
  normalized_concept: string;
  description: string;
  importance_score: number;
}

export interface ExtractedFeature {
  feature_name: string;
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
  status: "planned";
}

export interface ExtractedTechnology {
  technology_name: string;
  category: string;
  purpose: string;
  confidence_score: number;
}

export interface ProjectAnalysis {
  project_title: string;
  summary: string;
  problem_statement: string;
  proposed_solution: string;
  target_users: string[];
  domains: string[];
  concepts: ExtractedConcept[];
  features: ExtractedFeature[];
  technologies: ExtractedTechnology[];
  complexity: { score: number; level: string };
}

/**
 * Full project analysis from raw text.
 */
export function analyzeProjectText(text: string, providedTitle?: string): ProjectAnalysis {
  const lowerText = text.toLowerCase();
  const sentences = text.split(/[.!?\n]+/).map((s) => s.trim()).filter((s) => s.length > 10);

  // 1. Extract title
  const title = providedTitle || extractTitle(text, sentences);

  // 2. Detect technologies
  const technologies = detectTechnologies(lowerText);

  // 3. Detect domains
  const domains = detectDomains(lowerText);

  // 4. Extract key concepts
  const concepts = extractConcepts(text, lowerText, domains);

  // 5. Extract features
  const features = extractFeatures(sentences, lowerText);

  // 6. Generate summary, problem, solution
  const summary = generateSummary(sentences, title, domains);
  const problem = extractProblem(sentences, lowerText);
  const solution = extractSolution(sentences, lowerText);

  // 7. Identify target users
  const targetUsers = identifyTargetUsers(lowerText, domains);

  // 8. Calculate complexity
  const complexity = calculateComplexity(text, technologies, features, concepts);

  return {
    project_title: title,
    summary,
    problem_statement: problem,
    proposed_solution: solution,
    target_users: targetUsers,
    domains,
    concepts,
    features,
    technologies,
    complexity,
  };
}

// ─── Internal Functions ─────────────────────────────────────────────────────

function extractTitle(text: string, sentences: string[]): string {
  // Use first meaningful sentence or first line
  const firstLine = text.split("\n").find((l) => l.trim().length > 5)?.trim() || "";
  if (firstLine.length < 80 && firstLine.length > 5) {
    return firstLine.replace(/^#+\s*/, "");
  }
  // Fallback: first short sentence
  const short = sentences.find((s) => s.length > 10 && s.length < 80);
  return short || "Research Project Analysis";
}

function detectTechnologies(lowerText: string): ExtractedTechnology[] {
  const found: ExtractedTechnology[] = [];
  const seen = new Set<string>();

  // Sort by key length descending to match longer phrases first
  const sorted = Object.entries(TECH_DB).sort((a, b) => b[0].length - a[0].length);

  for (const [key, info] of sorted) {
    if (seen.has(info.purpose)) continue;
    // Use word boundary-ish matching
    const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(lowerText)) {
      const occurrences = (lowerText.match(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) || []).length;
      found.push({
        technology_name: key.charAt(0).toUpperCase() + key.slice(1),
        category: info.category,
        purpose: info.purpose,
        confidence_score: Math.min(0.95, 0.6 + occurrences * 0.1),
      });
      seen.add(info.purpose);
    }
  }

  return found.sort((a, b) => b.confidence_score - a.confidence_score).slice(0, 10);
}

function detectDomains(lowerText: string): string[] {
  const domainScores: [string, number][] = [];

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      const matches = (lowerText.match(regex) || []).length;
      score += matches;
    }
    if (score > 0) {
      domainScores.push([domain, score]);
    }
  }

  return domainScores
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([d]) => d);
}

function extractConcepts(text: string, lowerText: string, domains: string[]): ExtractedConcept[] {
  // Extract meaningful multi-word phrases
  const words = text.split(/\s+/).map((w) => w.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase()).filter(Boolean);
  const wordFreq: Record<string, number> = {};

  for (const w of words) {
    if (w.length < 4 || STOP_WORDS.has(w)) continue;
    wordFreq[w] = (wordFreq[w] || 0) + 1;
  }

  // Get bigrams
  const bigrams: Record<string, number> = {};
  for (let i = 0; i < words.length - 1; i++) {
    if (STOP_WORDS.has(words[i]) || STOP_WORDS.has(words[i + 1])) continue;
    if (words[i].length < 3 || words[i + 1].length < 3) continue;
    const bg = `${words[i]} ${words[i + 1]}`;
    bigrams[bg] = (bigrams[bg] || 0) + 1;
  }

  // Combine and rank
  const concepts: ExtractedConcept[] = [];

  // Add domain-specific concepts first
  for (const domain of domains) {
    concepts.push({
      concept_name: domain,
      normalized_concept: domain.toLowerCase().replace(/\s+/g, "_"),
      description: `Core domain area involving ${domain.toLowerCase()} techniques and methodologies.`,
      importance_score: 0.9,
    });
  }

  // Add high-frequency bigrams as concepts
  const sortedBigrams = Object.entries(bigrams)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  for (const [bg, count] of sortedBigrams) {
    const name = bg.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    if (concepts.some((c) => c.concept_name.toLowerCase() === name.toLowerCase())) continue;
    concepts.push({
      concept_name: name,
      normalized_concept: bg.replace(/\s+/g, "_"),
      description: `Key concept mentioned ${count} times in the project description.`,
      importance_score: Math.min(0.95, 0.5 + count * 0.1),
    });
  }

  // Add high-frequency single words
  const sortedWords = Object.entries(wordFreq)
    .filter(([w, count]) => count >= 3 && w.length >= 5)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  for (const [w, count] of sortedWords) {
    const name = w.charAt(0).toUpperCase() + w.slice(1);
    if (concepts.some((c) => c.concept_name.toLowerCase() === name.toLowerCase())) continue;
    concepts.push({
      concept_name: name,
      normalized_concept: w,
      description: `Frequently referenced concept in the project (${count} mentions).`,
      importance_score: Math.min(0.9, 0.4 + count * 0.08),
    });
  }

  return concepts.sort((a, b) => b.importance_score - a.importance_score).slice(0, 8);
}

function extractFeatures(sentences: string[], lowerText: string): ExtractedFeature[] {
  const featurePatterns = [
    { pattern: /(?:support|enable|allow|provide|implement|feature|capability)\w*\s+(.{10,60})/gi, category: "Core" },
    { pattern: /(?:real[- ]time|live|instant)\s+(.{5,50})/gi, category: "Performance" },
    { pattern: /(?:user|users can|interface for)\s+(.{10,60})/gi, category: "UX" },
    { pattern: /(?:api|endpoint|service|microservice)\s+(?:for\s+)?(.{5,50})/gi, category: "API" },
    { pattern: /(?:train|inference|predict|classify|detect|recogni[zs]e)\w*\s+(.{5,50})/gi, category: "AI" },
    { pattern: /(?:upload|download|import|export)\s+(.{5,50})/gi, category: "Data" },
    { pattern: /(?:dashboard|visualization|chart|report|analytic)\w*\s*(.{0,50})/gi, category: "Analytics" },
    { pattern: /(?:authentication|authorization|login|signup|register)\w*\s*(.{0,40})/gi, category: "Auth" },
    { pattern: /(?:notification|alert|email|sms|push)\w*\s*(.{0,40})/gi, category: "Notifications" },
    { pattern: /(?:search|filter|sort|browse|discover)\w*\s+(.{5,50})/gi, category: "Search" },
  ];

  const features: ExtractedFeature[] = [];
  const seen = new Set<string>();

  for (const { pattern, category } of featurePatterns) {
    let match;
    while ((match = pattern.exec(lowerText)) !== null) {
      let featureName = match[1]?.trim().replace(/[.,;:!?]+$/, "").trim();
      if (!featureName || featureName.length < 5) continue;
      featureName = featureName.charAt(0).toUpperCase() + featureName.slice(1);

      const key = featureName.toLowerCase().slice(0, 20);
      if (seen.has(key)) continue;
      seen.add(key);

      features.push({
        feature_name: featureName.slice(0, 60),
        description: `${category}-related capability: ${featureName}`,
        category,
        priority: features.length < 3 ? "high" : features.length < 6 ? "medium" : "low",
        status: "planned",
      });
    }
  }

  // If too few features, generate from sentences
  if (features.length < 3) {
    const actionSentences = sentences.filter(
      (s) => /\b(will|should|can|must|need|able)\b/i.test(s) && s.length < 100
    );
    for (const s of actionSentences.slice(0, 5)) {
      const name = s.replace(/^(the |this |our |we |it )/i, "").slice(0, 60);
      const key = name.toLowerCase().slice(0, 20);
      if (seen.has(key)) continue;
      seen.add(key);
      features.push({
        feature_name: name,
        description: s,
        category: "Core",
        priority: "medium",
        status: "planned",
      });
    }
  }

  return features.slice(0, 8);
}

function generateSummary(sentences: string[], title: string, domains: string[]): string {
  const meaningfulSentences = sentences.filter((s) => s.length > 30 && s.length < 200);
  if (meaningfulSentences.length >= 2) {
    return meaningfulSentences.slice(0, 2).join(". ") + ".";
  }
  return `${title} is a project spanning ${domains.join(", ")} that aims to deliver an innovative solution in its target domain.`;
}

function extractProblem(sentences: string[], lowerText: string): string {
  const problemIndicators = ["problem", "challenge", "issue", "gap", "lack", "difficult", "limitation", "current", "existing"];
  for (const s of sentences) {
    const lower = s.toLowerCase();
    if (problemIndicators.some((ind) => lower.includes(ind)) && s.length > 20) {
      return s;
    }
  }
  return "The project addresses a gap in its target domain by providing a more efficient and accessible solution compared to existing approaches.";
}

function extractSolution(sentences: string[], lowerText: string): string {
  const solutionIndicators = ["solution", "propose", "develop", "build", "create", "design", "approach", "platform", "framework", "tool"];
  for (const s of sentences) {
    const lower = s.toLowerCase();
    if (solutionIndicators.some((ind) => lower.includes(ind)) && s.length > 20) {
      return s;
    }
  }
  return "The proposed solution leverages modern technologies and methodologies to deliver a comprehensive, user-friendly implementation.";
}

function identifyTargetUsers(lowerText: string, domains: string[]): string[] {
  const userMap: Record<string, string[]> = {
    "Healthcare AI": ["Medical Professionals", "Hospital Administrators", "Patients", "Clinical Researchers"],
    "Agriculture": ["Farmers", "Agronomists", "Agricultural Extension Officers"],
    "E-Commerce": ["Online Shoppers", "Store Owners", "Marketing Teams"],
    "Education": ["Students", "Teachers", "Educational Institutions"],
    "Fintech": ["Financial Analysts", "Traders", "Banking Customers"],
    "Data Science": ["Data Scientists", "Business Analysts", "Researchers"],
    "Web Development": ["End Users", "Web Developers", "Content Managers"],
    "Mobile Development": ["Mobile Users", "App Developers"],
    "Cybersecurity": ["Security Engineers", "IT Administrators", "Enterprise Teams"],
  };

  const users = new Set<string>();
  for (const domain of domains) {
    if (userMap[domain]) {
      userMap[domain].forEach((u) => users.add(u));
    }
  }

  if (users.size === 0) {
    users.add("Developers");
    users.add("Researchers");
    users.add("End Users");
  }

  return Array.from(users).slice(0, 5);
}

function calculateComplexity(
  text: string,
  technologies: ExtractedTechnology[],
  features: ExtractedFeature[],
  concepts: ExtractedConcept[]
): { score: number; level: string } {
  let score = 30; // Base

  // Length factor
  score += Math.min(15, Math.floor(text.length / 500));

  // Technology count
  score += Math.min(20, technologies.length * 3);

  // Feature count
  score += Math.min(15, features.length * 2);

  // AI/ML involvement
  if (technologies.some((t) => t.category === "AI / ML")) score += 10;

  // Concept complexity
  score += Math.min(10, concepts.length * 1.5);

  score = Math.min(95, Math.max(20, score));

  let level = "Beginner";
  if (score >= 80) level = "Expert";
  else if (score >= 65) level = "Advanced";
  else if (score >= 45) level = "Intermediate";

  return { score: Math.round(score), level };
}

/**
 * Extract text content from a File object.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".csv")) {
    return await file.text();
  }

  if (name.endsWith(".pdf")) {
    // For PDF, we extract what we can from the raw binary
    const buffer = await file.arrayBuffer();
    return extractTextFromPDFBuffer(buffer);
  }

  // For other file types, try reading as text
  try {
    return await file.text();
  } catch {
    return `[Uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`;
  }
}

function extractTextFromPDFBuffer(buffer: ArrayBuffer): string {
  // Simple PDF text extractor — extracts text between stream markers
  const bytes = new Uint8Array(buffer);
  let text = "";

  // Convert to string for pattern matching
  const decoder = new TextDecoder("latin1");
  const raw = decoder.decode(bytes);

  // Extract text objects between BT and ET markers
  const textBlocks = raw.match(/BT[\s\S]*?ET/g) || [];
  for (const block of textBlocks) {
    const textParts = block.match(/\(([^)]*)\)/g) || [];
    for (const part of textParts) {
      const cleaned = part.slice(1, -1).replace(/\\n/g, "\n").replace(/\\\\/g, "\\");
      text += cleaned + " ";
    }
    // Also try Tj and TJ operators
    const tjParts = block.match(/\[([^\]]*)\]\s*TJ/g) || [];
    for (const tj of tjParts) {
      const strings = tj.match(/\(([^)]*)\)/g) || [];
      for (const s of strings) {
        text += s.slice(1, -1) + " ";
      }
    }
  }

  // If we couldn't extract much, provide a fallback
  if (text.trim().length < 50) {
    // Try to extract any readable ASCII strings
    const asciiMatch = raw.match(/[\x20-\x7E]{20,}/g) || [];
    text = asciiMatch.join(" ");
  }

  return text.trim() || "PDF content could not be fully extracted in browser. Please paste the text directly for best results.";
}

/**
 * Generate search queries from analysis for Semantic Scholar.
 */
export function generateSearchQueries(analysis: ProjectAnalysis): string[] {
  const queries: string[] = [];

  // Main title query
  queries.push(analysis.project_title);

  // Domain + key concept combinations
  for (const domain of analysis.domains.slice(0, 2)) {
    queries.push(domain);
    for (const concept of analysis.concepts.slice(0, 2)) {
      queries.push(`${domain} ${concept.concept_name}`);
    }
  }

  // Feature-based queries
  for (const feature of analysis.features.slice(0, 3)) {
    queries.push(feature.feature_name);
  }

  // Technology-specific queries
  const aiTechs = analysis.technologies.filter((t) => t.category === "AI / ML");
  for (const tech of aiTechs.slice(0, 2)) {
    queries.push(`${tech.technology_name} ${analysis.domains[0] || "applications"}`);
  }

  return [...new Set(queries)].slice(0, 8);
}
