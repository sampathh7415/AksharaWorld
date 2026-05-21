// Semantic Memory Graph for Sam
// Stores and retrieves conversations, facts, and decisions
// Phase 1: Simple semantic matching using Google Sheets

export class SemanticMemory {
  constructor(env) {
    this.env = env;
    this.memories = new Map(); // In-memory cache for this Worker invocation
    this.sheetId = env.MEMORY_SHEET_ID;
  }

  async store(category, content, context = {}) {
    // Store a memory with metadata
    const memory = {
      id: this.generateId(),
      category, // 'conversation', 'decision', 'capability', 'failure'
      content,
      timestamp: new Date().toISOString(),
      context, // { department, action, owner_decision, etc }
      embedding: this.getSimpleEmbedding(content), // Phase 1: keyword-based
    };

    // Cache in memory
    this.memories.set(memory.id, memory);

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
    const results = [];

    // Search in-memory cache
    for (const [id, memory] of this.memories.entries()) {
      if (category && memory.category !== category) continue;

      const score = this.cosineSimilarity(queryEmbedding, memory.embedding);
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
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    const allWords = new Set([...embedding1.keys(), ...embedding2.keys()]);

    for (const word of allWords) {
      const v1 = embedding1.get(word) || 0;
      const v2 = embedding2.get(word) || 0;

      dotProduct += v1 * v2;
      magnitude1 += v1 * v1;
      magnitude2 += v2 * v2;
    }

    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
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
