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
    }
  });
});
