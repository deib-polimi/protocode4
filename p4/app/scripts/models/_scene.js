App.Scene = DS.Model.extend({
    application: DS.belongsTo('application', {inverse: 'scenes'}),
    viewControllers: DS.hasMany('viewController', {inverse: 'scene'}),
    parentViewController: DS.belongsTo('viewController'),

    name: DS.attr('string'),
    launcher: DS.attr('boolean', {defaultValue: false}),
    hasMenu: DS.attr('boolean', {defaultValue: false}),
    type: DS.attr('string'),
    smartphoneHasTabMenu: DS.attr('boolean', {defaultValue: true}),
    tabletHasTabMenu: DS.attr('boolean', {defaultValue: true}),

    xmlName: 'scene',

    valid: function() {
        /*  viewControllers.length < 3 means that scene has parentVC and another VC
            this is not enough for a multiVC scene which must have at least 2 childVCs (excluded the parentVC) */
        if((this.get('type') === 'multiVC') && (this.get('viewControllers.length') < 3)) {
            return false;
        }
        return true;
    }.property('type', 'viewControllers.length'),

    childViewControllers: function() {
        return this.get('viewControllers').without(this.get('parentViewController'));
    }.property('parentViewController', 'viewControllers.[]'),

    smartphoneMustShowTabMenu: function() {
        if((this.get('type') === 'multiVC') && this.get('smartphoneHasTabMenu')) {
            return true;
        }
        return false;
    }.property(
        'type',
        'smartphoneHasTabMenu'
    ),

    tabletMustShowTabMenu: function() {
        if((this.get('type') === 'multiVC') && this.get('tabletHasTabMenu')) {
            return true;
        }
        return false;
    }.property(
        'type',
        'tabletHasTabMenu'
    ),

    isTabbed: function() {
        if(this.get('application.device.type') === 'smartphone') {
            return this.get('smartphoneHasTabMenu');
        } else {
            return this.get('tabletHasTabMenu');
        }
    }.property(
        'application.device.type',
        'smartphoneHasTabMenu',
        'tabletHasTabMenu'
    ),

    referenceName: function() {
        return this.get('xmlName') + '/' + this.get('id');
    }.property('id', 'xmlName'),

    launcherObserver: function() {
        if(!this.get('isDeleted') && this.get('launcher') && !this.get('hasMenu')) {
            this.set('hasMenu', true);
            this.save();
        }
    }.observes('launcher'),

    typeObserver: function() {
        if(!this.get('isDeleted') && this.get('parentViewController')) {
            // Case multiVC --> singleVC
            if(this.get('type') === 'singleVC') {
                this.set('parentViewController.name', 'viewController');
                var controls = this.get('parentViewController.uiPhoneControls');
                var containers = controls.filter(function(upc) {
                    return upc.constructor.toString() === 'App.Container';
                });
                containers.forEach(function(cont) {
                    controls.removeObject(cont);
                    cont.deleteFromScene();
                    cont.save();
                });
                this.get('parentViewController').save();
            } else {
                // Case singleVC --> multiVC
                this.set('parentViewController.name', 'parentVC');
                this.get('parentViewController').save();
            }
            this.save();
        }
    }.observes('type'),

    didCreate: function() {
        var self = this;
        var viewController = this.store.createRecord('viewController', {
            scene: this,
            parentContainer: null,
            name: 'viewController'
        }).save().then(function(vc) {
            self.set('parentViewController', vc);
            self.save();
        });
    },

    deleteRecord: function() {
        var parent = this.get('parentViewController');
        if(parent) {
            parent.deleteRecord();
            parent.save();
        }

        this._super();
    },

    toXml: function (xmlDoc) {
        var scene = xmlDoc.createElement(this.get('xmlName'));
        scene.setAttribute('id', this.get('id'));
        scene.setAttribute('type', this.get('type'));
        scene.setAttribute('name', this.get('name'));
        scene.setAttribute('launcher', this.get('launcher'));
        scene.setAttribute('hasMenu', this.get('hasMenu'));
        /*
            singleVC:   no smartphoneHasTabMenu
                        no tabletHasTabMenu
                        no parentViewController
            multiVC:    smartphoneHasTabMenu
                        tabletHasTabMenu
                        if !smartphoneHasTabMenu or !tabletHasTabMenu
                            parentViewController
        */
        if(this.get('type') === 'singleVC') {
            // end scene attributes - begin view controllers xmlns
            scene.appendChild(this.get('parentViewController').toXml(xmlDoc));
        } else {
            scene.setAttribute('smartphoneHasTabMenu', this.get('smartphoneHasTabMenu'));
            scene.setAttribute('tabletHasTabMenu', this.get('tabletHasTabMenu'));
            if(this.get('smartphoneHasTabMenu') && this.get('tabletHasTabMenu')) {
                // end scene attributes - begin view controllers xmlns
                this.get('childViewControllers').map(function (vc) {
                    return scene.appendChild(vc.toXml(xmlDoc));
                });
            } else {
                scene.setAttribute('parentViewController', this.get('parentViewController').getRefPath(''));
                // end scene attributes - begin view controllers xmlns
                this.get('viewControllers').map(function (vc) {
                    return scene.appendChild(vc.toXml(xmlDoc));
                });
            }
        }

        return scene;
    }
});
