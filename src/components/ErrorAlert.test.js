import { render, screen } from '@testing-library/react';
import ErrorAlert from './ErrorAlert';

describe('ErrorAlert', () => {
  test('renders error message when message is provided', () => {
    const errorMessage = 'Something went wrong';
    render(<ErrorAlert message={errorMessage} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Error:')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('does not render when message is empty string', () => {
    const { container } = render(<ErrorAlert message="" />);
    expect(container.firstChild).toBeNull();
  });

  test('has proper accessibility attributes', () => {
    render(<ErrorAlert message="Accessibility test" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('role', 'alert');
  });
});