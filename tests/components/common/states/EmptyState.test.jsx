import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EmptyState from 'Se_Frontend/src/components/common/states/EmptyState.jsx';
import { BookX } from 'lucide-react';

describe('EmptyState', () => {
  it('renders the EmptyState component with default icon', () => {
    const title = 'No Data Available';
    const message = 'There is no data to display at the moment.';

    render(<EmptyState title={title} message={message} />);

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders the EmptyState component with a custom icon', () => {
    const title = 'No Books Found';
    const message = 'Please add some books to your collection.';
    const CustomIcon = BookX;

    render(<EmptyState title={title} message={message} icon={CustomIcon} />);

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });
});