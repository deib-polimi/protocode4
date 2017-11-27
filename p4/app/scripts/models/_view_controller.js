App.ViewController = DS.Model.extend({
    name: DS.attr('string'),
    backgroundColor: DS.attr('string', {defaultValue: ''}),
    backgroundImage: DS.attr('string', {defaultValue: ''}),

    scene: DS.belongsTo('scene', {inverse: 'viewControllers'}),
    sceneScreen: DS.belongsTo('sceneScreen', {inverse: 'viewControllers'}),
    widthPercentInScreen: DS.attr('number', {defaultValue: 0.35}),
    /*nameInScreen: DS.attr('string'),*/

    uiPhoneControls: DS.hasMany('uiPhoneControl', {polymorphic: true}),
    controlChains: DS.hasMany('controlChain', {inverse: 'viewController'}),
    alertDialogs: DS.hasMany('alertDialog', {inverse: 'viewController'}),
    progressDialogs: DS.hasMany('progressDialog', {inverse: 'viewController'}),
    asyncTasks: DS.hasMany('asyncTask', {inverse: 'viewController'}),

    xmlName: 'viewController',

    hasTabMenu: function() {
        if(this.get('scene.application.device.type') === 'smartphone') {
            if(this.get('scene.viewControllers.length') > 1) {
                return true;
            } else {
                return false;
            }
        } else {
            if(this.get('scene.screensNumber') > 1) {
                return true;
            } else {
                return false;
            }
        }
    }.property(
        'scene.application.device.platform',
        'scene.viewControllers.length',
        'scene.screensNumber'
    ),

    maxWidthPercentInScreen: function() {
        if(this.get('sceneScreen')) {
            return this.get('sceneScreen').getMaxWidthPercentInScreen(this);
        }
        return -1;
    }.property(
        'widthPercentInScreen',
        'sceneScreen',
        'sceneScreen.viewControllers.@each.widthPercentInScreen'
    ),

    horizontalMinimumSpace: function() {
        var minimumSpace = 0;
        this.get('controlChains').forEach(function(chain) {
            if(chain.get('axis') === 'horizontal') {
                var space = chain.getHorizontalSpaceForControls();
                if(space > minimumSpace) {
                    minimumSpace = space;
                }
            }
        });
        /*this.get('uiPhoneControls').then(function(controls) {
            controls.forEach(function(control) {

            });
        });*/
        return minimumSpace;
    }.property(
        'controlChains.@each',
        'uiPhoneControls.@each'
    ),

    startInScreen: function() {
        if(this.get('scene.application.device.type') === 'smartphone') {
            return 0;
        } else {
            if(this.get('sceneScreen')) {
                return this.get('sceneScreen').getPrecedentEnd(this);
            } else {
                return 0;
            }
        }
    }.property(
        'sceneScreen',
        'sceneScreen.viewControllers.@each.widthPercentInScreen',
        'scene.application.device.type'
    ),

    endInScreen: function() {
        return this.get('startInScreen') + this.get('width');
    }.property(
        'width',
        'startInScreen'
    ),

    width: function() {
        var width = this.get('scene.application.device.screenWidth');
        if(this.get('scene.application.device.type') === 'smartphone') {
            return width;
        } else {
            if(this.get('sceneScreen')) {
                return width * parseFloat(this.get('widthPercentInScreen'));
            } else {
                return width;
            }
        }
    }.property(
        'sceneScreen',
        'widthPercentInScreen',
        'scene.application.device.type',
        'scene.application.device.screenWidth'
    ),

    isInAScreen: function() {
        if(this.get('sceneScreen')) {
            return true;
        }
        return false;
    }.property('sceneScreen'),

    getWidthFromPercent: function(widthPercent) {
        var result = this.get('scene.application.device.screenWidth') * widthPercent;
        if(this.get('scene.application.device.type') === 'smartphone') {
            return result;
        } else {
            if(this.get('sceneScreen')) {
                return parseFloat(this.get('widthPercentInScreen')) * result;
            } else {
                return result;
            }
        }
    },

    deleteRecord: function () {
        var self = this;

        this.get('uiPhoneControls').forEach(function (uiPhoneControl) {
            Ember.run.once(self, function () {
                uiPhoneControl.deleteRecord();
                uiPhoneControl.save();
            });
        });

        this.get('controlChains').forEach(function (chain) {
            Ember.run.once(self, function () {
                chain.deleteRecord();
                chain.save();
            });
        });

        var linkedModels = ['alertDialogs', 'progressDialogs', 'asyncTasks'];

        var self = this;

        linkedModels.forEach(function (linkedModel) {
            self.get(linkedModel).forEach(function (uiPhoneControl) {
                Ember.run.once(self, function () {
                    uiPhoneControl.deleteRecord();
                    uiPhoneControl.save();
                });
            });
        });

        this._super();
    },

    toXml: function (xmlDoc) {
        var viewController = xmlDoc.createElement(this.get('xmlName'));
        viewController.setAttribute('name', this.get('name'));
        viewController.setAttribute('backgroundColor', this.get('backgroundColor'));
        viewController.setAttribute('backgroundImage', this.get('backgroundImage'));

        this.get('alertDialogs').map(function (alertDialog) {
            viewController.appendChild(alertDialog.toXml(xmlDoc));
        });

        this.get('progressDialogs').map(function (progressDialog) {
            viewController.appendChild(progressDialog.toXml(xmlDoc));
        });

        this.get('asyncTasks').map(function (asyncTask) {
            viewController.appendChild(asyncTask.toXml(xmlDoc));
        });

        this.get('controlChains').filter(function(chain) {
            return chain.get('valid');
        }).map(function (controlChain) {
            viewController.appendChild(controlChain.toXml(xmlDoc));
        });

        this.get('uiPhoneControls').filter(function(c) {
            if(c.get('controlChain') === null) {
                return true;
            } else {
                return c.get('controlChain.valid');
            }
        }).map(function (uiPhoneControl) {
            viewController.appendChild(uiPhoneControl.toXml(xmlDoc));
        });

        return viewController;
    },

    getRefPath: function (path) {
        return '//@' + this.get('xmlName') + '[name=\'' + this.get('name') + '\']' + path;
    }

});
