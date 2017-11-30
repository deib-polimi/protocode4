/*
 templates/view_controller.hbs
 */
App.ViewControllerController = Ember.ObjectController.extend({
    needs: ['uiPhoneControlTemplates', 'editor'],
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
        if(this.get('scene.viewControllers')) {
            if(this.get('currentDeviceIsSmartphone') || !this.get('scene.varyForTablets')) {
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
        } else {
            return null;
        }
    }.property(
        'currentDeviceIsSmartphone',
        'scene.viewControllers.@each.name',
        'scene.sceneScreens.@each.name',
        'scene.varyForTablets'
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

    mustShowTabMenu: function() {
        if(this.get('scene.hasTabMenu')) {
            if(this.get('device.type') === 'smartphone' || !this.get('scene.varyForTablets')) {
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
        }
        return false;
    }.property(
        'scene.hasTabMenu',
        'device.type',
        'scene.varyForTablets',
        'scene.viewControllers.length',
        'scene.screensNumber'
    ),

    // BEGIN REPORTS

    getReportText: function() {
        var self = this;
        return new Promise(function (resolve) {
            var report = "<b>REPORT</b> scene <aid>" + self.get('scene.id') + '-' + self.get('scene.name') + "</aid>:<br>";
            report = report + self.getReportTextPosition();
            self.getReportTextReachability().then(function(reach) {
                report = report + reach;
                report = report + self.getReportTextInvalids();
                resolve(report);
            });
        });
    },

    getReportTextPosition: function() {
        var report = "<br>POSITION<br>";
        var xConstrained, yConstrained;
        this.get('scene.viewControllers').forEach(function(vc) {
            vc.get('uiPhoneControls').forEach(function(uic) {
                xConstrained = false;
                yConstrained = false;
                if(!uic.get('controlChain') || uic.get('controlChain.valid')) {
                    uic.get('constraints').forEach(function(c) {
                        if(c.get('layoutEdge') === 'start' || c.get('layoutEdge') === 'end' || c.get('layoutEdge') === 'centerX') {
                            xConstrained = true;
                        }
                        if(c.get('layoutEdge') === 'top' || c.get('layoutEdge') === 'bottom' || c.get('layoutEdge') === 'centerY') {
                            yConstrained = true;
                        }
                    });
                    if(uic.get('controlChain')) {
                        if(uic.get('controlChain.axis') === 'horizontal') {
                            xConstrained = true;
                        } else {
                            yConstrained = true;
                        }
                    }
                    if(!xConstrained || !yConstrained) {
                        if(!xConstrained) {
                            report = report + "- Control <aid>" + uic.get('name') + "</aid> miss an <ax>X</ax>-constraint.<br>";
                        }
                        if(!yConstrained) {
                            report = report + "- Control <aid>" + uic.get('name') + "</aid> miss an <ay>Y</ay>-constraint.<br>";
                        }
                    } else {
                        report = report + "- Control <aid>" + uic.get('name') + "</aid> is well <aok>positioned</aok>.<br>";
                    }
                }
            });
        });
        return report;
    },

    getReportTextReachability: function() {
        var self = this;
        return new Promise(function (resolve) {
            self.store.find('navigation').then(function(navigations) {
                var report = "<br>REACHABILITY<br>";
                var reachable;
                // Scene
                if(self.get('scene.launcher')) {
                    reachable = true;
                } else {
                    reachable = false;
                    navigations.forEach(function(nav) {
                        if(nav.get('destination') === ('scene/' + self.get('scene.id'))) {
                            reachable = true;
                        }
                    });
                }
                if(reachable) {
                    report = report + "- Scene is <aok>reachable</aok>.<br>";
                } else {
                    report = report + "- Scene is <aunr>unreachable</aunr>.<br>";
                }
                // View controllers
                self.get('scene.viewControllers').forEach(function(vc, index) {
                    reachable = false;
                    if(index === 0) {
                        reachable = true;
                    } else if(vc.get('scene.hasTabMenu')) {
                        reachable = true;
                    } else {
                        navigations.forEach(function(nav) {
                            if(nav.get('destination') === ('viewController/' + vc.get('id'))) {
                                reachable = true;
                            }
                        });
                    }
                    if(reachable) {
                        report = report + "- View Controller <aid>" + vc.get('id') + '-' + vc.get('name') + "</aid> is <aok>reachable</aok>.<br>";
                    } else {
                        report = report + "- View Controller <aid>" + vc.get('id') + '-' + vc.get('name') + "</aid> is <aunr>unreachable</aunr>.<br>";
                    }
                });
                resolve(report);
            });
        });
    },

    getReportTextInvalids: function() {
        var report = "<br>INVALID objects (not exported in the model)<br>";
        var n;
        report = report + "- Control Chains:<br>";
        n = 0;
        this.get('scene.viewControllers').forEach(function(vc) {
            vc.get('controlChains').forEach(function(c) {
                if(!c.get('valid')) {
                    n++;
                    report = report + "&nbsp&nbsp&nbsp&nbsp+ Chain <aid>" + c.get('id') + "</aid> of VC <aid>" + vc.get('id') + '-' + vc.get('name') + "</aid> is <ainv>not valid</ainv>.<br>";
                    report = report + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp So, also the chain's controls aren't valid:<br>";
                    c.get('uiPhoneControls').forEach(function(uic) {
                        report = report + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp- <ainv>" + uic.get('name') + "</ainv><br>";
                    });
                }
            });
        });
        if(n === 0) {
            report = report + "&nbsp&nbsp&nbsp&nbsp all <aok>rights</aok>.<br>";
        }
        n = 0;
        report = report + "- Constraints:<br>";
        this.get('scene.viewControllers').forEach(function(vc) {
            vc.get('uiPhoneControls').forEach(function(uic) {
                uic.get('constraints').forEach(function(c) {
                    if(!c.get('valid')) {
                        n++;
                        report = report + "&nbsp&nbsp&nbsp+ Constraint <aid>" + c.get('id') + "</aid> of control <aid>" + uic.get('name') + "</aid> is <ainv>not valid</ainv>.<br>";
                    }
                });
            });
        });
        if(n === 0) {
            report = report + "&nbsp&nbsp&nbsp&nbsp all <aok>rights</aok>.<br>";
        }
        return report;
    },

    // END REPORTS

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
