import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CopyButton from './CopyButton';

describe('CopyButton Component', () => {
  const defaultProps = {
    onClick: jest.fn(),
    isCopied: false,
    title: 'Copy to clipboard'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders button with copy icon when not copied', () => {
      render(<CopyButton {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /copy feedback/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('title', 'Copy to clipboard');
    });

    test('renders button with checkmark icon when copied', () => {
      render(<CopyButton {...defaultProps} isCopied={true} title="Copied!" />);
      
      const button = screen.getByRole('button', { name: /copy feedback/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('title', 'Copied!');
      
      // Check if the checkmark icon is present (green color class)
      const icon = button.querySelector('svg');
      expect(icon).toHaveClass('text-green-500');
    });

    test('displays copy icon when isCopied is false', () => {
      render(<CopyButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      const copyIcon = button.querySelector('svg');
      expect(copyIcon).not.toHaveClass('text-green-500');
    });

    test('updates title attribute based on props', () => {
      const { rerender } = render(<CopyButton {...defaultProps} />);
      
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Copy to clipboard');
      
      rerender(<CopyButton {...defaultProps} isCopied={true} title="Copied!" />);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Copied!');
    });
  });

  describe('Interaction', () => {
    test('calls onClick when button is clicked', () => {
      const mockOnClick = jest.fn();
      render(<CopyButton {...defaultProps} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    test('calls onClick multiple times when clicked multiple times', () => {
      const mockOnClick = jest.fn();
      render(<CopyButton {...defaultProps} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    test('button is focusable', () => {
      render(<CopyButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    test('has proper aria-label', () => {
      render(<CopyButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Copy feedback');
    });
  });

  describe('Styling', () => {
    test('icon has correct size classes', () => {
      render(<CopyButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon).toHaveClass('h-6', 'w-6');
    });

    test('checkmark icon has green color when copied', () => {
      render(<CopyButton {...defaultProps} isCopied={true} />);
      
      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon).toHaveClass('text-green-500');
    });
  });
});