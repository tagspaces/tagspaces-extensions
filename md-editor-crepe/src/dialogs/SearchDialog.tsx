import React, { useEffect, useRef, useState } from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
//import i18n from '-/services/i18n';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Button, InputAdornment } from '@mui/material';
import { TextSelection } from '@milkdown/prose/state';
import { EditorView } from '@milkdown/prose/view';
import { EditorStatus, editorViewCtx, rootCtx } from '@milkdown/core';
import Paper from '@mui/material/Paper';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import { HtmlSearcher } from './HtmlSearcher';
import { useMilkdownInstance } from '../hooks/useMilkdownInstance';
import { getParameterByName } from '../utils';

interface Props {
  open: boolean;
  onClose: () => void;
  searchTxt?: string;
}

function SearchDialog(props: Props) {
  const { editor, loading } = useMilkdownInstance();
  //const { textEditorMode } = useTextEditorContext();
  const isEditMode = getParameterByName('edit');

  const { open, onClose, searchTxt } = props;
  const [searchText, setSearch] = useState(searchTxt || '');
  const [replaceMode, setReplaceMode] = useState(false);
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const searcher = useRef<HtmlSearcher | undefined>(getHtmlSearcher());

  useEffect(() => {
    if (searchTxt && searchTxt.length > 0) {
      search(searchTxt);
    }
  }, [searchTxt]);

  useEffect(() => {
    if (!open) {
      searcher.current = undefined;
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
            searchAndSelect(
              view,
              caseSensitive ? searchText : searchText.toLowerCase(),
            );
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

    // If not found, searchText from the start of the document
    if (searchFromStart(view, searchText)) {
      return;
    }

    // alert('Text not found.');
  }

  function searchFromSelection(
    view: EditorView,
    searchText: string,
    from: number,
    to: number,
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
    replaceText: string,
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

  /*function DraggablePaper(props: PaperProps) {
        return (
            <Draggable
                handle="#draggable-dialog-title"
                cancel={'[class*="MuiDialogContent-root"]'}
            >
                <Paper {...props} />
            </Draggable>
        );
    }*/
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperComponent={Paper}
      /*BackdropProps={{ style: { backgroundColor: 'transparent' } }}*/
      keepMounted
      scroll="paper"
      aria-labelledby="draggable-dialog-title"
      hideBackdrop
      disableAutoFocus
      disableEnforceFocus
      //disableRestoreFocus
    >
      <DialogTitle id="draggable-dialog-title">
        {replaceMode ? 'Search and replace' : 'Search'}
        <IconButton
          title={'close'}
          aria-label="close"
          tabIndex={-1}
          style={{
            position: 'absolute',
            right: 5,
            top: 5,
          }}
          onClick={onClose}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        style={{
          // @ts-ignore
          overflowY: 'overlay',
          overflowX: 'hidden',
        }}
      >
        <Paper
          component="form"
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: 400,
          }}
        >
          {!!isEditMode && (
            <IconButton
              sx={{ p: '10px' }}
              aria-label="menu"
              onClick={() => setReplaceMode(!replaceMode)}
            >
              <MenuIcon />
            </IconButton>
          )}
          <TextField
            sx={{ ml: 1, flex: 1 }}
            margin="dense"
            fullWidth={true}
            value={searchText}
            label="Search"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(event.target.value);
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="start searching"
                    onClick={() => {
                      search(searchText);
                    }}
                    size="large"
                  >
                    <SearchIcon />
                  </IconButton>
                  <IconButton
                    aria-label="case sensitive"
                    onClick={() => setCaseSensitive(!caseSensitive)}
                    size="large"
                  >
                    <FormatSizeIcon
                      style={{ color: caseSensitive ? 'blue' : 'gray' }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Paper>
        {replaceMode && (
          <TextField
            sx={{ flex: 1 }}
            margin="dense"
            fullWidth={true}
            value={replaceText}
            label="Replace"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setReplaceText(event.target.value);
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    data-tid="replaceAllTID"
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
                              replaceText,
                            );
                          } catch (e) {
                            console.debug('searchAndSelect', e);
                          }
                        }
                      }
                    }}
                  >
                    Replace All
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SearchDialog;
