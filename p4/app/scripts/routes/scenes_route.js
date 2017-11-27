App.ScenesRoute = Ember.Route.extend({

    model: function () {
        return this.store.find('application', 'newAppId').then(function (app) {
            return app.get('scenes');
        });
    },

    actions: {

        refreshModel: function () {
            this.refresh();
        }
    }
});
