/*
 templates/view_controller.hbs
 */
App.ViewControllerController = Ember.ObjectController.extend({
    needs: ['editor'],
    isActive: false,
    zoomLevel: 1,

    menu: Ember.computed.alias('controllers.editor.menu'),
    device: Ember.computed.alias('controllers.editor.device'),

    hasMenu: function () {
        return this.get('menu.menuItems.length') > 0;
    }.property('menu.menuItems.@each'),

    currentDeviceIsSmartphone: function() {
        return this.get('device.type') === 'smartphone';
    }.property('device.type')

});
