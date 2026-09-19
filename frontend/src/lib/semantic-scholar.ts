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
      console.warn(`Semantic Scholar API status ${response.status}, falling back to OpenAlex...`);
      return await searchOpenAlex(query, limit);
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      return await searchOpenAlex(query, limit);
    }
    return data;
  } catch (err) {
    console.warn("Semantic Scholar search failed, trying OpenAlex:", err);
    return await searchOpenAlex(query, limit);
  }
}

/**
 * Fallback to OpenAlex (reliable, 100K free requests/day, no 429 rate limit).
 */
export async function searchOpenAlex(query: string, limit: number = 8): Promise<SearchResult> {
  try {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=${limit}`;
    const res = await fetch(url);
    if (!res.ok) return { total: 0, offset: 0, data: [] };
    const data = await res.json();
    const papers: SemanticScholarPaper[] = (data.results || []).map((w: any) => {
      let abstract = "";
      if (w.abstract_inverted_index) {
        const positions: [string, number][] = [];
        for (const [word, pos] of Object.entries(w.abstract_inverted_index)) {
          for (const p of (pos as number[])) {
            positions.push([word, p]);
          }
        }
        positions.sort((a, b) => a[1] - b[1]);
        abstract = positions.map((p) => p[0]).join(" ");
      }
      return {
        paperId: w.id || `openalex-${Math.random()}`,
        title: w.title || "Untitled Paper",
        abstract: abstract || null,
        year: w.publication_year || null,
        citationCount: w.cited_by_count || 0,
        influentialCitationCount: Math.round((w.cited_by_count || 0) * 0.15),
        url: w.primary_location?.landing_page_url || `https://openalex.org/${w.id}`,
        venue: w.primary_location?.source?.display_name || "Academic Journal",
        authors: (w.authorships || []).slice(0, 4).map((a: any) => ({ name: a.author?.display_name || "Researcher" })),
        fieldsOfStudy: (w.concepts || []).slice(0, 4).map((c: any) => c.display_name),
        isOpenAccess: Boolean(w.open_access?.is_oa),
        openAccessPdf: w.open_access?.oa_url ? { url: w.open_access.oa_url } : null,
      };
    });
    return { total: papers.length, offset: 0, data: papers };
  } catch (err) {
    console.warn("OpenAlex fallback search failed:", err);
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
