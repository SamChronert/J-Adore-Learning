import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import QuestionCard from '../QuestionCard';

describe('QuestionCard', () => {
  const mockQuestion = {
    id: 1,
    question: 'What is the primary grape variety in Chablis?',
    answer: 'Chardonnay',
    category: 'Wine Regions',
    difficulty: 'intermediate',
    generated: false,
  };

  const defaultProps = {
    question: mockQuestion,
    userAnswer: '',
    setUserAnswer: vi.fn(),
    showAnswer: false,
    showHint: false,
    currentHint: '',
    feedback: '',
    attemptCount: 0,
    onSubmit: vi.fn(),
    onNext: vi.fn(),
    onGiveUp: vi.fn(),
    onKeyPress: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render question text', () => {
    render(<QuestionCard {...defaultProps} />);
    
    expect(screen.getByText(mockQuestion.question)).toBeInTheDocument();
  });

  it('should display category badge', () => {
    render(<QuestionCard {...defaultProps} />);
    
    expect(screen.getByText(mockQuestion.category)).toBeInTheDocument();
  });

  it('should show difficulty-based styling', () => {
    render(<QuestionCard {...defaultProps} />);
    
    const categoryBadge = screen.getByText(mockQuestion.category);
    expect(categoryBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('should show AI generated badge for AI questions', () => {
    const aiQuestion = { ...mockQuestion, generated: true };
    render(<QuestionCard {...defaultProps} question={aiQuestion} />);
    
    expect(screen.getByText('AI Generated')).toBeInTheDocument();
  });

  it('should not show AI badge for regular questions', () => {
    render(<QuestionCard {...defaultProps} />);
    
    expect(screen.queryByText('AI Generated')).not.toBeInTheDocument();
  });

  it('should update user answer on input', async () => {
    const user = userEvent.setup();
    const setUserAnswer = vi.fn();
    
    render(<QuestionCard {...defaultProps} setUserAnswer={setUserAnswer} />);
    
    const input = screen.getByPlaceholderText('Type your answer here...');
    await user.type(input, 'Chardonnay');
    
    expect(setUserAnswer).toHaveBeenCalledTimes(10); // Once for each character
    expect(setUserAnswer).toHaveBeenLastCalledWith('Chardonnay');
  });

  it('should call onSubmit when submit button is clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    render(<QuestionCard {...defaultProps} onSubmit={onSubmit} userAnswer="test" />);
    
    const submitButton = screen.getByText('Submit Answer');
    await user.click(submitButton);
    
    expect(onSubmit).toHaveBeenCalled();
  });

  it('should disable submit button when answer is empty', () => {
    render(<QuestionCard {...defaultProps} userAnswer="" />);
    
    const submitButton = screen.getByText('Submit Answer');
    expect(submitButton).toBeDisabled();
  });

  it('should show hint when showHint is true', () => {
    const hint = 'It starts with C';
    render(<QuestionCard {...defaultProps} showHint={true} currentHint={hint} />);
    
    expect(screen.getByText('Hint:')).toBeInTheDocument();
    expect(screen.getByText(hint)).toBeInTheDocument();
  });

  it('should show feedback message', () => {
    const feedback = 'Correct! Well done!';
    render(<QuestionCard {...defaultProps} feedback={feedback} />);
    
    expect(screen.getByText(feedback)).toBeInTheDocument();
  });

  it('should show attempts remaining', () => {
    render(<QuestionCard {...defaultProps} attemptCount={2} />);
    
    expect(screen.getByText('2 attempts left')).toBeInTheDocument();
  });

  it('should show answer when showAnswer is true', () => {
    render(<QuestionCard {...defaultProps} showAnswer={true} />);
    
    expect(screen.getByText('Answer:')).toBeInTheDocument();
    expect(screen.getByText(mockQuestion.answer)).toBeInTheDocument();
    expect(screen.getByText('Next Question')).toBeInTheDocument();
  });

  it('should call onNext when Next Question is clicked', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    
    render(<QuestionCard {...defaultProps} showAnswer={true} onNext={onNext} />);
    
    const nextButton = screen.getByText('Next Question');
    await user.click(nextButton);
    
    expect(onNext).toHaveBeenCalled();
  });

  it('should show give up button after attempts', () => {
    render(<QuestionCard {...defaultProps} attemptCount={3} />);
    
    expect(screen.getByText('Give Up')).toBeInTheDocument();
  });

  it('should call onGiveUp when give up is clicked', async () => {
    const user = userEvent.setup();
    const onGiveUp = vi.fn();
    
    render(<QuestionCard {...defaultProps} attemptCount={3} onGiveUp={onGiveUp} />);
    
    const giveUpButton = screen.getByText('Give Up');
    await user.click(giveUpButton);
    
    expect(onGiveUp).toHaveBeenCalled();
  });

  it('should handle Enter key press', () => {
    const onKeyPress = vi.fn();
    
    render(<QuestionCard {...defaultProps} onKeyPress={onKeyPress} />);
    
    const input = screen.getByPlaceholderText('Type your answer here...');
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    expect(onKeyPress).toHaveBeenCalled();
  });

  it('should apply correct feedback styling', () => {
    const { rerender } = render(<QuestionCard {...defaultProps} feedback="Correct!" />);
    
    let feedbackElement = screen.getByText('Correct!').parentElement;
    expect(feedbackElement).toHaveClass('bg-green-50', 'text-green-700');
    
    rerender(<QuestionCard {...defaultProps} feedback="Not quite right." />);
    feedbackElement = screen.getByText('Not quite right.').parentElement;
    expect(feedbackElement).toHaveClass('bg-yellow-50', 'text-yellow-700');
  });
});