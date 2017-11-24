App.Scene = DS.Model.extend({
    application: DS.belongsTo('application', {inverse: 'scenes'}),
    viewControllers: DS.hasMany('viewController', {inverse: 'scene'}),
    sceneScreens: DS.hasMany('sceneScreen', {inverse: 'scene'}),

    name: DS.attr('string'),
    launcher: DS.attr('boolean', {defaultValue: false}),
    varyForTablets: DS.attr('boolean', {defaultValue: false}),

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
        var self = this;
        return new Promise(function (resolve) {
            var scene = xmlDoc.createElement(self.get('xmlName'));
            scene.setAttribute('name', self.get('name'));
            scene.setAttribute('launcher', self.get('launcher'));
            scene.setAttribute('varyForTablets', self.get('varyForTablets'));

            var vcs = xmlDoc.createElement('viewControllers');
            scene.appendChild(vcs);
            Promise.all(self.get('viewControllers').map(function (item_vcs) {
                return item_vcs.toXml(xmlDoc);
            })).then(function (values_vcs) {
                values_vcs.map(function (vc) {
                    vcs.appendChild(vc);
                });

                var screens = xmlDoc.createElement('screens');
                scene.appendChild(screens);
                self.get('sceneScreens').map(function (s) {
                    screens.appendChild(s.toXml(xmlDoc));
                });

                resolve(scene);
            });
        });
    }
});
