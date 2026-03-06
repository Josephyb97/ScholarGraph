/**
 * PubMed Central (PMC) Adapter - Free full-text biomedical literature
 * PMC 适配器 - 免费生物医学全文文献
 */

import type { SearchResult } from '../types';
import { getErrorMessage } from '../../../shared/errors';

const PMC_API_URL = 'https://www.ncbi.nlm.nih.gov/pmc/utils/oa/oa.fcgi';
const EUROPE_PMC_API = 'https://www.ebi.ac.uk/europepmc/webservices/rest';

export class PmcAdapter {
  /**
   * Get PDF URL from PubMed Central by PMC ID
   */
  async getPdfUrlByPmcId(pmcId: string): Promise<string | undefined> {
    try {
      // Remove PMC prefix if present
      const cleanId = pmcId.replace(/^PMC/i, '');

      const url = `${PMC_API_URL}?id=PMC${cleanId}`;
      const response = await fetch(url);
      const text = await response.text();

      // Parse XML response to find PDF link
      const pdfMatch = text.match(/<link format="pdf"[^>]*href="([^"]+)"/);
      if (pdfMatch) {
        return pdfMatch[1];
      }

      return undefined;
    } catch (error) {
      console.error('PMC lookup error:', getErrorMessage(error));
      return undefined;
    }
  }

  /**
   * Get PDF URL from Europe PMC by DOI or PMID
   */
  async getEuropePmcPdfUrl(result: SearchResult): Promise<string | undefined> {
    try {
      let query = '';
      if (result.doi) {
        query = `DOI:${result.doi}`;
      } else if (result.pmid) {
        query = `EXT_ID:${result.pmid}`;
      } else {
        return undefined;
      }

      const url = `${EUROPE_PMC_API}/search?query=${encodeURIComponent(query)}&format=json`;
      const response = await fetch(url);
      const data = await response.json() as {
        resultList?: {
          result?: Array<{
            pmcid?: string;
            isOpenAccess?: string;
            fullTextUrlList?: {
              fullTextUrl?: Array<{
                documentStyle?: string;
                url?: string;
              }>;
            };
          }>;
        };
      };

      const results = data.resultList?.result;
      if (!results || results.length === 0) return undefined;

      const paper = results[0];

      // Check if open access
      if (paper.isOpenAccess !== 'Y') return undefined;

      // Find PDF URL
      const urls = paper.fullTextUrlList?.fullTextUrl || [];
      const pdfUrl = urls.find(u => u.documentStyle === 'pdf')?.url;

      if (pdfUrl) return pdfUrl;

      // If PMC ID available, try direct PMC lookup
      if (paper.pmcid) {
        return await this.getPdfUrlByPmcId(paper.pmcid);
      }

      return undefined;
    } catch (error) {
      console.error('Europe PMC lookup error:', getErrorMessage(error));
      return undefined;
    }
  }

  /**
   * Resolve PDF URL using both PMC and Europe PMC
   */
  async getPdfUrl(result: SearchResult): Promise<string | undefined> {
    // Try PMC first if PMC ID is available
    if (result.pmcId) {
      const pmcUrl = await this.getPdfUrlByPmcId(result.pmcId);
      if (pmcUrl) return pmcUrl;
    }

    // Try Europe PMC
    if (result.doi || result.pmid) {
      const europePmcUrl = await this.getEuropePmcPdfUrl(result);
      if (europePmcUrl) return europePmcUrl;
    }

    return undefined;
  }
}
