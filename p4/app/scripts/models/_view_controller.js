App.ViewController = DS.Model.extend({
    name: DS.attr('string'),
    backgroundColor: DS.attr('string', {defaultValue: ''}),
    backgroundImage: DS.attr('string', {defaultValue: ''}),

    scene: DS.belongsTo('scene', {inverse: 'viewControllers'}),
    parentContainer: DS.belongsTo('container', {inverse: 'childViewController'}),
    //parentContainerSmartphone: DS.belongsTo('container', {inverse: 'childVCSmartphone'}),
    //parentContainerTablet: DS.belongsTo('container', {inverse: 'childVCTablet'}),

    uiPhoneControls: DS.hasMany('uiPhoneControl', {inverse: 'viewController', polymorphic: true}),
    controlChains: DS.hasMany('controlChain', {inverse: 'viewController'}),
    alertDialogs: DS.hasMany('alertDialog', {inverse: 'viewController'}),
    progressDialogs: DS.hasMany('progressDialog', {inverse: 'viewController'}),
    asyncTasks: DS.hasMany('asyncTask', {inverse: 'viewController'}),

    xmlName: 'viewController',

    isParent: function() {
        return this === this.get('scene.parentViewController');
    }.property('scene.parentViewController'),

    /*isParent: function() {
        return (this === this.get('scene.parentViewControllerSmartphone')) ||
            (this === this.get('scene.parentViewControllerTablet'));
    }.property(
        'scene.parentViewControllerSmartphone',
        'scene.parentViewControllerTablet'
    ),*/

    uiPhoneControlsToShow: function() {
        if(this.get('scene.isTabbed')) {
            return this.get('uiPhoneControls').filter(function(upc) {
                return upc.constructor.toString() !== 'App.Container';
            });
        }
        return this.get('uiPhoneControls');
    }.property(
        'scene.isTabbed',
        'uiPhoneControls.[]'
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

    // DELETE
    isInAContainer: function() {
        return (this.get('parentContainer') !== null) && (!this.get('scene.isTabbed'));
    }.property(
        'parentContainer',
        'scene.isTabbed'
    ),

    /*activeContainer: function() {
        if(this.get('scene.isTabbed')) {
            if(this.get('scene.application.device.type') === 'smartphone') {
                return this.get('parentContainerSmartphone');
            } else {
                return this.get('parentContainerTablet');
            }
        }
        return null;
    }.property(
        'scene.isTabbed',
        'scene.application.device.type',
        'parentContainerSmartphone',
        'parentContainerTablet'
    ),*/

    start: function() {
        /*activeContainer*/
        if(this.get('isInAContainer')) {
            return this.get('parentContainer.start');
        }
        return 0;
    }.property(
        'isInAContainer',
        'parentContainer.start'
    ),

    end: function() {
        /*activeContainer*/
        if(this.get('isInAContainer')) {
            return this.get('parentContainer.end');
        }
        return this.get('scene.application.device.screenWidth');
    }.property(
        'isInAContainer',
        'parentContainer.end',
        'scene.application.device.screenWidth'
    ),

    top: function() {
        /*activeContainer*/
        if(this.get('isInAContainer')) {
            return this.get('parentContainer.top');
        }
        if(this.get('scene.application.device.platform') === 'android') {
            var thereIsTabMenu = (this.get('scene.application.device.type') === 'smartphone') && this.get('scene.smartphoneMustShowTabMenu');
            thereIsTabMenu = thereIsTabMenu || ((this.get('scene.application.device.type') === 'tablet') && this.get('scene.tabletMustShowTabMenu'));
            if(thereIsTabMenu) {
                return this.get('scene.application.device.viewTop') + 48 - 1;
            }
        }
        return this.get('scene.application.device.viewTop') - 1;
    }.property(
        'isInAContainer',
        'parentContainer.top',
        'scene.application.device.type',
        'scene.smartphoneMustShowTabMenu',
        'scene.tabletMustShowTabMenu',
        'scene.application.device.platform',
        'scene.application.device.viewTop'
    ),

    bottom: function() {
        /*activeContainer*/
        if(this.get('isInAContainer')) {
            return this.get('parentContainer.bottom');
        }
        if(this.get('scene.application.device.platform') === 'ios') {
            var thereIsTabMenu = (this.get('scene.application.device.type') === 'smartphone') && this.get('scene.smartphoneMustShowTabMenu');
            thereIsTabMenu = thereIsTabMenu || ((this.get('scene.application.device.type') === 'tablet') && this.get('scene.tabletMustShowTabMenu'));
            if(thereIsTabMenu) {
                return this.get('scene.application.device.viewBottom') - 48;
            }
        }
        return this.get('scene.application.device.viewBottom');
    }.property(
        'isInAContainer',
        'parentContainer.bottom',
        'scene.application.device.type',
        'scene.smartphoneMustShowTabMenu',
        'scene.tabletMustShowTabMenu',
        'scene.application.device.platform',
        'scene.application.device.viewBottom'
    ),

    width: function() {
        /*activeContainer*/
        if(this.get('isInAContainer')) {
            return this.get('parentContainer.width');
        }
        return this.get('end') - this.get('start');
    }.property(
        'isInAContainer',
        'parentContainer.width',
        'start',
        'end'
    ),

    height: function() {
        /*activeContainer*/
        if(this.get('isInAContainer')) {
            return this.get('parentContainer.height');
        }
        return this.get('bottom') - this.get('top');
    }.property(
        'isInAContainer',
        'parentContainer.height',
        'top',
        'bottom'
    ),

    centerX: function() {
        /*activeContainer*/
        if(this.get('isInAContainer')) {
            return this.get('parentContainer.centerX');
        }
        return (this.get('start') + (this.get('width') / 2));
    }.property(
        'isInAContainer',
        'parentContainer.centerX',
        'start',
        'width'
    ),

    centerY: function() {
        /*activeContainer*/
        if(this.get('isInAContainer')) {
            return this.get('parentContainer.centerY');
        }
        return (this.get('top') + (this.get('height') / 2));
    }.property(
        'isInAContainer',
        'parentContainer.centerY',
        'top',
        'height'
    ),

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
        if(this.get('scene.application.device.type') === 'smartphone') {
            if(this.get('scene.hasMenu')) {
                if(this.get('scene.smartphoneHasTabMenu')) {
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
        } else {
            if(this.get('scene.hasMenu')) {
                if(this.get('scene.tabletHasTabMenu')) {
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
    }.property(
        'scene.application.device.type',
        'scene.smartphoneHasTabMenu',
        'scene.tabletHasTabMenu',
        'scene.hasMenu'
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
                if(uiPhoneControl.constructor.toString() !== 'App.Container') {
                    Ember.run.once(self, function () {
                        uiPhoneControl.deleteRecord();
                        uiPhoneControl.save();
                    });
                } else {
                    Ember.run.once(self, function () {
                        uiPhoneControl.deleteFromApp();
                        uiPhoneControl.save();
                    });
                }
            }
        });

        this.get('controlChains').forEach(function (chain) {
            Ember.run.once(self, function () {
                chain.delete();
                chain.save();
            });
        });

        var linkedModels = ['alertDialogs', 'progressDialogs', 'asyncTasks'];

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
        if(this.get('parentContainer')) {
            viewController.setAttribute('parentContainer', this.get('parentContainer').getRefPath(''));
        }
        /*if(this.get('parentContainerSmartphone')) {
            viewController.setAttribute('parentContainerSmartphone', this.get('parentContainerSmartphone').getRefPath(''));
        }
        if(this.get('parentContainerTablet')) {
            viewController.setAttribute('parentContainerTablet', this.get('parentContainerTablet').getRefPath(''));
        }*/
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

        this.get('uiPhoneControls').filter(function(control) {
            return control.get('valid');
        }).map(function (uiPhoneControl) {
            viewController.appendChild(uiPhoneControl.toXml(xmlDoc));
        });

        return viewController;
    },

    getRefPath: function (path) {
        return '//@' + this.get('xmlName') + '[id=\'' + this.get('id') + '\']' + path;
    }

});
