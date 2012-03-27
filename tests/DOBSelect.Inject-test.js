
buster.spec.expose();

buster.testCase('DOBSelect.Inject ->', {

    setUp: function() {

        Locale.use('en-GB');
        Date.defineParser('%d/%m/%Y');

        var dom = [
            '<input type="text" name="dob" id="dateofbirth">'
        ].join('');

        document.body.set('html', dom);

        this.dobselect = new DOBSelect.Inject(document.id('dateofbirth'), {
            injectPosition: 'before'
        });

    },

    'Object setup ->': {

        'Expect instance to be created': function() {
            assert.isTrue(instanceOf(this.dobselect, DOBSelect.Inject));
        }

    }

});
