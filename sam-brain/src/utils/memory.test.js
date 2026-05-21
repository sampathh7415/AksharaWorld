import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SemanticMemory } from './memory.js';

describe('SemanticMemory.retrieve', () => {
  test('basic retrieval returns results based on semantic similarity', async () => {
    const memory = new SemanticMemory({ MEMORY_SHEET_ID: null });

    await memory.store('conversation', 'The quick brown fox jumps over the lazy dog', { id: 1 });
    await memory.store('conversation', 'A fast brown fox leaped', { id: 2 });
    await memory.store('decision', 'We decided to use Node.js for backend', { id: 3 });

    const results = await memory.retrieve('quick brown fox');

    assert.equal(results.length > 0, true);
    assert.equal(results[0].context.id, 1, 'The most similar document should be first');
    assert.ok(results[0].relevanceScore > results[1].relevanceScore, 'Higher similarity should have a higher score');
  });

  test('filters by category', async () => {
    const memory = new SemanticMemory({ MEMORY_SHEET_ID: null });

    await memory.store('decision', 'We need more sales to improve revenue', { id: 1 });
    await memory.store('conversation', 'User asked how to improve sales and revenue', { id: 2 });
    await memory.store('capability', 'I know how to track sales', { id: 3 });

    const results = await memory.retrieve('sales revenue', { category: 'conversation' });

    assert.equal(results.length, 1);
    assert.equal(results[0].category, 'conversation');
    assert.equal(results[0].context.id, 2);
  });

  test('respects the limit parameter', async () => {
    const memory = new SemanticMemory({ MEMORY_SHEET_ID: null });

    await memory.store('conversation', 'Revenue is growing steadily', { id: 1 });
    await memory.store('conversation', 'Revenue growth is our main target', { id: 2 });
    await memory.store('conversation', 'We need to focus on revenue', { id: 3 });
    await memory.store('conversation', 'Revenue, revenue, revenue!', { id: 4 });

    const results = await memory.retrieve('revenue', { limit: 2 });

    assert.equal(results.length, 2, 'Should only return the number of items specified by limit');
  });

  test('respects the minScore parameter', async () => {
    const memory = new SemanticMemory({ MEMORY_SHEET_ID: null });

    await memory.store('conversation', 'Exact keyword match', { id: 1 }); // Will have high score for "exact keyword match"
    await memory.store('conversation', 'Only one keyword', { id: 2 }); // Will have lower score

    // With a high minScore, we should only get the exact match
    const strictResults = await memory.retrieve('exact keyword match', { minScore: 0.8 });
    assert.equal(strictResults.length, 1);
    assert.equal(strictResults[0].context.id, 1);

    // With a low minScore, we might get both (assuming 'keyword' is long enough)
    const looseResults = await memory.retrieve('exact keyword match', { minScore: 0.1 });
    assert.ok(looseResults.length > 1, 'Should return more results with a lower minScore');
  });

  test('handles queries with no matches gracefully', async () => {
    const memory = new SemanticMemory({ MEMORY_SHEET_ID: null });

    await memory.store('conversation', 'Apples and bananas', { id: 1 });

    const results = await memory.retrieve('completely unrelated query', { minScore: 0.1 });

    assert.equal(results.length, 0, 'Should return an empty array when there are no matches');
  });

  test('handles short queries that are filtered out', async () => {
    const memory = new SemanticMemory({ MEMORY_SHEET_ID: null });

    await memory.store('conversation', 'Some content here', { id: 1 });

    // "a" and "is" are <= 3 chars and will be filtered by getSimpleEmbedding
    const results = await memory.retrieve('a is');

    assert.equal(results.length, 0, 'Should return an empty array for queries with only short words');
  });
});
