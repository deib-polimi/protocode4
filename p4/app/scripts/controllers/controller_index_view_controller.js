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
                axis: 'horizontal',
                type: 'spread',
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
                var id = this.get('id');
                this.store.find('navigation').then(function (navigations) {
                    navigations.forEach(function (navigation) {
                        if (navigation.get('destination') === ('viewController/' + id)) {
                            navigation.set('destination', null);
                            navigation.save();
                        }
                    });
                });
                if(viewController.get('parentContainer')) {
                    viewController.get('parentContainer').deleteFromVCController();
                }
                viewController.deleteRecord();
                viewController.save();
                this.transitionToRoute('scene', scene);
            }
        }

    }

});
