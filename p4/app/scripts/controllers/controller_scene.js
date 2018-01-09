/*
 templates/scene.hbs
 */
App.SceneController = Ember.ObjectController.extend({
    needs: ['editor'],
    isActive: false,
    zoomLevel: 1,
    isRotated: false,
    viewControllerToShow: null,
    isScene: true,

    menu: Ember.computed.alias('controllers.editor.menu'),
    device: Ember.computed.alias('controllers.editor.device'),

    modelObserver: function () {
        var path = this.get('target.location.lastSetURL');
        if(!path) {
            path = this.get('target.url');
        }
        if(this.get('model') && path) {
            var splittedPath = path.split('/');
            var selectedType = splittedPath[splittedPath.get('length') - 2];
            var selectedId = splittedPath[splittedPath.get('length') - 1];
            if(this.get('model.isTabbed')) {
                if(selectedType === 'scene') {
                    this.set('viewControllerToShow', null);
                } else {
                    var viewController = this.get('model.viewControllers').find(function(vc) {return vc.get('id') === selectedId});
                    if(viewController) {
                        this.set('viewControllerToShow', viewController);
                    }
                }
            } else {
                if(selectedType === 'scene') {
                    this.set('viewControllerToShow', null);
                } else {
                    this.set('viewControllerToShow', this.get('model.activeParentVC'));
                }
            }
        }
    }.observes('model', 'model.isTabbed', 'target.location.lastSetURL'),

    /*  Redirection in case user switch from a device type to another (smartphone to tablet or
        tablet to smartphone) and the current route's view controller is a parent vc */
    redirectionObserver: function() {
        if(this.get('model') && !this.get('model.isDeleted')) {
            if(this.get('viewControllerToShow.isParent')) {
                this.transitionToRoute('scene', this.get('model'));
            }
        }
    }.observes('device.type'),

    deviceTypeObserver: function() {
        var scene = this.get('model');
        if(!scene.get('isDeleted')) {
            var parentVC = scene.get('activeParentVC');
            var containers = parentVC.get('containers');
            parentVC.set('activeScene', scene);
            scene.get('viewControllers').forEach(function(vc) {
                vc.set('activeScene', scene);
                if(!scene.get('isTabbed')) {
                    var activeContainer;
                    activeContainer = containers.find(function(c) {
                        return c.get('childViewController') === vc;
                    });
                    if(activeContainer) {
                        vc.set('activeContainer', activeContainer);
                    } else {
                        vc.set('activeContainer', null);
                    }
                } else {
                    vc.set('activeContainer', null);
                }
            });
        }
    }.observes('model.activeParentVC'),

    currentRouteIsViewController: function() {
        var path = this.get('target.location.lastSetURL');
        if(!path) {
            path = this.get('target.url');
        }
        if(path) {
            var splittedPath = path.split('/');
            return splittedPath[3] === 'viewController';
        }
        return false;
    }.property(
        'target.location.lastSetURL'
    ),

    hasMenu: function () {
        return this.get('menu.menuItems.length') > 0;
    }.property('menu.menuItems.@each'),

    currentDeviceIsSmartphone: function() {
        return this.get('device.type') === 'smartphone';
    }.property('device.type'),

    tabMenuItems: function() {
        if(this.get('model.viewControllers')) {
            return this.get('model.viewControllers').without(this.get('model.parentViewController')).map(function(vc) {
                return vc.get('name');
            });
        } else {
            return null;
        }
    }.property(
        'model.viewControllers',
        'model.viewControllers.@each.name'
    ),

    // BEGIN REPORTS

    getReportText: function() {
        var self = this;
        var tab = "&nbsp&nbsp&nbsp&nbsp&nbsp";
        var sep = "_______________________________________________________";
        return new Promise(function (resolve) {
            var report = "<b>REPORT</b> scene <aid>" + self.get('model.id') + '-' + self.get('model.name') + "</aid>:<br>";
            // Check model and viewControllers because during transition it may become null
            if(self.get('model') && self.get('model.viewControllers')) {
                self.getReportTextReachability(tab).then(function(reach) {
                    report = report + reach + sep + "<br><br>VIEW CONTROLLERS<br><br>";
                    sep = tab + ".........................................................................................";
                    // Check model  and viewControllers because during transition it may become null
                    if(self.get('model') && self.get('model.viewControllers')) {
                        self.get('model.viewControllers').forEach(function(vc) {
                            report = report + tab + "View Controller <aid>" + vc.get('id') + '-' + vc.get('name') + "</aid>:<br>";
                            report = report + self.getReportTextPosition(tab, vc);
                            report = report + self.getReportTextInvalids(tab, vc);
                            report = report + sep + "<br><br>";
                        });
                    }
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
                if(self.get('model.launcher')) {
                    reachable = true;
                } else {
                    reachable = false;
                    navigations.forEach(function(nav) {
                        if(nav.get('destination') === ('scene/' + self.get('model.id'))) {
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
                self.get('model.viewControllers').forEach(function(vc, index) {
                    reachable = false;
                    if(index === 0) {
                        reachable = true;
                    } else if(self.get('model.smartphoneHasTabMenu') || self.get('model.tabletHasTabMenu')) {
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
        vc.get('uiPhoneControlsToShow').forEach(function(uic) {
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
        if(vc.get('uiPhoneControlsToShow.length') === 0) {
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
        vc.get('uiPhoneControlsToShow').forEach(function(uic) {
            uic.get('constraints').forEach(function(c) {
                nConstraints++;
                if(!c.get('valid')) {
                    nInvalids++;
                    report = report + tab + tab + tab + "Constraint <aid>" + c.get('id') + "</aid> of <aid>" + uic.get('name') + "</aid> is <ainv>not valid</ainv>.<br>";
                }
            });
        });
        if(vc.get('uiPhoneControlsToShow.length') === 0) {
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
            if(this.get('model.varyForTablets') && this.get('isRotated')) {
                this.set('isRotated', false);
            }
        }
    }.observes('isRotated', 'device'),

    zoomLevelObserver: function() {
        if(!this.get('isDeleted')) {
            if(this.get('device.name') === 'iPhoneX') {
                this.set('zoomLevel', 0.6);
            } else if(this.get('device.name') === 'iPhone7Plus') {
                this.set('zoomLevel', 0.6);
            } else if(this.get('device.name') === 'iPhone7') {
                this.set('zoomLevel', 0.6);
            } else if(this.get('device.name') === 'iPhone6Plus') {
                this.set('zoomLevel', 0.6);
            } else if(this.get('device.name') === 'iPhone6') {
                this.set('zoomLevel', 0.6);
            } else if(this.get('device.name') === 'iPhone5') {
                this.set('zoomLevel', 0.7);
            } else if(this.get('device.name') === 'iPad12_9') {
                this.set('zoomLevel', 0.5);
            } else if(this.get('device.name') === 'iPad9_7') {
                this.set('zoomLevel', 0.6);
            } else if(this.get('device.name') === 'GooglePixel') {
                this.set('zoomLevel', 0.6);
            } else if(this.get('device.name') === 'Nexus6P') {
                this.set('zoomLevel', 0.6);
            } else if(this.get('device.name') === 'Nexus5') {
                this.set('zoomLevel', 0.8);
            } else if(this.get('device.name') === 'Nexus7') {
                this.set('zoomLevel', 0.8);
            } else if(this.get('device.name') === 'Nexus9') {
                this.set('zoomLevel', 0.7);
            } else if(this.get('device.name') === 'Nexus10') {
                this.set('zoomLevel', 0.6);
            }
        }
    }.observes('device.name'),

    actions: {
        transitionToRoute: function(route, model) {
            this.transitionToRoute(route, model);
        }
    }

});
