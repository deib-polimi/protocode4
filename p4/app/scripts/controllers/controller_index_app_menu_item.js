/*
 templates/app_menu_item/index.hbs
 */
App.AppMenuItemIndexController = Ember.ObjectController.extend(App.Saveable, App.Deletable, App.Navigable, {
    needs: ['scenes'],

    actions: {
        delete: function () {
            var menuItemToDelete = this.get('model');
            var menu = menuItemToDelete.get('parentMenu');
            this.get('parentMenu.menuItems').removeObject(menuItemToDelete);
            menu.save();
            this.get('model').deleteRecord();
            this.get('model').save();
            this.transitionToRoute('scene');
        }
    }

});
