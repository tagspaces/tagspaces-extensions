import React, { useEffect, useRef, useState } from 'react';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, InputAdornment, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TextSelection } from '@milkdown/prose/state';
import { EditorView } from '@milkdown/prose/view';
import { EditorStatus, editorViewCtx, rootCtx } from '@milkdown/core';
import Paper from '@mui/material/Paper';
import type { PaperProps } from '@mui/material/Paper';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import Draggable from 'react-draggable';
import { HtmlSearcher } from './HtmlSearcher';
import { findAllRanges, applyHighlights, clearHighlights } from './searchHighlight';
import { useMilkdownInstance } from '../hooks/useMilkdownInstance';
import { getParameterByName } from '../utils';

interface Props {
  open: boolean;
  onClose: () => void;
  searchTxt?: string;
}

function DraggablePaper(props: PaperProps) {
  return (
    <Draggable handle="#search-dialog-handle" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

function SearchDialog(props: Props) {
  const { editor, loading } = useMilkdownInstance();
  const theme = useTheme();
  const { t } = useTranslation();
  //const { textEditorMode } = useTextEditorContext();
  const isEditMode = getParameterByName('edit');

  const { open, onClose, searchTxt } = props;
  const [searchText, setSearch] = useState(searchTxt || '');
  const [replaceMode, setReplaceMode] = useState(false);
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const searcher = useRef<HtmlSearcher | undefined>(getHtmlSearcher());
  const editModeRanges = useRef<Range[]>([]);
  const editModeIndex = useRef<number>(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTxt && searchTxt.length > 0) {
      search(searchTxt);
    }
  }, [searchTxt]);

  useEffect(() => {
    if (!open) {
      searcher.current?.clear();
      searcher.current = undefined;
      editModeRanges.current = [];
      editModeIndex.current = -1;
      clearHighlights();
    } else {
      const t = setTimeout(() => searchInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  function getHtmlSearcher() {
    if (editor && !loading && editor.status === EditorStatus.Created) {
      const { ctx } = editor;
      if (ctx) {
        const container: HTMLElement = ctx.get(rootCtx) as HTMLElement;
        return new HtmlSearcher(container);
      }
    }
    return undefined;
  }

  function search(searchText: string) {
    if (editor && !loading && editor.status === EditorStatus.Created) {
      const { ctx } = editor;
      if (ctx) {
        try {
          if (!!isEditMode) {
            //textEditorMode === 'active') {
            const view = ctx.get(editorViewCtx);
            const needle = caseSensitive ? searchText : searchText.toLowerCase();
            // Rebuild all-match highlights when the query changed
            const freshRanges = findAllRanges(view.dom as HTMLElement, searchText, caseSensitive);
            if (freshRanges.length !== editModeRanges.current.length) {
              editModeRanges.current = freshRanges;
              editModeIndex.current = -1;
            }
            editModeIndex.current = (editModeIndex.current + 1) % (freshRanges.length || 1);
            const currentRange = freshRanges[editModeIndex.current];
            applyHighlights(freshRanges, currentRange);
            searchAndSelect(view, needle);
          } else {
            if (!searcher.current) {
              searcher.current = getHtmlSearcher();
            }
            if (searcher.current) {
              searcher.current.searchAndSelect(searchText, caseSensitive);
            }
            /*const container = ctx.get(rootCtx);
            searchAndSelectHtml(
              container,
              caseSensitive ? searchText : searchText.toLowerCase()
            );*/
          }
        } catch (e) {
          console.debug('searchAndSelect', e);
        }
      }
    }
  }

  /*function searchAndSelectHtml(container, searchText) {
    if (!container) {
      console.error(`Container not found.`);
      return;
    }

    // Create a new Range object for the selection.
    const selection = window.getSelection();
    selection.removeAllRanges(); // Clear any existing selection.

    // Get the current selection range or start from the beginning if no selection exists.
    let currentNode = selection.anchorNode || container;
    let currentOffset = selection.anchorOffset || 0;
    // Function to search for the text starting from the current node.
    function searchInNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = caseSensitive
          ? node.nodeValue
          : node.nodeValue.toLowerCase();
        const startIndex = node === currentNode ? currentOffset : 0;
        const index = text.indexOf(searchText, startIndex);
        if (index !== -1) {
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + searchText.length);
          selection.addRange(range); // Apply the range to the selection.
          return true; // Indicate that the search was successful.
        }
      } else {
        // Recursively search in child nodes.
        for (let i = 0; i < node.childNodes.length; i++) {
          if (searchInNode(node.childNodes[i])) {
            return true;
          }
        }
      }
      return false; // Text not found in this node or its children.
    }

    // Start searching from the container's root node.
    if (!searchInNode(currentNode)) {
      console.log(`Text "${searchText}" not found in container.`);
    }
  }*/

  function searchAndSelect(view: EditorView, searchText: string) {
    const { state } = view;
    const { selection } = state;
    let { from, to } = selection;

    // Search from the current selection to the end
    if (searchFromSelection(view, searchText, from, to)) {
      return;
    }

    // If not found, search from the start of the document
    if (searchFromStart(view, searchText)) {
      return;
    }
  }

  function searchFromSelection(
    view: EditorView,
    searchText: string,
    from: number,
    to: number
  ): boolean {
    const { state, dispatch } = view;
    const { doc } = state;
    let tr = state.tr;
    let found = false;

    doc.descendants((node, pos) => {
      if (found || !node.isText) return;

      if (pos >= from) {
        const text = caseSensitive ? node.text! : node.text!.toLowerCase();
        const index = text.indexOf(searchText, pos === from ? to - pos : 0);

        if (index !== -1) {
          const start = pos + index;
          const end = start + searchText.length;

          // Select the found text
          tr = tr.setSelection(TextSelection.create(doc, start, end));
          tr = tr.scrollIntoView();
          view.dom.focus();

          found = true;
        }
      }
    });

    if (found) {
      dispatch(tr);
    }

    return found;
  }

  function searchFromStart(view: EditorView, searchText: string) {
    const { state, dispatch } = view;
    const { doc } = state;
    let tr = state.tr;
    let found = false;

    doc.descendants((node, pos) => {
      if (found || !node.isText) return;

      const text = caseSensitive ? node.text! : node.text!.toLowerCase();
      const index = text.indexOf(searchText);

      if (index !== -1) {
        const start = pos + index;
        const end = start + searchText.length;

        // Select the found text
        tr = tr.setSelection(TextSelection.create(doc, start, end));
        tr = tr.scrollIntoView();
        view.dom.focus();

        found = true;
      }
    });

    if (found) {
      dispatch(tr);
    }

    return found;
  }

  function searchAndReplace(
    view: EditorView,
    searchText: string,
    replaceText: string
  ) {
    const { state, dispatch } = view;
    let { tr } = state;

    // Track total offset caused by replacements
    let accumulatedOffset = 0;

    state.doc.descendants((node, pos) => {
      if (node.isText) {
        const text = caseSensitive ? node.text! : node.text!.toLowerCase();
        let startIndex = 0;

        while ((startIndex = text.indexOf(searchText, startIndex)) !== -1) {
          const from = pos + startIndex + accumulatedOffset;
          const to = from + searchText.length;

          tr = tr.replaceWith(from, to, state.schema.text(replaceText));
          // Update offset for subsequent replacements
          accumulatedOffset += replaceText.length - searchText.length;
          startIndex += searchText.length;
        }
      }
    });

    if (tr.docChanged) {
      dispatch(tr);
    }

    // Restore the selection
    const selection = TextSelection.create(tr.doc, tr.selection.from);
    tr = tr.setSelection(selection);
    view.dom.focus();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperComponent={DraggablePaper}
      keepMounted
      scroll="paper"
      hideBackdrop
      disableAutoFocus
      disableEnforceFocus
    >
      <Box
        id="search-dialog-handle"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
          py: 0.25,
          cursor: 'move',
          borderBottom: 1,
          borderColor: 'divider',
          userSelect: 'none',
        }}
      >
        <DragHandleIcon sx={{ opacity: 0.4, fontSize: 18 }} />
        <IconButton
          aria-label="close"
          tabIndex={-1}
          onClick={onClose}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <DialogContent
        sx={{
          overflowY: 'auto',
          overflowX: 'hidden',
          pt: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '95%',
            maxWidth: '400px',
            minWidth: '200px',
          }}
        >
          {!!isEditMode && (
            <IconButton
              sx={{ p: '10px' }}
              aria-label="menu"
              size="small"
              onClick={() => setReplaceMode(!replaceMode)}
            >
              {replaceMode ? (
                <ExpandMoreIcon />
              ) : (
                <Tooltip title={t('searchAndReplace')}>
                  <KeyboardArrowRightIcon />
                </Tooltip>
              )}
            </IconButton>
          )}
          <TextField
            sx={{ ml: 1, flex: 1 }}
            margin="dense"
            size="small"
            fullWidth={true}
            inputRef={searchInputRef}
            value={searchText}
            label={t('search')}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(event.target.value);
            }}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                search(searchText);
              }
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Tooltip title={t('matchCase')}>
                      <IconButton
                        aria-label="case sensitive"
                        onClick={() => setCaseSensitive(!caseSensitive)}
                        size="small"
                      >
                        <FormatSizeIcon
                          style={{
                            color: caseSensitive
                              ? theme.palette.primary.main
                              : theme.palette.text.primary,
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      aria-label="start searching"
                      variant="text"
                      size="small"
                      onClick={() => {
                        search(searchText);
                      }}
                    >
                      {/* <SearchIcon /> */}
                      {t('search')}
                    </Button>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        {replaceMode && (
          <TextField
            sx={{ flex: 1 }}
            margin="dense"
            size="small"
            fullWidth={true}
            value={replaceText}
            label="Replace"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setReplaceText(event.target.value);
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      data-tid="replaceAllTID"
                      size="small"
                      onClick={() => {
                        if (
                          editor &&
                          !loading &&
                          editor.status === EditorStatus.Created
                        ) {
                          const { ctx } = editor;
                          if (ctx) {
                            try {
                              const view = ctx.get(editorViewCtx);
                              searchAndReplace(
                                view,
                                caseSensitive
                                  ? searchText
                                  : searchText.toLowerCase(),
                                replaceText
                              );
                            } catch (e) {
                              console.debug('searchAndSelect', e);
                            }
                          }
                        }
                      }}
                    >
                      {t('replaceAll')}
                    </Button>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SearchDialog;
