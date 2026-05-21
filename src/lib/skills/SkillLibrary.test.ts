import { describe, it, expect } from 'vitest';
import { getSkill, SKILL_LIBRARY } from './SkillLibrary';

describe('SkillLibrary', () => {
  describe('getSkill', () => {
    it('should return the correct skill when given a valid name', () => {
      // Find a skill that actually exists in the library for testing
      const existingSkill = SKILL_LIBRARY[0];
      if (existingSkill) {
        const skill = getSkill(existingSkill.name);
        expect(skill).toBeDefined();
        expect(skill?.name).toBe(existingSkill.name);
        expect(skill).toEqual(existingSkill);
      }
    });

    it('should return undefined when given a name that does not exist', () => {
      const skill = getSkill('Non-existent Skill 12345');
      expect(skill).toBeUndefined();
    });

    it('should return undefined when given an empty string', () => {
      const skill = getSkill('');
      expect(skill).toBeUndefined();
    });
  });
});
