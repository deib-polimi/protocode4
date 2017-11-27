/*
 templates/view_scene.hbs
 */
App.SceneController = Ember.ObjectController.extend(App.Saveable, {
    number: 1,
    newViewControllerName: 'newView',
    needs: ['viewController'],

    screens: Ember.computed.alias('model.sceneScreens'),
    viewControllers: Ember.computed.alias('model.viewControllers'),

    addedViewController: null,

    currentNumber: function() {
        var viewControllers = this.get('viewControllers');
        var n = 0;
        viewControllers.forEach(function(viewController) {
            var name = viewController.get('name');
            var i = parseInt(name.charAt(name.length - 1));
            if(i > n) {
                n = i;
            }
        });
        this.set('number', n + 1);
        return n + 1;
    }.property(
        'model.viewControllers.@each',
        'model.viewControllers.@each.name'
    ),

    availableViewControllers: function() {
        var self = this;
        if(self.get('screens.content.0.viewControllers') && self.get('screens.content.1.viewControllers') &&
            self.get('screens.content.2.viewControllers') && self.get('screens.content.3.viewControllers')) {
            return this.get('viewControllers').filter(function(vc) {
                if(self.get('screens.content.0.viewControllers').contains(vc)) {
                    return false;
                }
                if(self.get('screens.content.1.viewControllers').contains(vc)) {
                    return false;
                }
                if(self.get('screens.content.2.viewControllers').contains(vc)) {
                    return false;
                }
                if(self.get('screens.content.3.viewControllers').contains(vc)) {
                    return false;
                }
                return true;
            });
        }
        return [];
    }.property(
        'viewControllers.@each',
        'screens.content.@each.viewControllers.[]'
    ),

    isDirtyOverride: function() {
        var screens = this.get('screens');
        if(!screens) {
            return false;
        }
        var i, dirty = false;
        for(i = 0; i < screens.get('length') && !dirty; i++) {
            dirty = screens.objectAt(i).get('isDirty');
        }
        if(this.get('model.isDirty') || dirty) {
            return true;
        }
        return false;
    }.property('model.isDirty', 'screens.@each.isDirty', 'screens.@each.viewControllers.@each.isDirty'),

    varyForTabletsObserver: function() {
        if(!this.get('model.isDeleted') && !this.get('model.varyForTablets')) {
            // Remove all view controllers from screens
            this.get('model.sceneScreens').forEach(function(sc) {
                var vcs = sc.get('viewControllers');
                vcs.forEach(function(vc) {
                    vcs.removeObject(vc);
                });
                sc.save();
            });
        }
    }.observes('model.varyForTablets'),

    actions: {
        acceptChanges: function() {
            this.get('screens').forEach(function(sc) {
                sc.save();
            });
            this._super();
        },

        createViewController: function () {
            this.get('currentNumber');
            var name = this.get('newViewControllerName') + this.get('number');

            var viewController = this.store.createRecord('viewController', {
                scene: this.get('model'),
                name: name
            }).save().then(function(vc) {
                vc.get('scene.viewControllers').addObject(vc);
                vc.get('scene').save();
            });

            this.set('number', this.get('number') + 1);

            this.transitionToRoute('viewController', viewController);
        },

        deleteScene: function () {
            if (confirm('Are you sure to delete?')) {
                this.set('number', this.get('number') - 1);

                var app = this.get('model.application');
                app.get('scenes').removeObject(this.get('model'));
                app.save();
                this.get('model').deleteRecord();
                this.get('model').save();

                this.transitionToRoute('scenes');
            }
        },

        addViewController: function(index) {
            if(this.get('addedViewController') && this.get('screens.content.' + index + '.viewControllers.length') <= 4) {
                this.set('addedViewController.sceneScreen', this.get('screens.content.' + index));
                var screenViewControllers = this.get('screens.content.' + index + '.viewControllers');
                screenViewControllers.addObject(this.get('addedViewController'));
                screenViewControllers.forEach(function(vc) {
                    vc.set('widthPercentInScreen', 1 / screenViewControllers.get('length'));
                    vc.save();
                });
            }
        },

        removeViewController: function(index, viewController) {
            var screenViewControllers = this.get('screens').objectAt(index).get('viewControllers');
            screenViewControllers.removeObject(viewController);
            viewController.set('sceneScreen', null);
            screenViewControllers.forEach(function(vc) {
                vc.set('widthPercentInScreen', 1 / screenViewControllers.get('length'));
                vc.save();
            });
        }
    }

});
