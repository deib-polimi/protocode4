/*
 templates/view_controller.hbs
 */
App.ViewControllerController = Ember.ObjectController.extend({
    needs: ['editor'],
    isActive: false,
    zoomLevel: 1,
    isRotated: false,

    scene: Ember.computed.alias('model.scene'),
    menu: Ember.computed.alias('controllers.editor.menu'),
    device: Ember.computed.alias('controllers.editor.device'),

    hasMenu: function () {
        return this.get('menu.menuItems.length') > 0;
    }.property('menu.menuItems.@each'),

    currentDeviceIsSmartphone: function() {
        return this.get('device.type') === 'smartphone';
    }.property('device.type'),

    tabMenuItems: function() {
        if(this.get('currentDeviceIsSmartphone')) {
            return this.get('scene.viewControllers').map(function(vc) {
                return vc.get('name');
            });
        } else {
            return this.get('scene.sceneScreens').filter(function(sc) {
                return sc.get('viewControllers.length') > 0;
            }).map(function(sc) {
                return sc.get('name');
            });
        }
    }.property(
        'currentDeviceIsSmartphone',
        'scene.viewControllers.@each.name',
        'scene.sceneScreens.@each.name'
    ),

    haveScreen: function() {
        if(this.get('model.sceneScreen')) {
            return true;
        }
        return false;
    }.property('model.sceneScreen'),

    separationLinesStyle: function() {
        if(this.get('model.sceneScreen')) {
            var result = [];
            var top = this.get('device.viewTop');
            var height = this.get('device.viewBottom') - this.get('device.viewTop');
            if(this.get('model.hasTabMenu')) {
                if(this.get('device.platform') === 'android') {
                    top = top + 48;
                }
                height = height - 48;
            }
            var vcs = this.get('model.sceneScreen.viewControllers');
            vcs.without(vcs.get('firstObject')).forEach(function(vc) {
                var style = "left:" + vc.get('startInScreen') +
                    "px;top:" + top + "px;height:" + height + "px;";
                result.pushObject(style);
            });

            return result;
        }
        return [];
    }.property(
        'model.sceneScreen',
        'model.sceneScreen.viewControllers.@each.startInScreen',
        'model.hasTabMenu',
        'device.platform',
        'device.viewTop',
        'device.viewBottom'
    ),

    isRotatedObserver: function() {
        if(!this.get('isDeleted') && this.get('device.type') === 'tablet') {
            var mustUpdate = (this.get('isRotated') && !this.get('device.isDirty')) ||
                (!this.get('isRotated') && this.get('device.isDirty'));
            if(mustUpdate) {
                var device = this.get('device');
                // Invert dimensions
                var temp = device.get('screenWidth');
                device.set('screenWidth', device.get('screenHeight'));
                device.set('screenHeight', temp);
                // Invert css dimensions
                temp = device.get('cssWidth');
                device.set('cssWidth', device.get('cssHeight'));
                device.set('cssHeight', temp);
                // Calculate view top and bottom
                if(device.get('platform') === 'ios') {
                    device.set('viewTop', 65);
                    device.set('viewBottom', device.get('screenHeight'));
                } else {
                    device.set('viewTop', 88); // 24 status_bar + 64 action_bar
                    device.set('viewBottom', device.get('screenHeight') - 47);
                }
            }
        }
    }.observes('isRotated', 'device')

});
