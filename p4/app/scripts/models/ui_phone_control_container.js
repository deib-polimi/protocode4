App.Container = App.UiPhoneControl.extend({
    minWidth: 0,
    minHeight: 0,
    defaultWidth: 300,
    defaultHeight: 400,
    widthFixed: DS.attr('number', {defaultValue: 300}),
    heightFixed: DS.attr('number', {defaultValue: 400}),

    childViewController: DS.belongsTo('viewController', {inverse: 'parentContainer'}),

    xmlName: "containerView",

    didCreate: function() {
        var nameVC = this.get('name');
        var scene = this.get('viewController.scene');
        var childViewController = this.store.createRecord('viewController', {
            scene: scene,
            parentContainer: this,
            name: nameVC
        });
        this.set('childViewController', childViewController);
        scene.get('viewControllers').addObject(childViewController);
        this.set('name', 'Container-' + nameVC);
        childViewController.save();
        this.save();
    },

    getWidthFromPercent: function(widthPercent) {
        return widthPercent * this.get('width');
    },

    getHeightFromPercent: function(heightPercent) {
        return heightPercent * this.get('height');
    },

    deleteFromApp: function() {
        var child = this.get('childViewController');
        if(child) {
            child.deleteRecord();
            child.save();
        }
        this.deleteRecord();
    },

    deleteFromScene: function() {
        var child = this.get('childViewController');
        if(child) {
            var scene = child.get('scene');
            scene.get('viewControllers').removeObject(child);
            child.deleteRecord();
            child.save();
        }
        this.deleteRecord();
    },

    deleteFromVCController: function() {
        var parent = this.get('viewController');
        if(parent) {
            parent.get('uiPhoneControls').removeObject(this);
            parent.save();
        }
        this.deleteRecord();
        this.save();
    },

    toXml: function (xmlDoc) {
        var elem = xmlDoc.createElement('container');
        this.decorateXml(xmlDoc, elem);

        elem.setAttribute('childViewController', this.get('childViewController').getRefPath(''));

        return elem;
    },

    getRefPath: function (path) {
        return '//@' + this.get('xmlName') + '[id=\'' + this.get('id') + '\']' + path;
    }
});
