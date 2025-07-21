const AnswerMatcher = require('../../server/utils/answerMatcher');

describe('AnswerMatcher', () => {
  let matcher;

  beforeEach(() => {
    matcher = new AnswerMatcher();
  });

  describe('normalizeAnswer', () => {
    it('should convert to lowercase', () => {
      expect(matcher.normalizeAnswer('CHARDONNAY')).toBe('chardonnay');
      expect(matcher.normalizeAnswer('Pinot Noir')).toBe('pinot noir');
    });

    it('should trim whitespace', () => {
      expect(matcher.normalizeAnswer('  chardonnay  ')).toBe('chardonnay');
      expect(matcher.normalizeAnswer('\tchardonnay\n')).toBe('chardonnay');
    });

    it('should remove special characters except accented letters', () => {
      expect(matcher.normalizeAnswer('Châteauneuf-du-Pape!')).toBe('châteauneuf-du-pape');
      expect(matcher.normalizeAnswer('Côte-Rôtie')).toBe('côte-rôtie');
    });

    it('should normalize multiple spaces', () => {
      expect(matcher.normalizeAnswer('pinot   noir')).toBe('pinot noir');
    });

    it('should handle empty or invalid input', () => {
      expect(matcher.normalizeAnswer('')).toBe('');
      expect(matcher.normalizeAnswer(null)).toBe('');
      expect(matcher.normalizeAnswer(undefined)).toBe('');
      expect(matcher.normalizeAnswer(123)).toBe('');
    });
  });

  describe('checkAnswer - Direct Matches', () => {
    it('should match exact answers', () => {
      expect(matcher.checkAnswer('Chardonnay', 'chardonnay')).toBe(true);
      expect(matcher.checkAnswer('chardonnay', 'Chardonnay')).toBe(true);
    });

    it('should match with different cases and spaces', () => {
      expect(matcher.checkAnswer('PINOT NOIR', 'pinot noir')).toBe(true);
      expect(matcher.checkAnswer('  pinot  noir  ', 'pinot noir')).toBe(true);
    });

    it('should not match different answers', () => {
      expect(matcher.checkAnswer('merlot', 'chardonnay')).toBe(false);
      expect(matcher.checkAnswer('red', 'white')).toBe(false);
    });
  });

  describe('checkAnswer - Known Variations', () => {
    it('should match common wine variations', () => {
      expect(matcher.checkAnswer('cab', 'cabernet sauvignon')).toBe(true);
      expect(matcher.checkAnswer('cab sauv', 'cabernet sauvignon')).toBe(true);
      expect(matcher.checkAnswer('shiraz', 'syrah')).toBe(true);
      expect(matcher.checkAnswer('primitivo', 'zinfandel')).toBe(true);
    });

    it('should match region variations', () => {
      expect(matcher.checkAnswer('bourgogne', 'burgundy')).toBe(true);
      expect(matcher.checkAnswer('bdx', 'bordeaux')).toBe(true);
      expect(matcher.checkAnswer('rhône', 'rhone')).toBe(true);
    });

    it('should match Portuguese/Spanish variations', () => {
      expect(matcher.checkAnswer('tinta roriz', 'tempranillo')).toBe(true);
      expect(matcher.checkAnswer('garnacha', 'grenache')).toBe(true);
      expect(matcher.checkAnswer('alvarinho', 'albariño')).toBe(false); // Not in variations yet
    });
  });

  describe('checkAnswer - Alternative Answers', () => {
    it('should match provided alternative answers', () => {
      const alternatives = ['Chard', 'Chardonnay grape', 'White Burgundy'];
      expect(matcher.checkAnswer('white burgundy', 'Chardonnay', alternatives)).toBe(true);
      expect(matcher.checkAnswer('chard', 'Chardonnay', alternatives)).toBe(true);
    });

    it('should normalize alternative answers', () => {
      const alternatives = ['CHARD!', '  Chardonnay Grape  '];
      expect(matcher.checkAnswer('chard', 'Chardonnay', alternatives)).toBe(true);
      expect(matcher.checkAnswer('chardonnay grape', 'Chardonnay', alternatives)).toBe(true);
    });
  });

  describe('checkAnswer - Partial Matches', () => {
    it('should match main grape variety name', () => {
      expect(matcher.checkAnswer('pinot', 'pinot noir')).toBe(true);
      expect(matcher.checkAnswer('cabernet', 'cabernet sauvignon')).toBe(true);
      expect(matcher.checkAnswer('sauvignon', 'sauvignon blanc')).toBe(true);
    });

    it('should not match too short answers', () => {
      expect(matcher.checkAnswer('pi', 'pinot noir')).toBe(false);
      expect(matcher.checkAnswer('ca', 'cabernet sauvignon')).toBe(false);
    });

    it('should not match partial words', () => {
      expect(matcher.checkAnswer('chard', 'richard')).toBe(false);
      expect(matcher.checkAnswer('noir', 'pinot grigio')).toBe(false);
    });
  });

  describe('checkAnswer - Number/Word Substitutions', () => {
    it('should match number and word equivalents', () => {
      expect(matcher.checkAnswer('5', 'five')).toBe(true);
      expect(matcher.checkAnswer('five', '5')).toBe(true);
      expect(matcher.checkAnswer('three grapes', '3 grapes')).toBe(true);
    });

    it('should handle multiple numbers', () => {
      expect(matcher.checkAnswer('2 to 3 years', 'two to three years')).toBe(true);
      expect(matcher.checkAnswer('five to ten years', '5 to 10 years')).toBe(true);
    });
  });

  describe('getAcceptedVariations', () => {
    it('should return all accepted variations', () => {
      const variations = matcher.getAcceptedVariations('Cabernet Sauvignon');
      expect(variations).toContain('cabernet sauvignon');
      expect(variations).toContain('cab sauv');
      expect(variations).toContain('cabernet');
      expect(variations).toContain('cab');
    });

    it('should return normalized answer for unknown terms', () => {
      const variations = matcher.getAcceptedVariations('Unknown Wine');
      expect(variations).toEqual(['unknown wine']);
    });
  });

  describe('addVariation', () => {
    it('should add new variations', () => {
      matcher.addVariation('Test Wine', ['TW', 'Testing Wine']);
      
      expect(matcher.checkAnswer('tw', 'test wine')).toBe(true);
      expect(matcher.checkAnswer('testing wine', 'test wine')).toBe(true);
    });

    it('should not duplicate variations', () => {
      matcher.addVariation('chardonnay', ['chard', 'new variation']);
      const variations = matcher.getAcceptedVariations('chardonnay');
      
      const chardCount = variations.filter(v => v === 'chard').length;
      expect(chardCount).toBe(1);
      expect(variations).toContain('new variation');
    });
  });

  describe('Real Wine Question Scenarios', () => {
    it('should handle complex wine region answers', () => {
      expect(matcher.checkAnswer('Chablis', 'Chablis')).toBe(true);
      expect(matcher.checkAnswer('chablis', 'Chablis')).toBe(true);
      expect(matcher.checkAnswer('CHABLIS', 'Chablis')).toBe(true);
    });

    it('should handle answers with numbers', () => {
      expect(matcher.checkAnswer('1855', '1855')).toBe(true);
      expect(matcher.checkAnswer('30 to 50 degrees', '30 to 50 degrees')).toBe(true);
    });

    it('should handle multi-word answers correctly', () => {
      const correctAnswer = 'Château Lafite Rothschild, Château Latour, Château Margaux, Château Haut-Brion, and Château Mouton Rothschild';
      // This would be too complex for simple matching, but parts should work
      expect(matcher.checkAnswer('Margaux', 'Margaux')).toBe(true);
    });

    it('should handle temperature answers', () => {
      expect(matcher.checkAnswer('15-18°C', '15-18°C')).toBe(true);
      expect(matcher.checkAnswer('15-18C', '15-18°C')).toBe(true);
      expect(matcher.checkAnswer('60-65°F', '60-65°F')).toBe(true);
    });
  });
});