/*
 templates/control_XXX/index.hbs
 */
App.UiPhoneControlController = Ember.ObjectController.extend(App.Saveable, {
    number: 0,
    newConstraint: 'constraint',
    needs: ['viewController'],

    currentNumber: function() {
        var constraints = this.get('model.constraints');
        var n = -1;
        constraints.forEach(function(constraint) {
            var name = constraint.get('name');
            var i = parseInt(name.charAt(name.length - 1));
            if(i > n) {
                n = i;
            }
        });
        this.set('number', n + 1);
        return n + 1;
    }.property(
        'model.constraints',
        'model.constraints.name'
    ),

    handleConstraint: function (key, value, previousValue) {
        var model = this.get('model');

        // setter
        if (arguments.length > 1) {
            if (this.isGoodConstraint(model, key, value)) {
                model.set(key, value);
                model.save();
            } else {
                alert('Found circularity in constraints. Please restore previous value.');
            }
        }

        // getter
        return model.get(key);
    },

    isGoodConstraint: function (model, key, value) {
        if (value === null) {
            return true;
        }

        var uiPhoneControls = [];
        var uiPhoneControlsToCheck = model.getRelatedUiPhoneControls().concat(value).uniq();

        while (!($(uiPhoneControls).not(uiPhoneControlsToCheck).length === 0 && $(uiPhoneControlsToCheck).not(uiPhoneControls).length === 0) && !uiPhoneControlsToCheck.contains(model)) {
            uiPhoneControls = uiPhoneControlsToCheck;

            uiPhoneControlsToCheck = uiPhoneControlsToCheck.reduce(function (results, uiPhoneControl) {
                return results.concat(uiPhoneControl.getRelatedUiPhoneControls());
            }, []).uniq();

        }

        return !uiPhoneControlsToCheck.contains(model);
    },

    actions: {
        createConstraint: function () {
            this.get('currentNumber');
            var name = this.get('newConstraint') + this.get('number');

            var constraint = this.store.createRecord('constraint', {
                uiPhoneControl: this.get('model'),
                name: name,
                layoutEdge: null,
                withParent: false,
                referenceElement: null,
                referenceLayoutEdge: null,
                value: 0,
                valid: false
            });

            this.set('number', this.get('number') + 1);

            constraint.save();
        },

        deleteUiPhoneControl: function () {
            var controlToDelete = this.get('model');

            if (this.get('parentContainer')) {
                var uiPhoneControls = this.get('parentContainer.uiPhoneControls');
                uiPhoneControls.removeObject(controlToDelete);
                this.get('parentContainer').save();
            } else {
                var viewController = this.get('viewController');
                viewController.get('uiPhoneControls').then(function (uiPhoneControls) {
                    uiPhoneControls.removeObject(controlToDelete);
                    viewController.save();
                });

            }

            controlToDelete.deleteRecord();
            controlToDelete.save();

            this.transitionToRoute('viewController');
        }
    }

});
