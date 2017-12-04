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

    start: function() {
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

    end: function() {
        return this.get('start') + this.get('width');
    }.property(
        'width',
        'start'
    ),

    top: function() {
        if(this.get('scene.mustShowTabMenu') && (this.get('scene.application.device.platform') === 'android')) {
            return (this.get('scene.application.device.viewTop') + 48);
        }
        return this.get('scene.application.device.viewTop');
    }.property(
        'scene.application.device.viewTop',
        'scene.application.device.platform',
        'scene.mustShowTabMenu'
    ),

    bottom: function() {
        if(this.get('scene.mustShowTabMenu') && (this.get('scene.application.device.platform') === 'ios')) {
            return (this.get('scene.application.device.viewBottom') - 48);
        }
        return this.get('scene.application.device.viewBottom');
    }.property(
        'scene.application.device.viewBottom',
        'scene.application.device.platform',
        'scene.mustShowTabMenu'
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

    height: function() {
        return this.get('bottom') - this.get('top');
    }.property(
        'top',
        'bottom'
    ),

    centerX: function() {
        return (this.get('start') + (this.get('width') / 2));
    }.property(
        'start',
        'width'
    ),

    centerY: function() {
        return (this.get('top') + (this.get('height') / 2));
    }.property(
        'top',
        'height'
    ),

    isInAScreen: function() {
        if(this.get('sceneScreen')) {
            return true;
        }
        return false;
    }.property('sceneScreen'),

    /* NAVIGATION for smartphones and tablet with no screen
        Scene has:
            Case 1: menu YES, tab menu YES
            all VCs have menu button

            Case 2: menu YES, tab menu NO
            - first VC has menu button
            - other VCs have back button (to the first VC)

            Case 3: menu NO, tab menu YES
            all VCs have back button to the precedent scene

            Case 4: menu NO, tab menu NO
            all VCs have back button but:
            - first VC go back to precedent scene
            - others VCs go back to first VC
    */
    hasBackButton: function() {
        if(this.get('scene.application.device.type') === 'smartphone' || !this.get('scene.varyForTablets')) {
            if(this.get('scene.hasMenu')) {
                if(this.get('scene.hasTabMenu')) {
                    // Case 1
                    return false;
                } else {
                    // Case 2
                    if(this.get('scene.viewControllers').indexOf(this) === 0) {
                        return false;
                    } else {
                        return true;
                    }
                }
            } else {
                // Cases 3 and 4
                return true;
            }
        }
        return false;
    }.property(
        'scene.application.device.type',
        'scene.varyForTablets',
        'scene.hasMenu',
        'scene.hasTabMenu'
    ),

    referenceName: function() {
        return this.get('xmlName') + '/' + this.get('id');
    }.property('id', 'xmlName'),

    getWidthFromPercent: function(widthPercent) {
        return widthPercent * this.get('width');
    },

    getHeightFromPercent: function(heightPercent) {
        return heightPercent * this.get('height');
    },

    deleteRecord: function () {
        var self = this;

        // Delete uiPhoneControls not in control chains
        // The uiPhoneControls in chains will be deleted by the chains themselves
        this.get('uiPhoneControls').forEach(function (uiPhoneControl) {
            if(uiPhoneControl.get('controlChain') === null) {
                Ember.run.once(self, function () {
                    uiPhoneControl.deleteRecord();
                    uiPhoneControl.save();
                });
            }
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
        viewController.setAttribute('id', this.get('id'));
        viewController.setAttribute('name', this.get('name'));
        viewController.setAttribute('backgroundColor', this.get('backgroundColor'));
        viewController.setAttribute('backgroundImage', this.get('backgroundImage'));
        if(this.get('hasBackButton')) {
            viewController.setAttribute('hasMenuButton', false);
            viewController.setAttribute('hasBackButton', true);
        } else {
            viewController.setAttribute('hasMenuButton', true);
            viewController.setAttribute('hasBackButton', false);
        }

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
        return '//@' + this.get('xmlName') + '[id=\'' + this.get('id') + '\']' + path;
    }

});
