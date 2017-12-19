/*
 templates/scene/index.hbs
*/
App.SceneIndexController = Ember.ObjectController.extend(App.Saveable, {

    viewControllers: Ember.computed.alias('model.viewControllers'),

    addedViewController: null,

    currentDeviceIsSmartphone: function() {
        return this.get('model.application.device.type') === 'smartphone';
    }.property('model.application.device.type'),

    cantChangeHasMenu: function() {
        if(this.get('model.launcher')) {
            return true;
        }
        return false;
    }.property('model.launcher'),

    availableViewControllers: function() {
        var scene = this.get('model');
        return scene.get('application.viewControllers').filter(function(vc) {
            return !(scene.get('viewControllers').contains(vc));
        });
    }.property('model.application.viewControllers.[]'),

    // USED by partial _invalid_report.hbs
    invalidReport: function() {
        if(!this.get('model.valid')) {
            return 'Scene is invalid since it has no view controllers.';
        }
        return null;
    }.property('model.valid'),
    // END partial _invalid_report.hbs

    actions: {
        addViewController: function() {
            if(this.get('model') && this.get('addedViewController')) {
                var vc = this.get('addedViewController');
                var scene = this.get('model');
                this.store.createRecord('container', {
                    viewController: scene.get('parentVCSmartphone'),
                    childViewController: vc
                }).save().then(function(containerSmartphone) {
                    scene.get('parentVCSmartphone.uiPhoneControls').pushObject(containerSmartphone);
                    scene.get('parentVCSmartphone').save();
                });
                this.store.createRecord('container', {
                    viewController: scene.get('parentVCTablet'),
                    childViewController: vc
                }).save().then(function(containerTablet) {
                    scene.get('parentVCTablet.uiPhoneControls').pushObject(containerTablet);
                    scene.get('parentVCTablet').save();
                });
            }
        },

        removeViewController: function(containerSmartphone) {
            if(this.get('model')) {
                var scene = this.get('model');
                var index = scene.get('parentVCSmartphone.uiPhoneControls').indexOf(containerSmartphone);
                var containerTablet = scene.get('parentVCTablet.uiPhoneControls').objectAt(index);
                // Delete container in smartphone - cont is already the container for the removed vc in the parentVCSmartphone
                scene.get('parentVCSmartphone.uiPhoneControls').removeObject(containerSmartphone);
                scene.get('parentVCSmartphone').save().then(function(parentVCSmartphone) {
                    containerSmartphone.deleteRecord();
                    containerSmartphone.save();
                });
                // Delete container in tablet
                scene.get('parentVCTablet.uiPhoneControls').removeObject(containerTablet);
                scene.get('parentVCTablet').save().then(function(parentVCTablet) {
                    containerTablet.deleteRecord();
                    containerTablet.save();
                });
            }
        },

        deleteScene: function () {
            if (confirm('Are you sure to delete?')) {
                var scene = this.get('model');
                var id = scene.get('id');
                this.store.find('navigation').then(function (navigations) {
                    navigations.forEach(function (navigation) {
                        if (navigation.get('destination') === ('scene/' + id)) {
                            navigation.set('destination', null);
                            navigation.save();
                        }
                    });
                });

                var parentVCSmartphone = scene.get('parentVCSmartphone');
                if(parentVCSmartphone) {
                    parentVCSmartphone.deleteRecord();
                    parentVCSmartphone.save();
                }
                var parentVCTablet = scene.get('parentVCTablet');
                if(parentVCTablet) {
                    parentVCTablet.deleteRecord();
                    parentVCTablet.save();
                }

                var app = scene.get('application');
                app.get('scenes').removeObject(scene);
                app.save().then(function(app) {
                    scene.deleteRecord();
                    scene.save();
                });

                this.transitionToRoute('scenes');
            }
        }
    }

});
