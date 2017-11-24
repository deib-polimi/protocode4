/*
 templates/view_controller/index.hbs
 */
App.ViewControllerIndexController = Ember.ObjectController.extend(App.Saveable, {

    actions: {
        createAsyncTask: function (value) {
            var viewController = this.get('model');
            var asyncTask = this.store.createRecord('asyncTask', {
                viewController: viewController
            });
            asyncTask.save();
            viewController.save();
        },

        createAlertDialog: function (value) {
            var viewController = this.get('model');
            var alertDialog = this.store.createRecord('alertDialog', {
                viewController: viewController
            });
            alertDialog.save();
            viewController.save();
        },

        createProgressDialog: function (value) {
            var viewController = this.get('model');
            var progressDialog = this.store.createRecord('progressDialog', {
                viewController: viewController
            });
            progressDialog.save();
            viewController.save();
        },

        createChain: function() {
            var viewController = this.get('model');
            var controlChain = this.store.createRecord('controlChain', {
                viewController: viewController,
                spacing: 0
            });
            controlChain.save();
            viewController.save();
            this.transitionToRoute('controlChain', controlChain);
        },

        deleteViewController: function () {
            if (confirm('Are you sure to delete?')) {
                var viewController = this.get('model');
                var scene = viewController.get('scene');
                scene.get('viewControllers').removeObject(viewController);
                scene.save();
                var screens = scene.get('sceneScreens');
                screens.forEach(function(sc) {
                    var vcs = sc.get('viewControllers');
                    if(vcs.contains(viewController)) {
                        vcs.removeObject(viewController);
                        vcs.save();
                    }
                });
                this.store.find('navigation').then(function (navigations) {
                    navigations.forEach(function (navigation) {
                        if (navigation.get('destination') === viewController) {
                            navigation.set('destination', null);
                            navigation.save();
                        }
                    });
                });
                viewController.deleteRecord();
                viewController.save();
                this.transitionToRoute('scene', scene);
            }
        }

    }

});
