App.Scene = DS.Model.extend({
    application: DS.belongsTo('application', {inverse: 'scenes'}),
    viewControllers: DS.hasMany('viewController', {inverse: 'scene'}),
    sceneScreens: DS.hasMany('sceneScreen', {inverse: 'scene'}),

    name: DS.attr('string'),
    launcher: DS.attr('boolean', {defaultValue: false}),
    varyForTablets: DS.attr('boolean', {defaultValue: false}),
    hasMenu: DS.attr('boolean', {defaultValue: false}),
    hasTabMenu: DS.attr('boolean', {defaultValue: true}),

    xmlName: 'scene',

    screensNumber: function() {
        var n = 0;
        this.get('sceneScreens').forEach(function(sc) {
            if(sc.get('valid')) {
                n++;
            }
        });
        return n;
    }.property('sceneScreens.@each.valid'),

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
        var i, name, newScreen;
        for(i = 0; i < 4; i++) {
            name = 'screen' + (i+1);
            newScreen = this.store.createRecord('sceneScreen', {
                scene: this,
                name: name
            }).save().then(function(sc) {
                self.get('sceneScreens').addObject(sc);
            });
        }
        this.get('sceneScreens').save();
    },

    deleteRecord: function() {
        var self = this;

        var sceneScreens = this.get('sceneScreens');
        sceneScreens.forEach(function (s) {
            Ember.run.once(self, function () {
                s.deleteRecord();
                s.save();
            });
        });

        var viewControllers = this.get('viewControllers');
        viewControllers.forEach(function (vc) {
            Ember.run.once(self, function () {
                vc.deleteRecord();
                vc.save();
            });
        });

        this._super();
    },

    toXml: function (xmlDoc) {
        var scene = xmlDoc.createElement(this.get('xmlName'));
        scene.setAttribute('id', this.get('id'));
        scene.setAttribute('name', this.get('name'));
        scene.setAttribute('launcher', this.get('launcher'));
        scene.setAttribute('varyForTablets', this.get('varyForTablets'));
        scene.setAttribute('hasMenu', this.get('hasMenu'));
        scene.setAttribute('hasTabMenu', this.get('hasTabMenu'));

        var vcs = xmlDoc.createElement('viewControllers');
        scene.appendChild(vcs);

        this.get('viewControllers').map(function (vc) {
            return vcs.appendChild(vc.toXml(xmlDoc));
        });

        var screens = xmlDoc.createElement('screens');
        scene.appendChild(screens);
        this.get('sceneScreens').map(function (s) {
            if(s.get('viewControllers.length') > 0) {
                screens.appendChild(s.toXml(xmlDoc));
            }
        });

        return scene;
    }
});
