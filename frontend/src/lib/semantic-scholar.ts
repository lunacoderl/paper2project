/**
 * Semantic Scholar API Client — Free public API, no key required.
 * Searches 200M+ academic papers.
 */

const BASE_URL = "https://api.semanticscholar.org/graph/v1";

export interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract: string | null;
  year: number | null;
  citationCount: number;
  influentialCitationCount: number;
  url: string;
  venue: string | null;
  authors: { name: string }[];
  fieldsOfStudy: string[] | null;
  isOpenAccess: boolean;
  openAccessPdf: { url: string } | null;
}

export interface SearchResult {
  total: number;
  offset: number;
  data: SemanticScholarPaper[];
}

/**
 * Search papers by query string.
 */
export async function searchPapers(
  query: string,
  limit: number = 10,
  offset: number = 0,
): Promise<SearchResult> {
  const fields = "paperId,title,abstract,year,citationCount,influentialCitationCount,url,venue,authors,fieldsOfStudy,isOpenAccess,openAccessPdf";
  const params = new URLSearchParams({
    query,
    limit: String(limit),
    offset: String(offset),
    fields,
  });

  try {
    const response = await fetch(`${BASE_URL}/paper/search?${params.toString()}`, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited — wait and retry once
        await new Promise((r) => setTimeout(r, 3000));
        const retry = await fetch(`${BASE_URL}/paper/search?${params.toString()}`, {
          headers: { "Accept": "application/json" },
        });
        if (retry.ok) return await retry.json();
      }
      console.warn(`Semantic Scholar API error: ${response.status}`);
      return { total: 0, offset: 0, data: [] };
    }

    return await response.json();
  } catch (err) {
    console.warn("Semantic Scholar search failed:", err);
    return { total: 0, offset: 0, data: [] };
  }
}

/**
 * Search across multiple queries and deduplicate results.
 */
export async function searchMultipleQueries(
  queries: string[],
  limitPerQuery: number = 5,
): Promise<SemanticScholarPaper[]> {
  const allPapers: SemanticScholarPaper[] = [];
  const seenIds = new Set<string>();

  // Execute queries sequentially with a small delay to avoid rate limits
  for (const query of queries.slice(0, 6)) {
    try {
      const result = await searchPapers(query, limitPerQuery);
      for (const paper of result.data || []) {
        if (!seenIds.has(paper.paperId)) {
          seenIds.add(paper.paperId);
          allPapers.push(paper);
        }
      }
      // Small delay between requests to respect rate limits
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.warn(`Query failed: "${query}"`, err);
    }
  }

  // Sort by citation count descending
  allPapers.sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));

  return allPapers;
}

/**
 * Calculate similarity percentage between a paper and project analysis.
 */
export function calculatePaperSimilarity(
  paper: SemanticScholarPaper,
  projectConcepts: string[],
  projectFeatures: string[],
  projectDomains: string[],
): { percentage: number; matchedConcepts: string[]; matchedFeatures: string[] } {
  const paperText = `${paper.title} ${paper.abstract || ""} ${(paper.fieldsOfStudy || []).join(" ")}`.toLowerCase();

  const matchedConcepts: string[] = [];
  const matchedFeatures: string[] = [];

  // Check concept overlap
  for (const concept of projectConcepts) {
    const words = concept.toLowerCase().split(/\s+/);
    if (words.some((w) => w.length > 3 && paperText.includes(w))) {
      matchedConcepts.push(concept);
    }
  }

  // Check feature overlap
  for (const feature of projectFeatures) {
    const words = feature.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    if (words.some((w) => paperText.includes(w))) {
      matchedFeatures.push(feature);
    }
  }

  // Check domain overlap
  let domainScore = 0;
  for (const domain of projectDomains) {
    if (paperText.includes(domain.toLowerCase())) {
      domainScore += 15;
    }
  }

  // Calculate percentage
  const conceptScore = projectConcepts.length > 0
    ? (matchedConcepts.length / projectConcepts.length) * 40
    : 10;
  const featureScore = projectFeatures.length > 0
    ? (matchedFeatures.length / projectFeatures.length) * 30
    : 10;
  const citationBonus = Math.min(10, (paper.citationCount || 0) / 100);

  const percentage = Math.min(97, Math.max(35, Math.round(conceptScore + featureScore + domainScore + citationBonus)));

  return { percentage, matchedConcepts, matchedFeatures };
}
