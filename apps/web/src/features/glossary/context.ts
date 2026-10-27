import { createContext, useContext } from 'react';

/** Term ids that should not be underlined in this part of the page (e.g. the topic of the page itself). */
export const GlossarySkipContext = createContext<ReadonlySet<string>>(new Set());

export const useGlossarySkip = () => useContext(GlossarySkipContext);
