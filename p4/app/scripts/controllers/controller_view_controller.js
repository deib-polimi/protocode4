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
            if(this.get('model.scene.mustShowTabMenu')) {
                if(this.get('device.platform') === 'android') {
                    top = top + 48;
                }
                height = height - 48;
            }
            var vcs = this.get('model.sceneScreen.viewControllers');
            vcs.without(vcs.get('firstObject')).forEach(function(vc) {
                var style = "left:" + parseInt(vc.get('start')) +
                    "px;top:" + top + "px;height:" + height + "px;";
                result.pushObject(style);
            });

            return result;
        }
        return [];
    }.property(
        'model.sceneScreen',
        'model.sceneScreen.viewControllers.@each.start',
        'model.scene.mustShowTabMenu',
        'device.platform',
        'device.viewTop',
        'device.viewBottom'
    ),

    // BEGIN REPORTS

    getReportText: function() {
        var self = this;
        var tab = "&nbsp&nbsp&nbsp&nbsp&nbsp";
        var sep = "_______________________________________________________";
        return new Promise(function (resolve) {
            var report = "<b>REPORT</b> scene <aid>" + self.get('scene.id') + '-' + self.get('scene.name') + "</aid>:<br>";
            if(self.get('scene') && self.get('scene.viewControllers')) {
                self.getReportTextReachability(tab).then(function(reach) {
                    report = report + reach + sep + "<br><br>VIEW CONTROLLERS<br><br>";
                    sep = tab + ".........................................................................................";
                    self.get('scene.viewControllers').forEach(function(vc) {
                        report = report + tab + "View Controller <aid>" + vc.get('id') + '-' + vc.get('name') + "</aid>:<br>";
                        report = report + self.getReportTextPosition(tab, vc);
                        report = report + self.getReportTextInvalids(tab, vc);
                        report = report + sep + "<br><br>";
                    });
                    resolve(report);
                });
            } else {
                resolve(null);
            }
        });
    },

    getReportTextReachability: function(tab) {
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
                    report = report + tab + "Scene is <aok>reachable</aok>.<br>";
                } else {
                    report = report + tab + "Scene is <aunr>unreachable</aunr>.<br>";
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
                        report = report + tab + "View Controller <aid>" + vc.get('id') + '-' + vc.get('name') + "</aid> is <aok>reachable</aok>.<br>";
                    } else {
                        report = report + tab + "View Controller <aid>" + vc.get('id') + '-' + vc.get('name') + "</aid> is <aunr>unreachable</aunr>.<br>";
                    }
                });
                resolve(report);
            });
        });
    },

    getReportTextPosition: function(tab, vc) {
        var report = "<br>" + tab + tab + "POSITION<br>";
        var xConstrained, yConstrained;
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
                        report = report + tab + tab + "Control <aid>" + uic.get('name') + "</aid> <ainv>miss</ainv> an <ax>X-constraint</ax>.<br>";
                    }
                    if(!yConstrained) {
                        report = report + tab + tab + "Control <aid>" + uic.get('name') + "</aid> <ainv>miss</ainv> an <ay>Y-constraint</ay>.<br>";
                    }
                } else {
                    report = report + tab + tab + "Control <aid>" + uic.get('name') + "</aid> is well <aok>positioned</aok>.<br>";
                }
            }
        });
        if(vc.get('uiPhoneControls.length') === 0) {
            report = report + tab + tab + "No phone controls in this view controller.<br>";
        }
        return report;
    },

    getReportTextInvalids: function(tab, vc) {
        var report = "<br>" + tab + tab + "INVALID objects (not exported in the model)<br>";
        var nInvalids;
        report = report + tab + tab + "Control Chains:<br>";
        nInvalids = 0;
        vc.get('controlChains').forEach(function(c) {
            if(!c.get('valid')) {
                nInvalids++;
                report = report + tab + tab + tab + "Chain <aid>" + c.get('name') + "</aid> is <ainv>not valid</ainv>.<br>";
                report = report + tab + tab + tab + "So, also the chain's controls aren't valid:<br>";
                c.get('uiPhoneControls').forEach(function(uic) {
                    report = report + tab + tab + tab + "<ainv>" + uic.get('name') + "</ainv><br>";
                });
            }
        });
        if(vc.get('controlChains.length') === 0) {
            report = report + tab + tab + tab + "No control chains in this view controller.<br>";
        } else if(nInvalids === 0) {
            report = report + tab + tab + tab + "all <aok>right</aok>.<br>";
        }
        nInvalids = 0;
        var nConstraints = 0;
        report = report + tab + tab + "Constraints:<br>";
        vc.get('uiPhoneControls').forEach(function(uic) {
            uic.get('constraints').forEach(function(c) {
                nConstraints++;
                if(!c.get('valid')) {
                    nInvalids++;
                    report = report + tab + tab + tab + "Constraint <aid>" + c.get('id') + "</aid> of <aid>" + uic.get('name') + "</aid> is <ainv>not valid</ainv>.<br>";
                }
            });
        });
        if(vc.get('uiPhoneControls.length') === 0) {
            report = report + tab + tab + tab + "No phone controls in this view controller.<br>";
        } else if(nConstraints === 0) {
            report = report + tab + tab + tab + "No constraints in this view controller.<br>";
        } else if(nInvalids === 0) {
            report = report + tab + tab + tab + "all <aok>right</aok>.<br>";
        }
        return report;
    },

    // END REPORTS

    isRotatedObserver: function() {
        if(!this.get('isDeleted') && this.get('device.type') === 'tablet') {
            var mustUpdate = (this.get('scene.varyForTablets') && this.get('isRotated')) ||
                (this.get('isRotated') && !this.get('device.isDirty')) ||
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
            if(this.get('scene.varyForTablets') && this.get('isRotated')) {
                this.set('isRotated', false);
            }
        }
    }.observes('isRotated', 'device', 'scene.varyForTablets')

});
