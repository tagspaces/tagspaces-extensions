import { useContext } from 'react';

import { SearchDialogContext } from './SearchDialogContextProvider';

export const useSearchDialogContext = () => useContext(SearchDialogContext);
