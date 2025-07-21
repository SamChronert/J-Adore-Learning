// Answer matching utility for wine questions
class AnswerMatcher {
  constructor() {
    // Answer variations database for intelligent matching
    this.answerVariations = {
      'chardonnay': ['chard', 'chardonay', 'chardonney'],
      'cabernet sauvignon': ['cab sauv', 'cabernet', 'cab', 'cabernet-sauvignon'],
      'pinot noir': ['pinot', 'pinot nero'],
      'sauvignon blanc': ['sauv blanc', 'sauvignon', 'blanc'],
      'merlot': ['merlo'],
      'syrah': ['shiraz'],
      'grenache': ['garnacha'],
      'tempranillo': ['tinta roriz', 'aragonez'],
      'sangiovese': ['brunello', 'sangiovese grosso'],
      'nebbiolo': ['spanna', 'chiavennasca'],
      'riesling': ['rhine riesling'],
      'gewurztraminer': ['gewurz', 'traminer'],
      'chenin blanc': ['steen'],
      'malbec': ['cot', 'auxerrois'],
      'zinfandel': ['primitivo', 'zin'],
      'champagne': ['champers'],
      'prosecco': ['proseco'],
      'burgundy': ['bourgogne'],
      'bordeaux': ['bdx'],
      'rhone': ['rhône'],
      'barolo': ['barollo'],
      'chianti': ['chianti classico'],
      'rioja': ['la rioja'],
      'port': ['porto', 'oporto'],
      'sherry': ['jerez', 'xeres'],
      'corvina': ['corvina veronese'],
      'alvarinho': ['albariño'],
      'syrah/shiraz': ['syrah', 'shiraz'],
      'kimmeridgian': ['kimmeridge', 'kimmeridgien']
    };
  }

  // Normalize answer for comparison
  normalizeAnswer(answer) {
    if (!answer || typeof answer !== 'string') {
      return '';
    }
    
    return answer.toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s\-àâäéèêëïîôùûüÿæœç]/g, '')
      .replace(/\s+/g, ' ');
  }

  // Check if the user's answer matches the correct answer
  checkAnswer(userAnswer, correctAnswer, alternativeAnswers = []) {
    const normalizedUser = this.normalizeAnswer(userAnswer);
    const normalizedCorrect = this.normalizeAnswer(correctAnswer);
    
    // Direct match
    if (normalizedUser === normalizedCorrect) {
      return true;
    }
    
    // Check alternative answers
    for (const alt of alternativeAnswers) {
      if (normalizedUser === this.normalizeAnswer(alt)) {
        return true;
      }
    }
    
    // Check known variations
    const variations = this.answerVariations[normalizedCorrect] || [];
    if (variations.includes(normalizedUser)) {
      return true;
    }
    
    // Check if answer contains the key part
    if (this.checkPartialMatch(normalizedUser, normalizedCorrect)) {
      return true;
    }
    
    // Check for common number/word substitutions
    if (this.checkNumberWordMatch(normalizedUser, normalizedCorrect)) {
      return true;
    }
    
    return false;
  }

  // Check for partial matches (e.g., "pinot" matches "pinot noir")
  checkPartialMatch(userAnswer, correctAnswer) {
    // Don't allow too short answers
    if (userAnswer.length < 3) {
      return false;
    }
    
    // For multi-word answers, check if user got the main part
    const correctWords = correctAnswer.split(' ');
    if (correctWords.length > 1) {
      // Check if user answer matches any significant word
      for (const word of correctWords) {
        if (word.length > 3 && userAnswer === word) {
          return true;
        }
      }
    }
    
    return false;
  }

  // Check for number/word substitutions (e.g., "5" vs "five")
  checkNumberWordMatch(userAnswer, correctAnswer) {
    const numberWords = {
      '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five',
      '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten'
    };
    
    // Replace numbers with words and vice versa
    let userWithWords = userAnswer;
    let userWithNumbers = userAnswer;
    
    Object.entries(numberWords).forEach(([num, word]) => {
      userWithWords = userWithWords.replace(new RegExp(`\\b${num}\\b`, 'g'), word);
      userWithNumbers = userWithNumbers.replace(new RegExp(`\\b${word}\\b`, 'g'), num);
    });
    
    return userWithWords === correctAnswer || userWithNumbers === correctAnswer;
  }

  // Get all accepted variations for an answer
  getAcceptedVariations(answer) {
    const normalized = this.normalizeAnswer(answer);
    const variations = this.answerVariations[normalized] || [];
    return [normalized, ...variations];
  }

  // Add custom variations for a specific answer
  addVariation(answer, variations) {
    const normalized = this.normalizeAnswer(answer);
    if (!this.answerVariations[normalized]) {
      this.answerVariations[normalized] = [];
    }
    
    const normalizedVariations = variations.map(v => this.normalizeAnswer(v));
    this.answerVariations[normalized] = [
      ...new Set([...this.answerVariations[normalized], ...normalizedVariations])
    ];
  }
}

module.exports = AnswerMatcher;