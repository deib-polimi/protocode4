App.UiPhoneControl = App.UiControl.extend({

    //Override
    /*--------------------------------------------------------------*/
    posY: DS.attr('number', {defaultValue: 96}),
    /*--------------------------------------------------------------*/

    viewController: DS.belongsTo('viewController'),
    parentContainer: DS.belongsTo('container', {inverse: 'uiPhoneControls'}),

    constraints: DS.hasMany('constraint', {inverse: 'uiPhoneControl', async: true}),

    sameLevelControls: function () {
        var parentContainer = this.get('parentContainer');

        if (parentContainer !== null) {
            return parentContainer.get('uiPhoneControls');
        }

        return this.get('viewController.uiPhoneControls');
    }.property(
        'parentContainer.uiPhoneControls.@each',
        'viewController.uiPhoneControls.@each'),

    siblings: function () {
        if (this.get('sameLevelControls') !== null) {
            return this.get('sameLevelControls').without(this);
        }

        return null;
    }.property('sameLevelControls'),

    top: function () {
        var constraints = this.get('constraints');
        // Look for constraints with top
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'top') {
                if(constraint.get('withParent') === false) {
                    return constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) + constraint.get('value');
                } else {
                    // Case top with parentTop
                    if (this.get('parentContainer') !== null) {
                        return constraint.get('value');
                    } else {
                        // Check tab bar for menu in Android
                        var isAndroid = this.get('viewController.application.smartphone.platform') === 'android';
                        var currentViewControllerIsMenu = false;
                        var viewControllerName = this.get('viewController.name');
                        var menuItems = this.get('viewController.application.menu.menuItems');
                        menuItems.forEach(function (menuItem, index) {
                            if (viewControllerName === menuItem.get('navigation.destination.name')) {
                                currentViewControllerIsMenu = true;
                            }
                        });
                        // Offset from tab bar for menu in Android
                        if (isAndroid && currentViewControllerIsMenu) {
                            return this.get('viewController.application.smartphone.viewTop') + 48 + constraint.get('value');
                        }
                        return this.get('viewController.application.smartphone.viewTop') + constraint.get('value');
                    }
                }
            }
        });

        // Look for other y constraints with parent
        constraints.forEach(function (constraint) {
            if(constraint.get('withParent') === true) {
                // Case bottom - parentBottom
                if(constraint.get('referenceLayoutEdge') === 'bottom') {
                    if (this.get('parentContainer') !== null) {
                        return this.get('bottom') - this.get('outerHeight');
                    } else {
                        return this.get('bottom') - this.get('outerHeight');
                    }
                } else {
                    // Case centerY - parentCenterY
                    if (this.get('parentContainer') !== null) {
                        return (this.get('parentContainer.height') / 2) - (this.get('outerHeight') / 2) + constraint.get('value');
                    } else {
                        // Check tab bar for menu in Android
                        var isAndroid = this.get('viewController.application.smartphone.platform') === 'android';
                        var currentViewControllerIsMenu = false;
                        var viewControllerName = this.get('viewController.name');
                        var menuItems = this.get('viewController.application.menu.menuItems');
                        menuItems.forEach(function (menuItem, index) {
                            if (viewControllerName === menuItem.get('navigation.destination.name')) {
                                currentViewControllerIsMenu = true;
                            }
                        });

                        if (isAndroid && currentViewControllerIsMenu) {
                            return this.get('viewController.application.smartphone.viewTop') + 48 +
                                ((this.get('viewController.application.smartphone.viewBottom') -
                                this.get('viewController.application.smartphone.viewTop') - 48) / 2) -
                                (this.get('outerHeight') / 2) + constraint.get('value');
                        } else {
                            return this.get('viewController.application.smartphone.viewTop') +
                                ((this.get('viewController.application.smartphone.viewBottom') -
                                this.get('viewController.application.smartphone.viewTop')) / 2) -
                                (this.get('outerHeight') / 2) + constraint.get('value');
                        }
                    }
                }
            }
        });

        // Look for other y constraints with other uiPhoneControls
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'bottom') {
                return constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                    constraint.get('value') - this.get('outerHeight');
            } else if(constraint.get('layoutEdge') === 'centerY') {
                return constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                    constraint.get('value') - (this.get('outerHeight') / 2);
            }
        });

        // Base case: there aren't y constraints
        if (this.get('parentContainer') !== null) {
            return parseFloat(this.get('posY'));
        } else {
            // Offset of top bar
            return parseFloat(this.get('posY')) + this.get('viewController.application.smartphone.viewTop');
        }
    }.property(
        'posY',
        'outerHeight',
        'constraints.layoutEdge',
        'constraints.withParent',
        'constraints.referenceElement',
        'constraints.referenceLayoutEdge',
        'constraints.value',
        'viewController.application.smartphone.viewTop',
        'viewController.application.smartphone.viewBottom',
        'viewController.application.smartphone.platform',
        'viewController.application.menu.menuItems',
        'viewController.name',
        'bottom',
        'parentContainer',
        'parentContainer.height'),

    bottom: function () {
        var constraints = this.get('constraints');
        // look for a constraint with bottom
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'bottom') {
                if(constraint.get('withParent') === false) {
                    return constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) + constraint.get('value');
                } else {
                    // Case bottom - parentBottom
                    if (this.get('parentContainer') !== null) {
                        return this.get('parentContainer.height') + constraint.get('value');
                    } else {
                        // Check tab bar for menu in iOS
                        var isIOS = this.get('viewController.application.smartphone.platform') === 'ios';
                        var currentViewControllerIsMenu = false;
                        var viewControllerName = this.get('viewController.name');
                        var menuItems = this.get('viewController.application.menu.menuItems');
                        menuItems.forEach(function (menuItem, index) {
                            if (viewControllerName === menuItem.get('navigation.destination.name')) {
                                currentViewControllerIsMenu = true;
                            }
                        });
                        // Offset from tab bar for menu in iOS
                        if (isIOS && currentViewControllerIsMenu) {
                            return this.get('viewController.application.smartphone.viewBottom') - 48 + constraint.get('value');
                        }
                        return this.get('viewController.application.smartphone.viewBottom') + constraint.get('value');
                    }
                }
            }
        });

        //Look for another y constraint with parentContainer
        constraints.forEach(function (constraint) {
            if(constraint.get('withParent') === true) {
                // Case top - parentTop
                if(constraint.get('referenceLayoutEdge') === 'top') {
                    if (this.get('parentContainer') !== null) {
                        return this.get('top') + this.get('outerHeight');
                    } else {
                        return this.get('top') + this.get('outerHeight');
                    }
                } else {
                    // Case centerY - parentCenterY
                    if (this.get('parentContainer') !== null) {
                        return (this.get('parentContainer.height') / 2) + (this.get('outerHeight') / 2) + constraint.get('value');
                    } else {
                        // Check tab bar for menu in iOS
                        var isIOS = this.get('viewController.application.smartphone.platform') === 'ios';
                        var currentViewControllerIsMenu = false;
                        var viewControllerName = this.get('viewController.name');
                        var menuItems = this.get('viewController.application.menu.menuItems');
                        menuItems.forEach(function (menuItem, index) {
                            if (viewControllerName === menuItem.get('navigation.destination.name')) {
                                currentViewControllerIsMenu = true;
                            }
                        });
                        // Offset from tab bar for menu in iOS
                        if (isIOS && currentViewControllerIsMenu) {
                            return this.get('viewController.application.smartphone.viewBottom') - 48 -
                                ((this.get('viewController.application.smartphone.viewBottom') -
                                this.get('viewController.application.smartphone.viewTop' - 48)) / 2) + constraint.get('value');
                        }
                        return this.get('viewController.application.smartphone.viewBottom') -
                            ((this.get('viewController.application.smartphone.viewBottom') -
                            this.get('viewController.application.smartphone.viewTop')) / 2) + constraint.get('value');
                    }
                }
            }
        });

        // Look for other y constraints with other uiPhoneControls
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'top') {
                return constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                    constraint.get('value') + this.get('outerHeight');
            } else if(constraint.get('layoutEdge') === 'centerY') {
                return constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                    constraint.get('value') + (this.get('outerHeight') / 2);
            }
        });

        // Base case: no y constraints
        return this.get('top') + parseFloat(this.get('outerHeight'));
    }.property(
        'constraints.layoutEdge',
        'constraints.withParent',
        'constraints.referenceElement',
        'constraints.referenceLayoutEdge',
        'constraints.value',
        'top',
        'outerHeight',
        'viewController.name',
        'viewController.application.smartphone.platform',
        'viewController.application.menu.menuItems',
        'viewController.application.smartphone.viewBottom',
        'viewController.application.smartphone.viewTop',
        'parentContainer',
        'parentContainer.height'
    ),

    start: function () {
        var constraints = this.get('constraints');
        // look for a constraint with start
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'start') {
                if(constraint.get('withParent') === false) {
                    return constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) + constraint.get('value');
                } else {
                    // Case start - parentStart
                    return constraint.get('value');
                }
            }
        });

        // look for another x constraint with parent
        constraints.forEach(function (constraint) {
            if(constraint.get('withParent') === true) {
                // Case end - parentEnd
                if(constraint.get('referenceLayoutEdge') === 'end') {
                    return this.get('end') - this.get('outerWidth');
                } else if(constraint.get('referenceLayoutEdge') === 'centerX') {
                    // Case centerX - parentCenterX
                    if(this.get('parentContainer') !== null) {
                        return (this.get('parentContainer.width') / 2) - (this.get('outerWidth') / 2) + constraint.get('value');
                    } else {
                        return (this.get('viewController.application.smartphone.screenWidth') / 2) + constraint.get('value');
                    }
                }
            }
        });

        // look for another x constraint with other uiPhoneControls
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'end') {
                return constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                    constraint.get('value') - this.get('outerWidth');
            } else if(constraint.get('layoutEdge') === 'centerX') {
                return constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                    constraint.get('value') - (this.get('outerWidth') / 2);
            }
        });

        return parseFloat(this.get('posX'));
    }.property(
        'constraints.layoutEdge',
        'constraints.withParent',
        'constraints.referenceElement',
        'constraints.referenceLayoutEdge',
        'constraints.value',
        'posX',
        'outerWidth',
        'parentContainer',
        'parentContainer.width',
        'end',
        'viewController.application.smartphone.screenWidth'),

    end: function () {
        var constraints = this.get('constraints');
        // look for a constraint with end
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'end') {
                if(constraint.get('withParent') === false) {
                    return constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) + constraint.get('value');
                } else {
                    // Case end - parentEnd
                    return this.get('parentContainer.width') + constraint.get('value');
                }
            }
        });

        // look for another x constraint with parent
        constraints.forEach(function (constraint) {
            if(constraint.get('withParent') === true) {
                // Case end - parentEnd
                if(constraint.get('referenceLayoutEdge') === 'start') {
                    return this.get('start') + this.get('outerWidth');
                } else if(constraint.get('referenceLayoutEdge') === 'centerX') {
                    // Case centerX - parentCenterX
                    if(this.get('parentContainer') !== null) {
                        return (this.get('parentContainer.width') / 2) - (this.get('outerWidth') / 2) + constraint.get('value');
                    } else {
                        return (this.get('viewController.application.smartphone.screenWidth') / 2) + constraint.get('value');
                    }
                }
            }
        });

        // look for another x constraint with other uiPhoneControls
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'start') {
                return constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                    constraint.get('value') + this.get('outerWidth');
            } else if(constraint.get('layoutEdge') === 'centerX') {
                return constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                    constraint.get('value') + (this.get('outerWidth') / 2);
            }
        });

        return this.get('start') + parseFloat(this.get('outerWidth'));
    }.property(
        'constraints.layoutEdge',
        'constraints.withParent',
        'constraints.referenceElement',
        'constraints.referenceLayoutEdge',
        'constraints.value',
        'start',
        'parentContainer',
        'parentContainer.width',
        'outerWidth',
        'viewController.application.smartphone.screenWidth'),

    computedWidth: function () {
        return parseFloat(this.get('end')) -
            parseFloat(this.get('start')) -
            parseFloat(this.get('marginStart')) -
            parseFloat(this.get('marginEnd'));
    }.property(
        'start',
        'end',
        'marginStart',
        'paddingStart',
        'paddingEnd',
        'marginEnd'),

    computedHeight: function () {
        return parseFloat(this.get('bottom')) -
            parseFloat(this.get('top')) -
            parseFloat(this.get('marginTop')) -
            parseFloat(this.get('marginBottom'));
    }.property(
        'top',
        'bottom',
        'marginTop',
        'paddingTop',
        'paddingBottom',
        'marginBottom'),

    outerWidth: function () {
        return parseFloat(this.get('marginStart')) +
            parseFloat(this.get('width')) +
            parseFloat(this.get('marginEnd'));
    }.property(
        'marginStart',
        'paddingStart',
        'width',
        'paddingEnd',
        'marginEnd'),

    outerHeight: function () {
        return parseFloat(this.get('marginTop')) +
            parseFloat(this.get('height')) +
            parseFloat(this.get('marginBottom'));
    }.property(
        'marginTop',
        'paddingTop',
        'height',
        'paddingBottom',
        'marginBottom'),

    // Used to reload views
    didCreate: function () {
        this.set('name', this.get('id').replace(/[0-9]/g, '') + this.constructor.toString().split(".")[1]);

        var self = this;
        if (this.get('parentContainer')) {
            var uiPhoneControls = this.get('parentContainer.uiPhoneControls');
            uiPhoneControls.pushObject(self);
            this.get('parentContainer').save();
        }
        else {
            var viewController = this.get('viewController');
            viewController.get('uiPhoneControls').then(function (uiPhoneControls) {
                uiPhoneControls.pushObject(self);
                viewController.save();
            });

            this.save();

        }
    },

    deleteRecord: function () {
        var viewController = this.get('viewController');
        var self = this;

        if (viewController) {
            viewController.get('uiPhoneControls').then(function (uiPhoneControls) {
                uiPhoneControls.forEach(function (uiPhoneControl) {
                    var constraints = uiPhoneControl.get('constraints');
                    constraints.forEach(function (constraint) {
                        if (constraint.get('referenceElement') === self) {
                            Ember.run.once(self, function () {
                                constraint.deleteRecord();
                                constraint.save();
                            });
                        }
                    });
                });
            });
        }

        this._super();
    },

    decorateXml: function (xmlDoc, xmlElem) {
        xmlElem.setAttribute('id', this.get('name'));

        xmlElem.setAttribute('posX', this.get('posX'));
        xmlElem.setAttribute('posY', this.get('posY'));

        xmlElem.setAttribute('width', this.get('width'));
        xmlElem.setAttribute('height', this.get('height'));

        xmlElem.setAttribute('paddingTop', this.get('paddingTop'));
        xmlElem.setAttribute('paddingBottom', this.get('paddingBottom'));
        xmlElem.setAttribute('paddingStart', this.get('paddingStart'));
        xmlElem.setAttribute('paddingEnd', this.get('paddingEnd'));

        xmlElem.setAttribute('marginTop', this.get('marginTop'));
        xmlElem.setAttribute('marginBottom', this.get('marginBottom'));
        xmlElem.setAttribute('marginStart', this.get('marginStart'));
        xmlElem.setAttribute('marginEnd', this.get('marginEnd'));

        var elem = xmlDoc.createElement('constraints');
        xmlElem.appendChild(elem);
        var constraints = this.get('constraints');
        constraints.forEach(function(constraint) {
            elem.appendChild(constraint.toXml(xmlDoc));
        });

        if (this.get('viewController')) {
            xmlElem.setAttribute('viewController', this.get('viewController').getRefPath(''));
        }

        return xmlElem;
    },

    getRefPath: function (path) {
        var updatedPath = '/@' + this.get('xmlName') + '[id=\'' + this.get('name') + '\']';

        if (this.get('parentContainer') !== null) {
            updatedPath = this.get('parentContainer').getRefPath(updatedPath);
        }
        else {
            updatedPath = this.get('viewController').getRefPath(updatedPath);
        }

        return updatedPath;
    },

    getRelatedUiPhoneControls: function () {
        /*var viewController = this.get('viewController');
        var self = this;

        if (viewController) {
            viewController.get('uiPhoneControls').then(function (uiPhoneControls) {
                uiPhoneControls.forEach(function (uiPhoneControl) {
                    var constraints = uiPhoneControl.get('constraints');
                    constraints.forEach(function (constraint) {
                        if (constraint.get('referenceElement') === self) {
                            Ember.run.once(self, function () {
                                constraint.deleteRecord();
                                constraint.save();
                            });
                        }
                    });
                });
            });
        }




        return constraints.map(function (constraint) {
            return self.get(constraint);
        }).filter(function (item) {
            return item !== null;
        });*/

    }

});
