/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import React, { createContext, useMemo, useReducer, useRef } from 'react';

type SearchDialogContextData = {
  openSearchDialog: (txt?: string | undefined) => void;
  closeSearchDialog: () => void;
};

export const SearchDialogContext = createContext<SearchDialogContextData>({
  openSearchDialog: () => {},
  closeSearchDialog: () => {},
});

export type SearchDialogContextProviderProps = {
  children: React.ReactNode;
};

const SearchDialog = React.lazy(() => import('./SearchDialog'));

export const SearchDialogContextProvider = ({
  children,
}: SearchDialogContextProviderProps) => {
  const open = useRef<boolean>(false);
  const searchTxt = useRef<string | undefined>(undefined);

  // eslint-disable-next-line no-unused-vars
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function openDialog(txt: string | undefined) {
    open.current = true;
    searchTxt.current = txt;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }
  function LoadingLazy() {
    return (
      <div
        style={{
          width: 0,
          height: 0,
          backgroundColor: 'transparent',
          padding: 0,
        }}
      >
        ...
      </div>
    );
  }

  function SearchDialogAsync(props: any) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <SearchDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openSearchDialog: openDialog,
      closeSearchDialog: closeDialog,
    };
  }, []);

  return (
    <SearchDialogContext.Provider value={context}>
      <SearchDialogAsync
        open={open.current}
        onClose={closeDialog}
        searchTxt={searchTxt.current}
      />
      {children}
    </SearchDialogContext.Provider>
  );
};
