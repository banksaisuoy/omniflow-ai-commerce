import { UserBehavior } from '../models/userBehaviorModel.js';
import { RecommendationCache } from './recommendation-cache.js';
import natural from 'natural';

export class RecommendationEngine {
  constructor() {
    this.popularProductsCache = null;
    this.popularProductsLastUpdated = null;
  }

  /**
   * Helper to compute cosine similarity between two vectors
   */
  _cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const key in vecA) {
      if (vecB[key]) {
        dotProduct += vecA[key] * vecB[key];
      }
      normA += vecA[key] * vecA[key];
    }
    
    for (const key in vecB) {
      normB += vecB[key] * vecB[key];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Strategy 1: Collaborative Filtering (User-Item Matrix)
   * Simplified implementation simulating user-item vectors
   */
  async getCollaborativeRecommendations(userId, limit = 10) {
    try {
      // 1. Get current user's interactions
      const userInteractions = await UserBehavior.find({ userId }).lean();
      if (!userInteractions.length) return [];

      // Create a weighted vector for the user based on interaction types
      const weights = { view: 1, click: 2, like: 3, add_to_cart: 4, purchase: 5, share: 3 };
      const userVector = {};
      userInteractions.forEach(interaction => {
        userVector[interaction.productId] = (userVector[interaction.productId] || 0) + (weights[interaction.interactionType] || 1);
      });

      // 2. Find similar users (simplified: just find users who interacted with the same items)
      const userProductIds = Object.keys(userVector);
      
      // Batch aggregation to compute similarity and candidates directly in the database where possible,
      // or at least fetch all required data in a minimal number of queries.
      const candidateScores = {};
      
      // Step A: Find users who co-interacted with target user's items and get all their interactions in one go
      const similarUsersHistory = await UserBehavior.aggregate([
        // Find documents of other users who interacted with target's items
        { $match: { productId: { $in: userProductIds }, userId: { $ne: userId } } },
        // Group by user to get the list of users
        { $group: { _id: "$userId" } },
        // Limit to top 100 most active similar users to keep memory footprint bounded
        { $limit: 100 },
        // Lookup their full interaction history in one join-like operation
        {
          $lookup: {
            from: "userbehaviors", // collection name
            localField: "_id",
            foreignField: "userId",
            as: "history"
          }
        }
      ]);

      if (!similarUsersHistory.length) return [];

      // Step B: Calculate similarities and score candidate items in-memory on the bounded dataset
      similarUsersHistory.forEach(otherUserDoc => {
        const otherVector = {};
        
        // Build the vector for this other user
        otherUserDoc.history.forEach(interaction => {
          otherVector[interaction.productId] = (otherVector[interaction.productId] || 0) + (weights[interaction.interactionType] || 1);
        });
        
        const similarity = this._cosineSimilarity(userVector, otherVector);
        
        if (similarity > 0.1) {
          // Score items that the target user hasn't interacted with
          otherUserDoc.history.forEach(interaction => {
            if (!userVector[interaction.productId]) {
               const score = (weights[interaction.interactionType] || 1) * similarity;
               candidateScores[interaction.productId] = (candidateScores[interaction.productId] || 0) + score;
            }
          });
        }
      });

      return Object.entries(candidateScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([productId, score]) => ({
          productId,
          score,
          strategy: 'collaborative'
        }));

    } catch (error) {
      console.error('Collaborative filtering error:', error);
      return [];
    }
  }

  /**
   * Strategy 2: Content-Based Filtering using TF-IDF and Cosine Similarity
   */
  async getContentBasedRecommendations(productId, limit = 10) {
    try {
      // In a real application, product catalog data (titles, descriptions) would be fetched from the database.
      // Since this project may not have a dedicated Product collection yet, we simulate the product corpus here.
      // We assume product descriptions contain keywords related to their categories.
      
      const tfidf = new natural.TfIdf();
      
      // Mock catalog representing what would normally be retrieved from the database
      const mockCatalog = Array.from({ length: 50 }, (_, i) => ({
        id: `prod_${i}`,
        text: `Product ${i} is a great item. ` + 
              ((i % 3 === 0) ? 'electronics gadget tech device' : 
               (i % 3 === 1) ? 'clothing apparel shirt fashion' : 
                               'home kitchen furniture living')
      }));

      // Find the target product's text
      const targetProduct = mockCatalog.find(p => p.id === productId);
      
      if (!targetProduct) {
         // Fallback if item not found in catalog, simulate via co-viewing as before
         return this._getCoViewedFallback(productId, limit);
      }

      // Add all documents to the TF-IDF corpus
      mockCatalog.forEach(prod => {
        tfidf.addDocument(prod.text);
      });

      // We need to compute cosine similarity between the target document's TF-IDF vector 
      // and all other documents' vectors.

      const targetIndex = mockCatalog.findIndex(p => p.id === productId);
      const similarities = [];
      
      const numDocs = mockCatalog.length;
      
      for (let i = 0; i < numDocs; i++) {
        if (i === targetIndex) continue;
        
        // Calculate similarity using vector representation of term frequencies
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        // Compare target document (index targetIndex) with current document (index i)
        const termsTarget = tfidf.listTerms(targetIndex);
        const termsOther = tfidf.listTerms(i);
        
        const vecA = {};
        termsTarget.forEach(item => { vecA[item.term] = item.tfidf; });
        
        const vecB = {};
        termsOther.forEach(item => { vecB[item.term] = item.tfidf; });
        
        // Calculate cosine similarity
        for (const term in vecA) {
          if (vecB[term]) {
             dotProduct += vecA[term] * vecB[term];
          }
          normA += vecA[term] * vecA[term];
        }
        
        for (const term in vecB) {
          normB += vecB[term] * vecB[term];
        }
        
        let similarity = 0;
        if (normA > 0 && normB > 0) {
           similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        }
        
        if (similarity > 0) {
           similarities.push({
             productId: mockCatalog[i].id,
             score: similarity,
             strategy: 'content-based'
           });
        }
      }

      return similarities
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      console.error('Content-based filtering error:', error);
      return [];
    }
  }

  // Fallback if product content isn't available
  async _getCoViewedFallback(productId, limit = 10) {
     const interactions = await UserBehavior.find({ productId }).lean();
      const sessionIds = interactions.map(i => i.sessionId).filter(Boolean);
      
      if (!sessionIds.length) return [];

      const coViewed = await UserBehavior.aggregate([
        { $match: { sessionId: { $in: sessionIds }, productId: { $ne: productId } } },
        { $group: { _id: "$productId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);

      return coViewed.map(item => ({
        productId: item._id,
        score: item.count,
        strategy: 'co-viewed'
      }));
  }

  /**
   * Strategy 3: Popularity Fallback
   */
  async getPopularRecommendations(limit = 10) {
    try {
      // Use short-lived memory cache for popular items to avoid heavy aggregation on every fallback
      const now = Date.now();
      if (this.popularProductsCache && this.popularProductsLastUpdated && (now - this.popularProductsLastUpdated < 300000)) {
        return this.popularProductsCache.slice(0, limit);
      }

      // Aggregate most interacted items in the last 7 days
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      
      const popular = await UserBehavior.aggregate([
        { $match: { timestamp: { $gte: sevenDaysAgo } } },
        { 
          $group: { 
            _id: "$productId", 
            score: { 
              $sum: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$interactionType", "purchase"] }, then: 5 },
                    { case: { $eq: ["$interactionType", "add_to_cart"] }, then: 3 }
                  ],
                  default: 1
                }
              }
            } 
          } 
        },
        { $sort: { score: -1 } },
        { $limit: 100 } // Cache top 100
      ]);

      const results = popular.map(item => ({
        productId: item._id,
        score: item.score,
        strategy: 'popular'
      }));

      this.popularProductsCache = results;
      this.popularProductsLastUpdated = now;

      return results.slice(0, limit);
    } catch (error) {
      console.error('Popular fallback error:', error);
      return [];
    }
  }

  /**
   * Main entry point to get recommendations
   */
  async getRecommendations(userId, context = {}) {
    const { pageType = 'homepage', productId = null, limit = 10 } = context;
    const cacheContext = pageType === 'product' && productId ? `product:${productId}` : pageType;
    
    // 1. Check Cache
    const cached = await RecommendationCache.get(userId, cacheContext);
    if (cached) {
      return cached;
    }

    let recommendations = [];
    const seen = new Set();

    const addRecs = (recs) => {
      for (const rec of recs) {
        if (!seen.has(rec.productId) && recommendations.length < limit) {
          seen.add(rec.productId);
          recommendations.push(rec);
        }
      }
    };

    // 2. Compute based on context
    if (pageType === 'product' && productId) {
      // Content-based / Similar items for product page
      const contentBased = await this.getContentBasedRecommendations(productId, limit);
      addRecs(contentBased);
    } 
    
    // Fill up with collaborative if still space
    if (recommendations.length < limit) {
       const collaborative = await this.getCollaborativeRecommendations(userId, limit);
       addRecs(collaborative);
    }

    // 3. Fallback to Popular
    if (recommendations.length < limit) {
      const popular = await this.getPopularRecommendations(limit);
      addRecs(popular);
    }

    // 4. Update Cache (async, don't await so response is fast)
    RecommendationCache.set(userId, cacheContext, recommendations).catch(console.error);

    return recommendations;
  }
}

export const recommendationEngine = new RecommendationEngine();
