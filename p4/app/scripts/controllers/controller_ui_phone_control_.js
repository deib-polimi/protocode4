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
                valid: false
            });

            this.set('number', this.get('number') + 1);

            constraint.save().then(function (cons) {
                cons.get('uiPhoneControl.constraints').addObject(cons);
                cons.get('uiPhoneControl').save();
            });;

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
                var uiPhoneControls = viewController.get('uiPhoneControls');
                uiPhoneControls.removeObject(controlToDelete);
                viewController.save();

            }

            if(controlToDelete.get('controlChain')) {
                var chain = controlToDelete.get('controlChain');
                chain.get('uiPhoneControls').removeObject(controlToDelete);
                chain.save();
            }

            controlToDelete.get('bindedControls').forEach(function(control) {
                control.get('bindedControls').removeObject(controlToDelete);
                control.get('constraints').forEach(function(c) {
                    if(c.get('referenceElement') === controlToDelete) {
                        c.deleteRecord();
                        c.save();
                    }
                });
                control.save();
            });

            this.set('number', this.get('number') - 1);

            controlToDelete.deleteRecord();
            controlToDelete.save();

            this.transitionToRoute('viewController');
        }
    }

});
