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
        'model.constraints.@each',
        'model.constraints.@each.name'
    ),

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

            this.transitionToRoute('constraint', constraint);
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

            if(controlToDelete.get('controlChain')) {
                var chain = controlToDelete.get('controlChain');
                chain.get('uiPhoneControls').removeObject(controlToDelete);
                chain.save();
            }

            this.set('number', this.get('number') - 1);

            controlToDelete.deleteRecord();
            controlToDelete.save();

            this.transitionToRoute('viewController');
        }
    }

});
