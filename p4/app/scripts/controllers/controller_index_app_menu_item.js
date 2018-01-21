/*
 templates/app_menu_item/index.hbs
 */
App.AppMenuItemIndexController = Ember.ObjectController.extend(App.NavigableSaveable, {
    needs: ['application'],

    navigationArray: function() {
        if(this.get('controllers.application.model.scenes')) {
            var self = this;
            return DS.PromiseArray.create({
                promise: self.get('controllers.application.model.scenes').then(function(scenes) {
                    return scenes;
                })
            });
        }
        return [];
    }.property(
        'controllers.application.model.scenes.[]'
    ),

    /*isDirtyOverride: function() {
        if(this.get('model')) {
            return this.get('model.d');
        }
        return false;
    }.property('model.navigation.destinationScene'),*/

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
