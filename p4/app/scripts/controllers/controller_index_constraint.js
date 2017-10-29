/*
 templates/constraint/index.hbs
 */
App.ConstraintIndexController = Ember.ObjectController.extend(App.Saveable, {
    needs: ['viewControllers'],

    actions: {
        acceptChanges: function() {
            var constraint = this.get('model');
            if(constraint.get('withParent')) {
                if(constraint.get('layoutEdge') !== null && constraint.get('referenceLayoutEdge') !== null) {
                    constraint.set('valid', true);
                } else {
                    constraint.set('valid', false);
                }
            } else {
                if(constraint.get('layoutEdge') !== null && constraint.get('referenceLayoutEdge') !== null && constraint.get('referenceElement') !== null) {
                    constraint.set('valid', true);
                } else {
                    constraint.set('valid', false);
                }
            }
            this._super();
        },

        delete: function () {
            var constraintToDelete = this.get('model');
            var uiPhoneControl = constraintToDelete.get('uiPhoneControl');
            this.get('uiPhoneControl.constraints').removeObject(constraintToDelete);
            uiPhoneControl.save();
            this.get('model').deleteRecord();
            this.get('model').save();
            this.transitionToRoute('dispatchUiPhoneControl', uiPhoneControl);
        }
    }

});
