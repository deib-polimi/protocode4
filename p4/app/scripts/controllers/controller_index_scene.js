/*
 templates/scene/index.hbs
*/
App.SceneIndexController = Ember.ObjectController.extend(App.Saveable, {
    number: 1,
    newViewControllerName: 'newView',
    sceneTypes: ['singleVC', 'multiVC'],

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

    singleVCScene: function() {
        return this.get('model.type') === 'singleVC';
    }.property('model.type'),

    cantChangeHasMenu: function() {
        if(this.get('model.launcher')) {
            return true;
        }
        return false;
    }.property('model.launcher'),

    // USED by partial _invalid_report.hbs
    invalidReport: function() {
        if(!this.get('model.valid')) {
            return 'Scene is invalid due to the number of view controllers:\nit contains only '
                + this.get('model.childViewControllers.length') +
                ' view controllers while multiVC type scenes must have at least 2 view controllers.';
        }
        return null;
    }.property('model.valid', 'model.childViewControllers.length'),
    // END partial _invalid_report.hbs

    actions: {

        createViewController: function () {
            this.get('currentNumber');
            var nameVC = this.get('newViewControllerName') + this.get('number');

            // Create container; the view controller is created by container's didCreate
            var parentViewController = this.get('model.parentViewController');
            var container = this.store.createRecord('container', {
                name: nameVC,
                viewController: parentViewController,
                childViewController: null
            });

            // Add container to parentViewController's uiPhoneControls
            parentViewController.get('uiPhoneControls').addObject(container);
            parentViewController.save();
            container.save();

            this.set('number', this.get('number') + 1);
        },

        deleteScene: function () {
            if (confirm('Are you sure to delete?')) {
                this.set('number', this.get('number') - 1);

                var id = this.get('id');
                this.store.find('navigation').then(function (navigations) {
                    navigations.forEach(function (navigation) {
                        if (navigation.get('destination') === ('scene/' + id)) {
                            navigation.set('destination', null);
                            navigation.save();
                        }
                    });
                });

                var app = this.get('model.application');
                app.get('scenes').removeObject(this.get('model'));
                app.save();
                this.get('model').deleteRecord();
                this.get('model').save();

                this.transitionToRoute('scenes');
            }
        }
    }

});
