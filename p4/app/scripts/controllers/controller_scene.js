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

    screen1: function() {
        return this.get('screens').objectAt(0);
    }.property('screens.@each'),

    screen2: function() {
        return this.get('screens').objectAt(1);
    }.property('screens.@each'),

    screen3: function() {
        return this.get('screens').objectAt(2);
    }.property('screens.@each'),

    screen4: function() {
        return this.get('screens').objectAt(3);
    }.property('screens.@each'),

    availableViewControllers: function() {
        var self = this;
        if(self.get('screen1.viewControllers') && self.get('screen2.viewControllers') &&
            self.get('screen3.viewControllers') && self.get('screen4.viewControllers')) {
            return this.get('viewControllers').filter(function(vc) {
                if(self.get('screen1.viewControllers').contains(vc)) {
                    return false;
                }
                if(self.get('screen2.viewControllers').contains(vc)) {
                    return false;
                }
                if(self.get('screen3.viewControllers').contains(vc)) {
                    return false;
                }
                if(self.get('screen4.viewControllers').contains(vc)) {
                    return false;
                }
                return true;
            });
        }
        return [];
    }.property(
        'viewControllers.@each',
        'screen1.viewControllers.@each',
        'screen2.viewControllers.@each',
        'screen3.viewControllers.@each',
        'screen4.viewControllers.@each'
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
    }.property('model.isDirty', 'screens.@each.isDirty'),

    varyForTabletsObserver: function() {
        if(!this.get('model.isDeleted') && !this.get('model.varyForTablets')) {
            // Remove all view controllers from screens
            this.get('screens').forEach(function(sc) {
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
                sc.get('viewControllers').forEach(function(vc) {
                    vc.save();
                });
            });
            this._super();
        },

        createViewController: function () {
            this.get('currentNumber');
            var name = this.get('newViewControllerName') + this.get('number');

            var viewController = this.store.createRecord('viewController', {
                scene: this.get('model'),
                name: name
            });

            this.set('number', this.get('number') + 1);

            viewController.save();
            this.get('model').save();

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
            if(this.get('addedViewController') && this.get('screens').objectAt(index).get('viewControllers.length') <= 4) {
                this.set('addedViewController.sceneScreen', this.get('screens').objectAt(index));
                var screenViewControllers = this.get('screens').objectAt(index).get('viewControllers');
                screenViewControllers.addObject(this.get('addedViewController'));
                screenViewControllers.forEach(function(vc) {
                    vc.set('widthPercentInScreen', 1 / screenViewControllers.get('length'));
                    vc.save();
                });
                this.get('addedViewController.sceneScreen').save();
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
            this.get('addedViewController.sceneScreen').save();
        }
    }

});
