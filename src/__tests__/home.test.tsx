import { render } from '@testing-library/react';
import Home from '../pages/index';

it('renders welcome message', () => {
  const { getByText } = render(<Home />);
  expect(getByText(/welcome to/i)).toBeInTheDocument();
});