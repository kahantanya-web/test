import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import FeedbackDisplay from './FeedbackDisplay';

// Mock the child components
jest.mock('./FeedbackSection', () => {
  return function MockFeedbackSection({ title, answers, sectionKey }) {
    return (
      <div data-testid={`feedback-section-${sectionKey}`}>
        <h3>{title}</h3>
        <div>{answers?.length || 0} answers</div>
      </div>
    );
  };
});

jest.mock('./CopyButton', () => {
  return function MockCopyButton({ onClick, isCopied, title }) {
    return (
      <button 
        data-testid="copy-button" 
        onClick={onClick}
        title={title}
        aria-label={isCopied ? 'Copied!' : 'Copy to clipboard'}
      >
        {isCopied ? 'Copied' : 'Copy'}
      </button>
    );
  };
});

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

describe('FeedbackDisplay', () => {
  const mockFeedback = {
    userName: 'John Doe',
    specialistTitle: 'Specialist Feedback',
    specialistAnswers: [
      { question: 'How was the onboarding?', answer: 'Very good' },
      { question: 'Any suggestions?', answer: 'More documentation' }
    ],
    newcomerTitle: 'Newcomer Feedback',
    newcomerAnswers: [
      { question: 'How do you feel?', answer: 'Confident' },
      { question: 'What was challenging?', answer: 'Learning the tools' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('does not render when feedback is null', () => {
    const { container } = render(<FeedbackDisplay feedback={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('does not render when feedback is undefined', () => {
    const { container } = render(<FeedbackDisplay feedback={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders main title with user name when feedback is provided', () => {
    render(<FeedbackDisplay feedback={mockFeedback} />);
    
    expect(screen.getByText('Onboarding Feedback for')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('renders copy button with correct initial state', () => {
    render(<FeedbackDisplay feedback={mockFeedback} />);
    
    const copyButton = screen.getByTestId('copy-button');
    expect(copyButton).toBeInTheDocument();
    expect(copyButton).toHaveTextContent('Copy');
    expect(copyButton).toHaveAttribute('title', 'Copy to clipboard');
  });

  test('renders both feedback sections', () => {
    render(<FeedbackDisplay feedback={mockFeedback} />);
    
    expect(screen.getByTestId('feedback-section-specialist')).toBeInTheDocument();
    expect(screen.getByTestId('feedback-section-newcomer')).toBeInTheDocument();
  });

  test('copies feedback to clipboard when copy button is clicked', async () => {
    render(<FeedbackDisplay feedback={mockFeedback} />);
    
    const copyButton = screen.getByTestId('copy-button');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });

    const expectedText = `Onboarding Feedback for John Doe

Specialist Feedback
Q: How was the onboarding?
A: Very good

Q: Any suggestions?
A: More documentation


Newcomer Feedback
Q: How do you feel?
A: Confident

Q: What was challenging?
A: Learning the tools`;

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedText);
  });

  test('shows copied state and resets after timeout', async () => {
    render(<FeedbackDisplay feedback={mockFeedback} />);
    
    const copyButton = screen.getByTestId('copy-button');
    fireEvent.click(copyButton);

    // Check copied state
    await waitFor(() => {
      expect(copyButton).toHaveTextContent('Copied');
      expect(copyButton).toHaveAttribute('title', 'Copied!');
    });

    // Fast forward 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(copyButton).toHaveTextContent('Copy');
      expect(copyButton).toHaveAttribute('title', 'Copy to clipboard');
    });
  });

  test('handles copy failure gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Copy failed'));

    render(<FeedbackDisplay feedback={mockFeedback} />);
    
    const copyButton = screen.getByTestId('copy-button');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy text: ', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles feedback with missing answers gracefully', () => {
    const feedbackWithEmptyAnswers = {
      userName: 'Jane Doe',
      specialistTitle: 'Specialist Feedback',
      specialistAnswers: [
        { question: 'How was it?', answer: '' }
      ],
      newcomerTitle: 'Newcomer Feedback', 
      newcomerAnswers: [
        { question: 'Any thoughts?', answer: null }
      ]
    };

    render(<FeedbackDisplay feedback={feedbackWithEmptyAnswers} />);
    
    const copyButton = screen.getByTestId('copy-button');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('A: No answer provided')
    );
  });
});