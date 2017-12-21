App.ViewController = DS.Model.extend({
    name: DS.attr('string'),
    backgroundColor: DS.attr('string', {defaultValue: '#ffffff'}),
    backgroundImage: DS.attr('string', {defaultValue: ''}),
    isParent: DS.attr('boolean', {defaultValue: false}),

    application: DS.belongsTo('application', {inverse: 'viewControllers'}),

    uiPhoneControls: DS.hasMany('uiPhoneControl', {inverse: 'viewController', polymorphic: true}),
    controlChains: DS.hasMany('controlChain', {inverse: 'viewController'}),
    alertDialogs: DS.hasMany('alertDialog', {inverse: 'viewController'}),
    progressDialogs: DS.hasMany('progressDialog', {inverse: 'viewController'}),
    asyncTasks: DS.hasMany('asyncTask', {inverse: 'viewController'}),

    activeScene: null,
    activeContainer: null,
    xmlName: 'viewController',

    uiPhoneControlsToShow: function() {
        if(this.get('activeScene') && this.get('activeScene.isTabbed')) {
            return this.get('uiPhoneControls').filter(function(upc) {
                return upc.constructor.toString() !== 'App.Container';
            });
        }
        return this.get('uiPhoneControls');
    }.property(
        'activeScene',
        'activeScene.isTabbed',
        'uiPhoneControls.[]'
    ),

    containers: function() {
        return this.get('uiPhoneControls').filter(function(upc) {
            return upc.constructor.toString() === 'App.Container';
        });
    }.property(
        'uiPhoneControls.[]'
    ),

    /*horizontalMinimumSpace: function() {
        var minimumSpace = 0;
        this.get('controlChains').forEach(function(chain) {
            if(chain.get('axis') === 'horizontal') {
                var space = chain.getHorizontalSpaceForControls();
                if(space > minimumSpace) {
                    minimumSpace = space;
                }
            }
        });
        this.get('uiPhoneControls').then(function(controls) {
            controls.forEach(function(control) {

            });
        });
        return minimumSpace;
    }.property(
        'controlChains.@each',
        'uiPhoneControls.@each'
    ),*/

    start: function() {
        if(this.get('activeContainer')) {
            return this.get('activeContainer.start');
        }
        return 0;
    }.property(
        'activeContainer',
        'activeContainer.start'
    ),

    end: function() {
        if(this.get('activeContainer')) {
            return this.get('activeContainer.end');
        }
        return this.get('application.device.screenWidth');
    }.property(
        'activeContainer',
        'activeContainer.end',
        'application.device.screenWidth'
    ),

    top: function() {
        if(this.get('activeContainer')) {
            return this.get('activeContainer.top');
        }
        if(this.get('activeScene')) {
            if(this.get('application.device.platform') === 'android') {
                var thereIsTabMenu = (this.get('application.device.type') === 'smartphone') && this.get('activeScene.smartphoneMustShowTabMenu');
                thereIsTabMenu = thereIsTabMenu || ((this.get('application.device.type') === 'tablet') && this.get('activeScene.tabletMustShowTabMenu'));
                if(thereIsTabMenu) {
                    return this.get('application.device.viewTop') + 48 - 1;
                }
            }
        }
        return this.get('application.device.viewTop') - 1;
    }.property(
        'activeContainer',
        'activeContainer.top',
        'application.device.type',
        'activeScene',
        'activeScene.smartphoneMustShowTabMenu',
        'activeScene.tabletMustShowTabMenu',
        'application.device.platform',
        'application.device.viewTop'
    ),

    bottom: function() {
        if(this.get('activeContainer')) {
            return this.get('activeContainer.bottom');
        }
        if(this.get('activeScene')) {
            if(this.get('application.device.platform') === 'ios') {
                var thereIsTabMenu = (this.get('application.device.type') === 'smartphone') && this.get('activeScene.smartphoneMustShowTabMenu');
                thereIsTabMenu = thereIsTabMenu || ((this.get('application.device.type') === 'tablet') && this.get('activeScene.tabletMustShowTabMenu'));
                if(thereIsTabMenu) {
                    return this.get('application.device.viewBottom') - 48;
                }
            }
        }
        return this.get('application.device.viewBottom');
    }.property(
        'activeContainer',
        'activeContainer.bottom',
        'application.device.type',
        'activeScene',
        'activeScene.smartphoneMustShowTabMenu',
        'activeScene.tabletMustShowTabMenu',
        'application.device.platform',
        'application.device.viewBottom'
    ),

    width: function() {
        if(this.get('activeContainer')) {
            return this.get('activeContainer.width');
        }
        return this.get('end') - this.get('start');
    }.property(
        'activeContainer',
        'activeContainer.width',
        'start',
        'end'
    ),

    height: function() {
        if(this.get('activeContainer')) {
            return this.get('activeContainer.height');
        }
        return this.get('bottom') - this.get('top');
    }.property(
        'activeContainer',
        'activeContainer.height',
        'top',
        'bottom'
    ),

    centerX: function() {
        if(this.get('activeContainer')) {
            return this.get('activeContainer.centerX');
        }
        return (this.get('start') + (this.get('width') / 2));
    }.property(
        'activeContainer',
        'activeContainer.centerX',
        'start',
        'width'
    ),

    centerY: function() {
        if(this.get('activeContainer')) {
            return this.get('activeContainer.centerY');
        }
        return (this.get('top') + (this.get('height') / 2));
    }.property(
        'activeContainer',
        'activeContainer.centerY',
        'top',
        'height'
    ),

    /* NAVIGATION for smartphones and tablet with no screen
        activeScene has:
            Case 1: menu YES, tab menu YES
            all VCs have menu button

            Case 2: menu YES, tab menu NO
            - first VC has menu button
            - other VCs have back button (to the first VC)

            Case 3: menu NO, tab menu YES
            all VCs have back button to the precedent activeScene

            Case 4: menu NO, tab menu NO
            all VCs have back button but:
            - first VC go back to precedent activeScene
            - others VCs go back to first VC
    */
    hasBackButton: function() {
        if(this.get('activeScene')) {
            if(this.get('application.device.type') === 'smartphone') {
                if(this.get('activeScene.hasMenu')) {
                    if(this.get('activeScene.smartphoneHasTabMenu')) {
                        // Case 1
                        return false;
                    } else {
                        // Case 2
                        if(this.get('activeScene.viewControllers').indexOf(this) === 0) {
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
                if(this.get('activeScene.hasMenu')) {
                    if(this.get('activeScene.tabletHasTabMenu')) {
                        // Case 1
                        return false;
                    } else {
                        // Case 2
                        if(this.get('activeScene.viewControllers').indexOf(this) === 0) {
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
        }
        return null;
    }.property(
        'application.device.type',
        'activeScene',
        'activeScene.smartphoneHasTabMenu',
        'activeScene.tabletHasTabMenu',
        'activeScene.hasMenu'
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
        /*if(this.get('hasBackButton')) {
            viewController.setAttribute('hasMenuButton', false);
            viewController.setAttribute('hasBackButton', true);
        } else {
            viewController.setAttribute('hasMenuButton', true);
            viewController.setAttribute('hasBackButton', false);
        }*/

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
