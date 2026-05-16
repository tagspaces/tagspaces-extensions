(function(factory) {
  /* global define */
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(window.jQuery);
  }
})(function($) {
  var allCheckboxesSelected = false;
  // Extends plugins for adding Checkbox.
  $.extend($.summernote.plugins, {
    /**
     * @param {Object} context - context object has status of editor.
     */
    checkbox: function(context) {
      const self = this;
      const ui = $.summernote.ui;

      const $editor = context.layoutInfo.editor;

      context.memo('button.checkbox', function() {
        const button = ui.button({
          contents: `
          <svg width="16" height="16" class="bi">
            <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
          </svg>
          `,
          tooltip: 'Add Checkbox(To-do)',
          click: function() {
            context.invoke('insertNode', self.createCheckbox());
          }
        });

        return button.render();
      });

      this.createCheckbox = function() {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'tsCheckBox';

        const span = document.createElement('span');
        span.appendChild(checkbox);
        span.text = ' ';
        return span;
      };

      // This events will be attached when editor is initialized.
      this.events = {
        'summernote.init': function(we, e) {},
        'summernote.keyup': function(we, e) {}
      };

      this.initialize = function() {
        $editor.click(function(event) {
          if (event.target.type && event.target.type == 'checkbox') {
            const checked = $(event.target).is(':checked');
            $(event.target).attr('checked', checked);
            context.invoke('insertText', '');
          }
        });
      };

      this.destroy = function() {};
    },

    /**
     * @param {Object} context - context object has status of editor.
     */
    toggleSelectAllButton: function(context) {
      const self = this;
      const ui = $.summernote.ui;

      context.memo('button.toggleSelectAllButton', function() {
        const button = ui.button({
          contents: `
          <svg width="16" height="16" class="bi">
            <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z"/>
          </svg>
          `,
          tooltip: 'Toggle All Checkboxes(To-dos)',
          click: function() {
            //context.invoke('insertNode', self.toggleSelectAllButton());
            self.toggleSelectAllButton();
          }
        });

        return button.render();
      });

      this.toggleSelectAllButton = function() {
        const inputs = document.getElementsByClassName('tsCheckBox');

        for (var i = 0; i < inputs.length; i++) {
          if (allCheckboxesSelected) {
            inputs[i].removeAttribute('checked', 'checked');
          } else {
            inputs[i].setAttribute('checked', 'checked');
          }
        }
        allCheckboxesSelected = !allCheckboxesSelected;
        return inputs;
      };

      // This events will be attached when editor is initialized.
      this.events = {
        'summernote.init': function(we, e) {},
        'summernote.keyup': function(we, e) {}
      };

      this.initialize = function() {
        var layoutInfo = context.layoutInfo;
        var $editor = layoutInfo.editor;

        $editor.click(function(event) {
          if (event.target.type && event.target.className === 'tsCheckBox') {
            const checked = $(event.target).is(':checked');
            $(event.target).attr('checked', checked);
            context.invoke('insertText', '');
          }
        });
      };

      this.destroy = function() {};
    },

    /**
     * Inserts a TagSpaces link by asking the host to open the FilePicker
     * dialog via the `requestFilePicker` postMessage protocol. The host
     * replies with either `{ link, linkType, label, ... }` or
     * `{ cancelled: true }`. On success we insert `<a href="link">label</a>`
     * at the cursor (or wrap the current selection).
     *
     * @param {Object} context - context object has status of editor.
     */
    tslink: function(context) {
      const ui = $.summernote.ui;

      context.memo('button.tslink', function() {
        const button = ui.button({
          contents: `
          <svg width="20" height="20" viewBox="0 0 24 24" style="fill: #000">
            <path d="M8 11h8v2H8zm12.1 1H22c0-2.76-2.24-5-5-5h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1M19 12h-2v3h-3v2h3v3h2v-3h3v-2h-3z"/>
          </svg>
          `,
          tooltip: 'Insert TagSpaces link',
          click: function() {
            // Save the current selection so we can restore it after the
            // host dialog steals focus.
            const savedRange = context.invoke('editor.createRange');
            // Best-effort: capture selected text as a default link label.
            let selectedText = '';
            try {
              selectedText = savedRange ? savedRange.toString() : '';
            } catch (e) {
              selectedText = '';
            }

            const eventID =
              typeof getParameterByName === 'function'
                ? getParameterByName('eventID')
                : '';

            function handleReply(e) {
              const data = e.data;
              if (!data || typeof data !== 'object') return;
              // Filter to our request: it's a reply if it carries our eventID
              // AND has either `link` or `cancelled`. Other host replies
              // (e.g. `{ action: 'fileContent' }`) don't carry an eventID.
              const isReply =
                data.eventID === eventID &&
                (typeof data.link === 'string' || data.cancelled === true);
              if (!isReply) return;
              window.removeEventListener('message', handleReply);
              if (data.cancelled) return;

              // Restore selection so insert lands where the user was typing.
              if (savedRange) context.invoke('editor.restoreRange', savedRange);

              const label =
                (typeof data.label === 'string' && data.label.trim()) ||
                selectedText ||
                data.name ||
                data.link;
              const anchor = document.createElement('a');
              anchor.setAttribute('href', data.link);
              anchor.textContent = label;
              context.invoke('editor.insertNode', anchor);
            }

            window.addEventListener('message', handleReply);

            // Prefill the dialog's "Link text" field with the currently
            // selected editor text. The user can still edit it before
            // confirming; the final value comes back as `data.label`.
            const trimmedSelection = (selectedText || '').trim();
            const requestOptions = {
              mode: 'any',
              showLabelField: true,
            };
            if (trimmedSelection) {
              requestOptions.initialLabel = trimmedSelection;
            }

            if (typeof sendMessageToHost === 'function') {
              sendMessageToHost({
                command: 'requestFilePicker',
                options: requestOptions,
              });
            } else {
              window.parent.postMessage(
                JSON.stringify({
                  command: 'requestFilePicker',
                  eventID: eventID,
                  options: requestOptions,
                }),
                '*',
              );
            }
          }
        });

        return button.render();
      });

      this.events = {};
      this.initialize = function() {};
      this.destroy = function() {};
    }
  });
});
