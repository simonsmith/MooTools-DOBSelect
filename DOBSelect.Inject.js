
/*
---

name: DOBSelect.Inject

description: Adds select elements to the DOM for DOBSelect

authors:
    Simon Smith

license: MIT-style license.

version: 1.1

requires:
  - DOBSelect

provides:
  - DOBSelect.Inject
...
*/

(function(win) {

    'use strict';

    var instanceCount = 1;

    win.DOBSelect.Inject = new Class({

        Extends: win.DOBSelect,

        options: {
            injectPosition: 'bottom',
            containerClass: 'date-of-birth',
            interceptTargetChanges: false,
            addNameAttr: true
        },

        /**
            @param {Element} targetElement Element used as a reference for insertion
            @param {Object} options
            @constructs
        */
        initialize: function(targetElement, options) {

            this.setOptions(options);
            this.targetElement = document.id(targetElement);
            var container = this.createElements();

            container.inject(this.targetElement, this.options.injectPosition);
            this.fireEvent('inject', [this.targetElement, container]);

            // Allow instance to intercept changes to the target element via .set()
            if (this.options.interceptTargetChanges) {
                var setter = this.targetElement.set;

                this.targetElement.set = function(key, value) {
                    this.fireEvent('inputUpdate', [key, value]);
                    setter.apply(this.targetElement, arguments);
                }.bind(this);
            }

            instanceCount++;

            this.parent(container, options);

        },

        /**
            @returns {Element} <div> element containing labels/selects
        */
        createElements: function() {

            var options = this.options,
                uniqueId = ['-dob', instanceCount].join(''),
                containerClass = [options.containerClass, ' ', options.containerClass, uniqueId].join(''),
                container = new Element('div', {
                    'class': containerClass
                }),
                types = {
                    day: 'Day',
                    month: 'Month',
                    year: 'Year'
                };

            Object.each(types, function(typeValue, typeKey) {

                var id = typeKey + uniqueId,
                    label = new Element('label', {
                        'for': id,
                        text: typeValue,
                        'class': 'label-' + id
                    }),
                    select = new Element('select', {
                        id: id,
                        'data-select': typeKey,
                        'class': 'select-' + id,
                        name: id
                    });

                if (!options.addNameAttr) select.erase('name');
                container.adopt(label, select);

            });

            return container;

        }.protect()

    });

}(window));
