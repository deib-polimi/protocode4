/*
 templates/constraint/index.hbs
 */
App.ConstraintIndexController = Ember.ObjectController.extend(App.Saveable, {
    needs: ['viewControllers'],

    areGoodConstraints: function() {
        var thisConstraint = this.get('model');
        var constraints = this.get('model.uiPhoneControl.constraints').without(thisConstraint);
        var isIOS = this.get('model.uiPhoneControl.viewController.application.smartphone.platform') === 'ios';
        // Compute if the viewController has the menu bar
        var currentViewControllerIsMenu = false;
        var viewControllerName = this.get('model.uiPhoneControl.viewController.name');
        var menuItems = this.get('model.uiPhoneControl.viewController.application.menu.menuItems');
        menuItems.forEach(function (menuItem, index) {
            if (viewControllerName === menuItem.get('navigation.destination.name')) {
                currentViewControllerIsMenu = true;
            }
        });
        // Check x position over-constrained
        var constrainedX;
        if(thisConstraint.get('layoutEdge') === 'start' || thisConstraint.get('layoutEdge') === 'end') {
            constrainedX = false;
            constraints.forEach(function(constraint) {
                if(constraint.get('layoutEdge') === 'centerX') {
                    constrainedX = true;
                }
                if(thisConstraint.get('uiPhoneControl.isWidthConstrained')) {
                    if(constraint.get('layoutEdge') === 'start' || constraint.get('layoutEdge') === 'end') {
                        constrainedX = true;
                    }
                }
            });
            if(constrainedX) {
                return false;
            }
        } else if(thisConstraint.get('layoutEdge') === 'centerX') {
            constrainedX = false;
            constraints.forEach(function(constraint) {
                if(constraint.get('layoutEdge') === 'start' || constraint.get('layoutEdge') === 'end') {
                    constrainedX = true;
                }
            });
            if(constrainedX) {
                return false;
            }
        }
        // Check y position over-constrained
        var constrainedY;
        if(thisConstraint.get('layoutEdge') === 'top' || thisConstraint.get('layoutEdge') === 'bottom') {
            constrainedY = false;
            constraints.forEach(function(constraint) {
                if(constraint.get('layoutEdge') === 'centerY') {
                    constrainedY = true;
                }
                if(thisConstraint.get('uiPhoneControl.isHeightConstrained')) {
                    if(constraint.get('layoutEdge') === 'top' || constraint.get('layoutEdge') === 'bottom') {
                        constrainedY = true;
                    }
                }
            });
            if(constrainedY) {
                return false;
            }
        } else if(thisConstraint.get('layoutEdge') === 'centerY') {
            constrainedY = false;
            constraints.forEach(function(constraint) {
                if(constraint.get('layoutEdge') === 'top' || constraint.get('layoutEdge') === 'bottom') {
                    constrainedY = true;
                }
            });
            if(constrainedY) {
                return false;
            }
        }
        // Check boundaries: top
        var minTop = this.get('model.uiPhoneControl.viewController.application.smartphone.viewTop');
        if(currentViewControllerIsMenu && !isIOS) {
            minTop = minTop + 48;
        }
        if(thisConstraint.get('uiPhoneControl.top') < minTop) {
            return false;
        }
        // Check boundaries: bottom
        var maxBottom = this.get('model.uiPhoneControl.viewController.application.smartphone.viewBottom');
        if(currentViewControllerIsMenu && isIOS) {
            maxBottom = maxBottom - 48;
        }
        if(thisConstraint.get('uiPhoneControl.bottom') > maxBottom) {
            return false;
        }
        // Check boundaries: start
        var minStart = 0;
        if(thisConstraint.get('uiPhoneControl.start') < minStart) {
            return false;
        }
        // Check boundaries: end
        var maxEnd = this.get('model.uiPhoneControl.viewController.application.smartphone.screenWidth');
        if(thisConstraint.get('uiPhoneControl.end') > maxEnd) {
            return false;
        }
        return true;
    },

    actions: {
        acceptChanges: function() {
            var constraint = this.get('model');
            constraint.set('valid', true);
            constraint.save();
            if(constraint.get('withParent')) {
                if(constraint.get('layoutEdge') !== null && constraint.get('referenceLayoutEdge') !== null) {
                    if(this.areGoodConstraints()) {
                        constraint.set('valid', true);
                    } else {
                        constraint.set('valid', false);
                        alert("This constraint is not compatible with the others so it is not valid.\nYou can change it to a valid configuration in order to make it valid.");
                    }
                }
            } else {
                if(constraint.get('layoutEdge') !== null && constraint.get('referenceLayoutEdge') !== null && constraint.get('referenceElement') !== null) {
                    if(this.areGoodConstraints()) {
                        constraint.set('valid', true);
                    } else {
                        constraint.set('valid', false);
                        alert("This constraint is not compatible with the others so it is not valid.\nYou can change it to a valid configuration in order to make it valid.");
                    }
                }
            }
            this.set('flag', false);
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
