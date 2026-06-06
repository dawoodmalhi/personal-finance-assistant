import { render, screen } from '@testing-library/react';
import Home from '../app/page';
import Dashboard from '../app/dashboard/page';

describe('Application Tests', () => {
  test('renders home page', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { name: /welcome to your personal finance assistant/i });
    expect(heading).toBeInTheDocument();
  });

  test('renders dashboard page', () => {
    render(<Dashboard />);
    const dashboardHeading = screen.getByRole('heading', { name: /dashboard/i });
    expect(dashboardHeading).toBeInTheDocument();
  });
});