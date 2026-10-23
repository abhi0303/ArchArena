import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router';

function readFilters<K extends string>(search: string, defaults: Record<K, string>): Record<K, string> {
  const params = new URLSearchParams(search);
  const out = { ...defaults };
  for (const key of Object.keys(defaults) as K[]) out[key] = params.get(key) ?? defaults[key];
  return out;
}

/**
 * Page filters (search box, category chips…) mirrored in the URL query, so links, refreshes and
 * the back button keep them.
 *
 * Local state is the source of truth while the user interacts. React Router builds each new URL
 * from the last *rendered* location, so two quick changes in a row (clear the search, then pick a
 * filter) could otherwise undo each other. Our own updates use “replace”; any other navigation
 * (a link, back/forward) is adopted into the local state.
 *
 * `defaults` must be a stable object (define it at module level). A value equal to its default is
 * left out of the URL.
 */
export function useUrlFilters<K extends string>(defaults: Record<K, string>): [Record<K, string>, (patch: Partial<Record<K, string>>) => void] {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [values, setValues] = useState(() => readFilters(location.search, defaults));
  const latest = useRef(values);

  useEffect(() => {
    if (navigationType === 'REPLACE') return;
    const next = readFilters(location.search, defaults);
    latest.current = next;
    setValues(next);
  }, [location.key, location.search, navigationType, defaults]);

  const update = useCallback(
    (patch: Partial<Record<K, string>>) => {
      const next = { ...latest.current, ...patch };
      latest.current = next;
      setValues(next);
      const params = new URLSearchParams();
      for (const key of Object.keys(defaults) as K[]) if (next[key] && next[key] !== defaults[key]) params.set(key, next[key]);
      navigate(`?${params}`, { replace: true });
    },
    [defaults, navigate],
  );

  return [values, update];
}
