
/*
---

name: DOBSelect

description: Date of birth <select> drop downs

authors:
    Simon Smith

license: MIT-style license.

version: 1.1

requires:
  - Core/Event
  - Core/Element
  - Core/Class
  - More/Date

provides:
  - DOBSelect
...
*/

(function(win) {

    'use strict';

    win.DOBSelect = new Class({

        Implements: [Options, Events],

        options: {
            youngestValidAge: 16,
            oldestValidAge: 110,
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            optionTemplate: ['<option value=', null, '>', null, '</option>'],
            parseDateFormat: '%d/%m/%Y',
            initialDate: new Date() // Used to determine initial day values in dropdown
        },

        /**
            @param {Element} container Element containing all three select elements
            @param {Object} options
            @constructs
        */
        initialize: function(container, options) {

            this.setOptions(options);
            this.container = document.id(container);
            this.optionTemplate = this.options.optionTemplate;

            // Used to set option values
            this.dateNow = this.options.initialDate;

            // Quit if any select elements are missing
            this.selects = this.container.getElements('[data-select]');
            if (this.selects.length !== 3) throw 'DOBSelect has missing <select> elements!';

            // Create references to select elements and initialise values
            this.selects.each(function(element) {
                var type = element.get('data-select'),
                    methodName = 'create{type}List'.substitute({
                        type: type.capitalize()
                    });
                this[type] = element.set('html', this[methodName]());
            }, this);

            this.attachEvents();
            this.fireEvent('ready');

        },

        attachEvents: function() {

            var self = this;

            // Update days if user changes month or year drop down
            self.container.addEvent('change:relay([data-select])', function(event, el) {
                var type = el.get('data-select');
                if (type !== 'day') self.updateDays();
                self.fireEvent('change', [el, type]);
            });

        },

        /**
            Tries to return a date from the DOB select
            Parsed using options or overridden via 'format' argument

            @param {String} format Valid date format
            @returns {String} Formatted date
            @public
        */
        parseDate: function(format) {

            var year = this.year.get('value'),
                month = this.month.get('value'),
                day = this.day.get('value');

            if (!year || !month || !day) {
                this.fireEvent('error', ['Invalid date', [year, month, day]]);
                return null;
            }

            var date = Date.parse([year, month, day].join("-")).format(format || this.options.parseDateFormat);

            this.fireEvent('valid', date);
            return date;

        },

        /**
            Sets the DOB select to an initial value

            @param {String} format Valid date format
            @public
        */
        setDate: function(format) {

            var date = Date.parse(format);

            if (!date.isValid()) return;

            this.year.set('value', date.get('year'));
            this.month.set('value', date.get('mo') + 1);

            this.updateDays(); // Ensure day select has correct total of days available
            this.day.set('value', date.get('Date')); // Now set it

            this.fireEvent('setDate');

        },

        /**
            Sets the DOB back to default empty values

            @public
        */
        reset: function() {

            this.selects.each(function(element) {
                element.set('value');
            });

        },

        /**
            Adds or removes from the Day select based on current year and month

            @public
        */
        updateDays: function() {

            var daySelect = this.day,
                daysInMonth = this.getDaysInMonth(this.year.get('value'), this.month.get('value')),
                currentDayTotal = parseInt(daySelect.getLast().get('value'));

            if (currentDayTotal > daysInMonth) {
                while (currentDayTotal > daysInMonth) {
                    daySelect.getLast().destroy();
                    currentDayTotal--;
                }
            } else if (currentDayTotal < daysInMonth) {
                while (currentDayTotal < daysInMonth) {
                    currentDayTotal++;

                    daySelect.grab(new Element('option', {
                        value: currentDayTotal,
                        text: currentDayTotal
                    }));
                }
            }

            this.fireEvent('update');

        },

        toElement: function() {
            return this.element;
        },

        /**
            @param {Number} year
            @param {Number} month
            @returns {Number} Total days in month
            @protected
        */
        getDaysInMonth: function(year, month) {

            // Use current date as defaults
            year = year || this.dateNow.get('year');
            month = month || this.dateNow.format('%m');

            return new Date(parseInt(year), parseInt(month), 0).getDate();

        }.protect(),

        /**
            @param {String|Number} index Content of the option element
            @param {Number} val
            @returns {String} HTML string of a single option element
            @protected
        */
        createOption: function(index, val) {

            var tpl = this.optionTemplate;
            tpl[1] = val;
            tpl[3] = index;
            return tpl.join('');

        }.protect(),

        /**
            @returns {String} HTML string of option element
            @protected
        */
        createMonthList: function() {

            var months = this.options.months,
                optionElements = ['<option value="">Month</option>'];

            for (var i = 0, len = months.length; i < len; ++i) {
                optionElements.push(this.createOption(months[i], i + 1));
            }

            return optionElements.join('');

        }.protect(),

        /**
            @returns {String} HTML string of option element
            @protected
        */
        createYearList: function() {

            var currentYear = this.dateNow.get('year'),
                youngestYear = currentYear - this.options.youngestValidAge, // eg 1995
                oldestYear = currentYear - this.options.oldestValidAge, // eg 1912
                optionElements = ['<option value="">Year</option>'];

            for (var yearDecrement; youngestYear > oldestYear;) {
                yearDecrement = --youngestYear;
                optionElements.push(this.createOption(yearDecrement, yearDecrement));
            }

            return optionElements;

        }.protect(),

        /**
            @returns {String} HTML string of option element
            @protected
        */
        createDayList: function() {

            var daysInMonth = this.getDaysInMonth(),
                optionElements = ['<option value="">Day</option>'],
                dayIncrement;

            for (var i = 0; i < daysInMonth;) {
                dayIncrement = ++i;
                optionElements.push(this.createOption(dayIncrement, dayIncrement));
            }

            return optionElements;

        }.protect()

    });

}(window));
