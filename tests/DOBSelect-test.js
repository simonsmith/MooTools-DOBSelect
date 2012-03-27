
    buster.spec.expose();

    buster.testCase('DOBSelect ->', {

        setUp: function() {

            Locale.use('en-GB');
            Date.defineParser('%d/%m/%Y');

            var dom = [
                '<div id="dob">',
                    '<label for="day">Day</label>',
                    '<select id="day" data-select="day"></select>',
                    '<label for="month">Month</label>',
                    '<select id="month" data-select="month"></select>',
                    '<label for="year">Year</label>',
                    '<select id="year" data-select="year"></select>',
                '</div>',
                '<input type="text" name="dob" id="dateofbirth">'
            ].join('');

            document.body.set('html', dom);
            this.dobselect = new DOBSelect(document.id('dob'));

            this.dob = document.id('dob');
            this.day = document.id('day');
            this.month = document.id('month');
            this.year = document.id('year');

        },

        'Object setup ->': {

            'Expect instance to be created': function() {
                assert.isTrue(instanceOf(this.dobselect, DOBSelect));
            }

        },

        'Initial drop down state ->': {

            setUp: function() {

                var date = new Date();
                this.currentMonth = date.getMonth() + 1;
                this.currentYear = date.getFullYear();

            },

            'Expect default text values in each drop down': function() {

                var day = document.id('day').getSelected().get('text'),
                    month = document.id('month').getSelected().get('text'),
                    year = document.id('year').getSelected().get('text');

                assert.same(String.from(day), 'Day');
                assert.same(String.from(month), 'Month');
                assert.same(String.from(year), 'Year');

            },

            'Expect total days to equal current month': function() {

                var daysInThisMonth = new Date(this.currentYear, this.currentMonth, 0).getDate(),
                    daysInSelect = document.id('day').getLast('option').get('value');
                
                assert.same(parseInt(daysInSelect), daysInThisMonth);

            },

            'Expect months to be populated from Jan to Dec': function() {

                var expectedMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].join(''),
                    actualMonths = '',
                    monthsDropdown = document.id('month').getChildren('option');

                monthsDropdown.shift();
                monthsDropdown.each(function(option) {
                    actualMonths += option.get('text');
                });

                assert.same(actualMonths, expectedMonths);

            },

            'Expect range of years to match the min/max set in options': function() {

                this.dobselect = new DOBSelect(document.id('dob'), {
                   youngestValidAge: 27,
                   oldestValidAge: 35
                });

                var actualYoungestYear = document.id('year').getChildren()[1].get('text'),
                    actualOldestYear = document.id('year').getLast().get('text' ),
                    expectedYoungestYear = this.currentYear - 27,
                    expectedOldestYear = this.currentYear - 35;

                assert.same(parseInt(actualYoungestYear), expectedYoungestYear - 1);
                assert.same(parseInt(actualOldestYear), expectedOldestYear);

            },

            'Expect instance to throw an error if there are less than three select elements': function() {

                var dom = [
                    '<div id="dob">',
                        '<label for="day">Day</label>',
                        '<select id="day" data-select="day"></select>',
                        '<label for="year">Year</label>',
                        '<select id="year" data-select="year"></select>',
                    '</div>',
                    '<input type="text" name="dob" id="dateofbirth">'
                ].join('');
                document.body.set('html', dom);

                assert.exception(function() {
                    this.dobselect = new DOBSelect(document.id('dob'));
                });

            }

        },

        'Setting a date ->': {

            'Expect date to be reset to empty placeholder values': function() {

                this.dobselect.setDate('13/12/1984');

                refute.same(String.from(this.day.getSelected().get('text')), 'Day');
                refute.same(String.from(this.month.getSelected().get('text')), 'Month');
                refute.same(String.from(this.year.getSelected().get('text')), 'Year');

                this.dobselect.reset();

                assert.same(String.from(this.day.getSelected().get('text')), 'Day');
                assert.same(String.from(this.month.getSelected().get('text')), 'Month');
                assert.same(String.from(this.year.getSelected().get('text')), 'Year');

            },

            'Expect date to be set when valid date string is passed': function() {

                this.dobselect.setDate('12/04/1984');
                
                assert.same(String.from(this.day.getSelected().get('text')), '12');
                assert.same(String.from(this.month.getSelected().get('text')), 'April');
                assert.same(String.from(this.year.getSelected().get('text')), '1984');

                this.dobselect.setDate('13/12/1982');

                assert.same(String.from(this.day.getSelected().get('text')), '13');
                assert.same(String.from(this.month.getSelected().get('text')), 'December');
                assert.same(String.from(this.year.getSelected().get('text')), '1982');

                this.dobselect.setDate('05/06/1970');

                assert.same(String.from(this.day.getSelected().get('text')), '5');
                assert.same(String.from(this.month.getSelected().get('text')), 'June');
                assert.same(String.from(this.year.getSelected().get('text')), '1970');

            },

            'Expect to handle invalid dates': function() {

                this.dobselect.setDate('blablabla');

                assert.same(String.from(this.day.getSelected().get('text')), 'Day');
                assert.same(String.from(this.month.getSelected().get('text')), 'Month');
                assert.same(String.from(this.year.getSelected().get('text')), 'Year');

                this.dobselect.setDate('1223/0224/1222984');

                assert.same(String.from(this.day.getSelected().get('text')), '1');
                assert.same(String.from(this.month.getSelected().get('text')), 'January');
                assert.same(String.from(this.year.getSelected().get('text')), '1970');

            }

        },

        'Parsing a date ->': {

            'Expect a valid date to be returned when all drop downs contain values': function() {

                this.dobselect.setDate('13/12/1984');

                assert.same(this.dobselect.parseDate(), '13/12/1984');
                assert.same(this.dobselect.parseDate('%m/%d/%Y'), '12/13/1984');
                assert.same(this.dobselect.parseDate('%Y/%m/%d'), '1984/12/13');

            },

            'Expect no date to be returned when drop downs contain NO values': function() {

                assert.isNull(this.dobselect.parseDate());

            },

            'Expect no date to be returned when drop downs contain partial values': function() {

                document.id('day').set('value', '12');
                document.id('month').set('value', 'December');

                assert.isNull(this.dobselect.parseDate());

            }

        },
        
        'Updating days ->': {
            
            'Expect days to total 30 when changing to November': function() {

                this.dobselect.setDate('13/11/1984');
                this.dob.fireEvent('change', {
                    target: this.month
                });

                assert.same(this.day.getLast().get('value'), '30');
            
            },

            'Expect days in Feb to equal 29 when changing to leap year': function() {

                this.dobselect.setDate('29/02/1984');
                this.dob.fireEvent('change', {
                    target: this.month
                });

                assert.same(this.day.getLast().get('value'), '29');

            },

            'Expect days to reset to default placeholder text when date cannot exist': function() {

                this.dobselect.setDate('31/03/1982');

                assert.same(String.from(this.day.getSelected().get('text')), '31');
                assert.same(String.from(this.month.getSelected().get('text')), 'March');
                assert.same(String.from(this.year.getSelected().get('text')), '1982');

                this.month.set('value', '2');
                this.dob.fireEvent('change', {
                    target: this.month
                });

                assert.same(String.from(this.day.getSelected().get('text')), 'Day');

            }
            
        }

    });
