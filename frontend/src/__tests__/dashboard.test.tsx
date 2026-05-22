import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/ui/StatCard';
import { DollarSign } from 'lucide-react';

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Total sales" value="$1,234.00" icon={DollarSign} />);
    expect(screen.getByText('Total sales')).toBeInTheDocument();
    expect(screen.getByText('$1,234.00')).toBeInTheDocument();
  });
});
