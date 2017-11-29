/*
 templates/app_menu_item/index.hbs
 */
App.AppMenuItemIndexController = Ember.ObjectController.extend(App.NavigableSaveable, {
    needs: ['scenes'],

    navigationArray: function() {
        return this.get('controllers.scenes.model').map(function(s) {
            return s.get('referenceName');
        });
    }.property('controllers.scenes.model.[]'),

    actions: {

        delete: function () {
            var menuItemToDelete = this.get('model');
            var menu = menuItemToDelete.get('parentMenu');
            this.get('parentMenu.menuItems').removeObject(menuItemToDelete);
            menu.save();
            this.get('model').deleteRecord();
            this.get('model').save();
            this.transitionToRoute('viewController');
        }
    }

});
