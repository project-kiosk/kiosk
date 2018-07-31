'use strict';

/*
 global module,
 require
 */

import Editor from 'medium-editor';
import Flatpickr from 'flatpickr';
import FlatpickrLocale from 'flatpickr/dist/l10n/de';

document.addEventListener('DOMContentLoaded', () => {
  let inputElements = Array.from(document.querySelectorAll('label > input'));

  inputElements.forEach(input => input.addEventListener('focus', event => {
    input.parentNode.classList.add('focus');
  }));

  inputElements.forEach(input => input.addEventListener('blur', event => {
    input.parentNode.classList.remove('focus');
  }));

  /**
   * set up the WYSIWYG editor for the description
   */
  const editor = new Editor('.editor', {
    autoLink:            true,
    imageDragging:       true,
    delay:               0,
    disableReturn:       false,
    disableDoubleReturn: false,
    disableExtraSpaces:  true,
    disableEditing:      false,
    elementsContainer:   document.querySelector('form.add-book'),
    extensions:          {},
    spellcheck:          true,
    targetBlank:         true,
    placeholder:         {
      text:        'Text eingeben',
      hideOnClick: true
    },
    toolbar:             {
      allowMultiParagraphSelection: true,
      buttons:                      [
        {
          name:           'bold',
          contentDefault: 'F'
        },
        {
          name:           'italic',
          contentDefault: 'K'
        },
        'underline',
        {
          name:           'anchor',
          contentDefault: '',
          classList:      [ 'im', 'im-link' ]
        },
        {
          name:           'h2',
          contentDefault: 'H1'
        },
        {
          name:           'h3',
          contentDefault: 'H2'
        },
        {
          name:           'quote',
          contentDefault: '',
          classList:      [ 'im', 'im-quote-right' ]
        },
        {
          name:           'removeFormat',
          contentDefault: '',
          classList:      [ 'im', 'im-edit-off' ]
        }
      ],
      diffLeft:                     0,
      diffTop:                      -16,
      firstButtonClass:             'medium-editor-button-first',
      lastButtonClass:              'medium-editor-button-last',
      relativeContainer:            null,
      standardizeSelectionStart:    false,
      static:                       false,
      /* options which only apply when static is true */
      align:                        'center',
      sticky:                       false,
      updateOnEmptySelection:       false
    },
    anchor:              {
      customClassOption:     null,
      customClassOptionText: 'Button',
      linkValidation:        false,
      placeholderText:       'Link einfügen oder eingeben',
      targetCheckbox:        false,
      targetCheckboxText:    'In neuem Fenster öffnen'
    },
    anchorPreview:       {
      hideDelay:                500,
      previewValueSelector:     'a',
      showWhenToolbarIsVisible: false,
      showOnEmptyLinks:         false
    },
    paste:               {
      forcePlainText:    true,
      cleanPastedHTML:   true,
      cleanReplacements: [],
      cleanAttrs:        [ 'class', 'style', 'dir', 'id' ],
      cleanTags:         [ 'meta', 'script' ],
      unwrapTags:        []
    }
  });

  /**
   * set up the date picker for the publication date
   */
  const dateInput  = document.querySelector('#book-publishing-date'),
        datePicker = new Flatpickr(dateInput, {
          locale:      FlatpickrLocale.de,
          defaultDate: new Date(dateInput.dataset.date),
          dateFormat:  'd.m.Y',
          appendTo:    dateInput.parentNode,
          static:      true
        });

  document.querySelector('input#book-cover').addEventListener('change', function(event) {
    if (this.files && this.files[ 0 ]) {
      const reader = new FileReader();

      reader.onload = event => {
        let coverPlaceholder = document.querySelector('.book-cover-placeholder');
        coverPlaceholder.classList.add('loaded');
        coverPlaceholder.style.backgroundImage = `url(data:${event.target.result})`;
      };

      reader.readAsDataURL(this.files[ 0 ]);
    }
  });
});
