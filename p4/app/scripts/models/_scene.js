App.Scene = DS.Model.extend({
    application: DS.belongsTo('application', {inverse: 'scenes'}),
    parentVCSmartphone: DS.belongsTo('viewController'),
    parentVCTablet: DS.belongsTo('viewController'),

    name: DS.attr('string'),
    launcher: DS.attr('boolean', {defaultValue: false}),
    hasMenu: DS.attr('boolean', {defaultValue: false}),
    smartphoneHasTabMenu: DS.attr('boolean', {defaultValue: true}),
    tabletHasTabMenu: DS.attr('boolean', {defaultValue: true}),

    xmlName: 'scene',

    viewControllers: function() {
        if(this.get('parentVCSmartphone')) {
            var vcs = [];
            this.get('parentVCSmartphone.containers').forEach(function(c) {
                if(!vcs.contains(c.get('childViewController'))) {
                    vcs.addObject(c.get('childViewController'));
                }
            });
            return vcs;
        }
        return [];
    }.property(
        'parentVCSmartphone',
        'parentVCSmartphone.containers.[]'
    ),

    valid: function() {
        if(this.get('viewControllers.length') === 0) {
            return false;
        }
        return true;
    }.property('viewControllers.length'),

    activeParentVC: function() {
        if(this.get('application.device.type') === 'smartphone') {
            return this.get('parentVCSmartphone');
        } else {
            return this.get('parentVCTablet');
        }
    }.property('application.device.type', 'parentVCSmartphone', 'parentVCTablet'),

    smartphoneMustShowTabMenu: function() {
        if((this.get('viewControllers.length') > 1) && this.get('smartphoneHasTabMenu')) {
            return true;
        }
        return false;
    }.property(
        'viewControllers.length',
        'smartphoneHasTabMenu'
    ),

    tabletMustShowTabMenu: function() {
        if((this.get('viewControllers.length') > 1) && this.get('tabletHasTabMenu')) {
            return true;
        }
        return false;
    }.property(
        'viewControllers.length',
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

    didCreate: function() {
        var self = this;
        this.store.createRecord('viewController', {
            application: self.get('application'),
            name: 'parentVCSmartphone',
            isParent: true
        }).save().then(function(vc) {
            self.set('parentVCSmartphone', vc);
            self.save();
        });
        this.store.createRecord('viewController', {
            application: self.get('application'),
            name: 'parentVCTablet',
            isParent: true
        }).save().then(function(vc) {
            self.set('parentVCTablet', vc);
            self.save();
        });
    },

    toXml: function (xmlDoc) {
        var scene = xmlDoc.createElement(this.get('xmlName'));
        scene.setAttribute('type', this.get('type'));
        scene.setAttribute('id', this.get('id'));
        scene.setAttribute('name', this.get('name'));
        scene.setAttribute('launcher', this.get('launcher'));
        scene.setAttribute('hasMenu', this.get('hasMenu'));
        scene.setAttribute('smartphoneHasTabMenu', this.get('smartphoneHasTabMenu'));
        scene.setAttribute('tabletHasTabMenu', this.get('tabletHasTabMenu'));
        if(!this.get('smartphoneHasTabMenu')) {
            scene.appendChild(this.get('parentVCSmartphone').toXml(xmlDoc));
        }
        if(!this.get('tabletHasTabMenu')) {
            scene.appendChild(this.get('parentVCTablet').toXml(xmlDoc));
        }
        this.get('viewControllers').forEach(function(vc) {
            var vcInfo = xmlDoc.createElement('viewController');
            vcInfo.setAttribute('id', vc.getRefPath(''));
            scene.appendChild(vcInfo);
        });

        return scene;
    }
});
