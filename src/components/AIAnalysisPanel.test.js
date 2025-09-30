import { render, screen, fireEvent } from '@testing-library/react';
import AIAnalysisPanel from './AIAnalysisPanel';

// Mock the child components
jest.mock('./StructuredAnalysisDisplay', () => {
  return function MockStructuredAnalysisDisplay({ analysis }) {
    return <div data-testid="structured-analysis">{JSON.stringify(analysis)}</div>;
  };
});

jest.mock('./FormattedAnalysisDisplay', () => {
  return function MockFormattedAnalysisDisplay({ analysis }) {
    return <div data-testid="formatted-analysis">{analysis}</div>;
  };
});

jest.mock('./Icons', () => ({
  AnalyticsIcon: ({ className }) => (
    <svg data-testid="analytics-icon" className={className}>
      <path />
    </svg>
  )
}));

describe('AIAnalysisPanel', () => {
  const mockFeedbackData = { userName: 'John', answers: [] };
  const mockOnAnalyze = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not render when feedbackData is null', () => {
    const { container } = render(
      <AIAnalysisPanel
        feedbackData={null}
        isAnalyzing={false}
        onAnalyze={mockOnAnalyze}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders panel with title and analyze button when feedbackData exists', () => {
    render(
      <AIAnalysisPanel
        feedbackData={mockFeedbackData}
        isAnalyzing={false}
        onAnalyze={mockOnAnalyze}
      />
    );

    expect(screen.getByText('AI Feedback Analysis')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze Feedback with AI' })).toBeInTheDocument();
  });

  test('shows analyzing state when isAnalyzing is true', () => {
    render(
      <AIAnalysisPanel
        feedbackData={mockFeedbackData}
        isAnalyzing={true}
        onAnalyze={mockOnAnalyze}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Analyzing...');
  });

  test('calls onAnalyze when button is clicked', () => {
    render(
      <AIAnalysisPanel
        feedbackData={mockFeedbackData}
        isAnalyzing={false}
        onAnalyze={mockOnAnalyze}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnAnalyze).toHaveBeenCalledTimes(1);
  });

  test('displays error message when analysisError is provided', () => {
    const errorMessage = 'Analysis failed';
    render(
      <AIAnalysisPanel
        feedbackData={mockFeedbackData}
        isAnalyzing={false}
        analysisError={errorMessage}
        onAnalyze={mockOnAnalyze}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('text-red-500');
  });

  test('displays structured analysis when structuredAnalysis is provided', () => {
    const mockStructuredAnalysis = {
      overallSentiment: 'Positive',
      keyStrengths: 'Good communication',
      areasForImprovement: 'Time management',
      actionItems: 'Schedule regular check-ins'
    };

    render(
      <AIAnalysisPanel
        feedbackData={mockFeedbackData}
        isAnalyzing={false}
        structuredAnalysis={mockStructuredAnalysis}
        onAnalyze={mockOnAnalyze}
      />
    );

    expect(screen.getByText('AI Analysis Results')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-icon')).toBeInTheDocument();
    expect(screen.getByTestId('structured-analysis')).toBeInTheDocument();
  });
});