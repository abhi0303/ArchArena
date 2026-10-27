import { act, render, screen } from '@testing-library/react';
import { createMemoryRouter, Link, RouterProvider, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useUrlFilters } from '@/lib/useUrlFilters';

const FILTERS = { q: '', category: 'all' };
let setFilters: (patch: Partial<typeof FILTERS>) => void = () => {};

function Page() {
  const [filters, set] = useUrlFilters(FILTERS);
  const location = useLocation();
  setFilters = set;
  return (
    <div>
      <p data-testid="values">{`${filters.q}|${filters.category}`}</p>
      <p data-testid="url">{location.search}</p>
      <Link to="/list?category=db">db link</Link>
    </div>
  );
}

const setup = (url: string) => {
  const router = createMemoryRouter([{ path: '/list', element: <Page /> }], { initialEntries: [url] });
  render(<RouterProvider router={router} />);
  return router;
};

describe('useUrlFilters', () => {
  it('reads filters from the URL and falls back to defaults', () => {
    setup('/list?q=cache');
    expect(screen.getByTestId('values').textContent).toBe('cache|all');
  });

  it('keeps both of two quick changes (the stale-URL bug)', async () => {
    setup('/list?q=circuit');
    await act(async () => {
      setFilters({ q: '' });
      setFilters({ category: 'db' });
    });
    expect(screen.getByTestId('values').textContent).toBe('|db');
    expect(screen.getByTestId('url').textContent).toBe('?category=db');
  });

  it('leaves defaults out of the URL', async () => {
    setup('/list?category=db');
    await act(async () => setFilters({ category: 'all', q: 'x' }));
    expect(screen.getByTestId('url').textContent).toBe('?q=x');
  });

  it('adopts filters from links and the back button', async () => {
    const router = setup('/list?q=old');
    await act(async () => screen.getByText('db link').click());
    expect(screen.getByTestId('values').textContent).toBe('|db');
    await act(async () => router.navigate(-1));
    expect(screen.getByTestId('values').textContent).toBe('old|all');
  });
});
