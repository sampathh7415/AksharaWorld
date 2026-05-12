/**
 * 🛠️ Akshara World Agent Skill Store
 * Inspired by 500-AI-Agents DNA
 */

export interface AgentSkill {
  name: string;
  industry: 'Finance' | 'Healthcare' | 'Retail' | 'Tech' | 'Marketing' | 'General';
  description: string;
  capabilities: string[];
  mcpServersRequired: string[];
  logic: (params: any) => Promise<any>;
}

export const SKILL_LIBRARY: AgentSkill[] = [
  {
    name: 'Innovation Scout',
    industry: 'Tech',
    description: 'Searches for trending AI niches with zero startup cost.',
    capabilities: ['Market Search', 'Report Generation', 'Opportunity Scoring'],
    mcpServersRequired: ['google-search'],
    logic: async (p) => { /* logic handled by Sam Brain */ }
  },
  {
    name: 'Content Strategist',
    industry: 'Marketing',
    description: 'Generates SEO-optimized content plans for blogs and social media.',
    capabilities: ['Keyword Analysis', 'Topic Clustering', 'Calendar Generation'],
    mcpServersRequired: ['google-sheets', 'google-search'],
    logic: async (p) => { /* logic handled by Sam Brain */ }
  }
];

export function getSkill(name: string): AgentSkill | undefined {
  return SKILL_LIBRARY.find(s => s.name === name);
}
