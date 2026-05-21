// Semantic Memory Graph for Sam
// Stores and retrieves conversations, facts, and decisions
// Phase 1: Simple semantic matching using Google Sheets

export class SemanticMemory {
  constructor(env) {
    this.env = env;
    this.memories = new Map(); // In-memory cache for this Worker invocation
    this.invertedIndex = new Map(); // Inverted index mapping word -> Set of memory IDs
    this.sheetId = env.MEMORY_SHEET_ID;
  }

  async store(category, content, context = {}) {
    // Store a memory with metadata
    const embedding = this.getSimpleEmbedding(content);
    let magnitudeSq = 0;
    for (const count of embedding.values()) {
      magnitudeSq += count * count;
    }
    const embeddingMagnitude = Math.sqrt(magnitudeSq);

    const memory = {
      id: this.generateId(),
      category, // 'conversation', 'decision', 'capability', 'failure'
      content,
      timestamp: new Date().toISOString(),
      context, // { department, action, owner_decision, etc }
      embedding, // Phase 1: keyword-based
      embeddingMagnitude,
    };

    // Cache in memory
    this.memories.set(memory.id, memory);

    // Update inverted index
    for (const word of embedding.keys()) {
      let docIds = this.invertedIndex.get(word);
      if (!docIds) {
        docIds = new Set();
        this.invertedIndex.set(word, docIds);
      }
      docIds.add(memory.id);
    }

    // Save to Google Sheets
    if (this.sheetId) {
      await this.saveToSheet(memory);
    }

    return memory.id;
  }

  async retrieve(query, options = {}) {
    // Find relevant memories based on semantic similarity
    const { limit = 3, category = null, minScore = 0.3 } = options;

    const queryEmbedding = this.getSimpleEmbedding(query);

    // Calculate query magnitude
    let queryMagSq = 0;
    for (const count of queryEmbedding.values()) {
      queryMagSq += count * count;
    }
    const queryMagnitude = Math.sqrt(queryMagSq);

    const candidateIds = new Set();

    // Collect candidate IDs from inverted index
    for (const word of queryEmbedding.keys()) {
      const docIds = this.invertedIndex.get(word);
      if (docIds) {
        for (const id of docIds) {
          candidateIds.add(id);
        }
      }
    }

    const results = [];

    // Evaluate candidates
    for (const id of candidateIds) {
      const memory = this.memories.get(id);
      if (!memory) continue; // Should not happen, but safe check
      if (category && memory.category !== category) continue;

      // Faster cosine similarity with precalculated magnitudes
      let dotProduct = 0;
      for (const [word, queryCount] of queryEmbedding.entries()) {
        const memoryCount = memory.embedding.get(word);
        if (memoryCount) {
          dotProduct += queryCount * memoryCount;
        }
      }

      // Fallback in case magnitude isn't cached (e.g. legacy data)
      let memMag = memory.embeddingMagnitude;
      if (memMag === undefined) {
        let memMagSq = 0;
        for (const count of memory.embedding.values()) {
          memMagSq += count * count;
        }
        memMag = Math.sqrt(memMagSq);
      }

      const score = (queryMagnitude === 0 || memMag === 0) ? 0 : (dotProduct / (queryMagnitude * memMag));

      if (score >= minScore) {
        results.push({ ...memory, relevanceScore: score });
      }
    }

    // Load from Google Sheets if needed (future optimization)
    // const sheetResults = await this.loadFromSheet(query, category);
    // results.push(...sheetResults);

    // Sort by relevance and return top N
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return results.slice(0, limit);
  }

  getSimpleEmbedding(text) {
    // Phase 1: Simple keyword-based embedding
    // Extract key terms and their frequencies
    const words = text.toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 3); // Filter short words

    const embedding = new Map();
    for (const word of words) {
      embedding.set(word, (embedding.get(word) || 0) + 1);
    }
    return embedding;
  }

  cosineSimilarity(embedding1, embedding2) {
    // Calculate cosine similarity between two embeddings
    // Used externally or when magnitude is not precalculated
    let dotProduct = 0;
    let magnitudeSq1 = 0;
    let magnitudeSq2 = 0;

    // Only iterate over the smaller embedding to calculate dot product
    const [smaller, larger] = embedding1.size < embedding2.size ? [embedding1, embedding2] : [embedding2, embedding1];

    for (const [word, v1] of smaller.entries()) {
      const v2 = larger.get(word);
      if (v2) {
        dotProduct += v1 * v2;
      }
    }

    for (const v1 of embedding1.values()) magnitudeSq1 += v1 * v1;
    for (const v2 of embedding2.values()) magnitudeSq2 += v2 * v2;

    if (magnitudeSq1 === 0 || magnitudeSq2 === 0) return 0;
    return dotProduct / (Math.sqrt(magnitudeSq1) * Math.sqrt(magnitudeSq2));
  }

  async saveToSheet(memory) {
    // Save to Google Sheets for persistence
    // Format: [ID, Category, Content, Timestamp, Context, Score]
    try {
      const range = `'Memories'!A:F`;
      const values = [[
        memory.id,
        memory.category,
        memory.content.substring(0, 500), // Truncate long content
        memory.timestamp,
        JSON.stringify(memory.context),
        0, // relevance score (updated during retrieval)
      ]];

      // Use Google Sheets API to append
      // Note: Requires Sheets API key or OAuth token
      // Implementation depends on auth method
    } catch (e) {
      console.error('[Memory] Sheet save failed:', e.message);
    }
  }

  async loadFromSheet(query, category) {
    // Load memories from Google Sheets
    // Phase 2: Implement full Sheets sync
    return [];
  }

  recordDecision(actionId, description, decision, reasoning) {
    // Record Sam's decisions for audit trail
    return this.store('decision', `Action: ${actionId} → ${decision}: ${reasoning}`, {
      actionId,
      description,
      decision,
      reasoning,
      type: 'owner_approval',
    });
  }

  recordFailure(department, action, error, attemptCount) {
    // Record failures for the Three-Try Rule
    return this.store('failure', `${department}: ${action} failed - ${error}`, {
      department,
      action,
      error,
      attemptCount,
      type: 'three_try_rule',
    });
  }

  recordCapability(department, skill, description) {
    // Record new capabilities acquired
    return this.store('capability', `${department} learned: ${skill} - ${description}`, {
      department,
      skill,
      type: 'new_capability',
    });
  }

  generateId() {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public KPI summary
  getSummary() {
    return {
      total_memories: this.memories.size,
      categories: {
        conversations: Array.from(this.memories.values()).filter(m => m.category === 'conversation').length,
        decisions: Array.from(this.memories.values()).filter(m => m.category === 'decision').length,
        capabilities: Array.from(this.memories.values()).filter(m => m.category === 'capability').length,
        failures: Array.from(this.memories.values()).filter(m => m.category === 'failure').length,
      },
    };
  }
}

// Usage Example:
/*
import { SemanticMemory } from '../utils/memory.js';

export default {
  async fetch(request, env) {
    const memory = new SemanticMemory(env);

    // Record a conversation
    memory.store('conversation', 'User asked about revenue niches', {
      department: 'Innovation_Scout',
      user_query: 'What are the best niches for 2025?',
    });

    // Retrieve related memories
    const relevant = await memory.retrieve('revenue opportunities', {
      category: 'conversation',
      limit: 5,
    });

    return new Response(JSON.stringify(relevant));
  }
}
*/
