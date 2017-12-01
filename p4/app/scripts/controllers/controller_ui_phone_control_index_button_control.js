/*
 templates/control_button/index.hbs
 */
App.ControlButtonIndexController = App.UiPhoneControlController.extend(App.NavigableSaveable, {
    needs: ['scenes'],

    navigationArray: function() {
        if(this.get('controllers.scenes.model') && this.get('model.viewController.scene.viewControllers') && this.get('model.viewController')) {
            var array = this.get('controllers.scenes.model').map(function(s) {
                return s.get('referenceName');
            });
            array = array.pushObjects(this.get('model.viewController.scene.viewControllers').without(this.get('model.viewController')).map(function(vc) {
                return vc.get('referenceName');
            }));
            return array;
        }
        return [];
    }.property(
        'controllers.scenes.model.[]',
        'model.viewController',
        'model.viewController.scene.viewControllers.[]'
    )

});
