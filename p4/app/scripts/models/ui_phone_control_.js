App.UiPhoneControl = App.UiControl.extend({

    //Override
    /*--------------------------------------------------------------*/
    posY: DS.attr('number', {defaultValue: 96}),
    /*--------------------------------------------------------------*/

    viewController: DS.belongsTo('viewController'),
    parentContainer: DS.belongsTo('container', {inverse: 'uiPhoneControls'}),

    constraints: DS.hasMany('constraint', {inverse: 'uiPhoneControl'}),
    isWidthConstrained: DS.attr('boolean', {defaultValue: false}),
    isHeightConstrained: DS.attr('boolean', {defaultValue: false}),
    isRatioConstrained: DS.attr('boolean', {defaultValue: false}),
    ratioWidth: DS.attr('number', {defaultValue: 1}),
    ratioHeight: DS.attr('number', {defaultValue: 1}),

    widthCanBeConstrained: function() {
        if(this.get('isRatioConstrained')) {
            return false;
        } else {
            var xConstraintsNumber = 0;
            var constraints = this.get('constraints');
            constraints.forEach(function(constraint) {
                if(constraint.get('valid')) {
                    if(constraint.get('layoutEdge') === 'start' || constraint.get('layoutEdge') === 'end' || constraint.get('layoutEdge') === 'centerX') {
                        xConstraintsNumber++;
                    }
                }
            });
            if(xConstraintsNumber > 1) {
                return false;
            } else {
                return true;
            }
        }
    }.property(
        'constraints.@each.layoutEdge',
        'constraints.@each.valid',
        'isRatioConstrained'
    ),

    heightCanBeConstrained: function() {
        if(this.get('isRatioConstrained')) {
            return false;
        } else {
            var yConstraintsNumber = 0;
            var constraints = this.get('constraints');
            constraints.forEach(function(constraint) {
                if(constraint.get('valid')) {
                    if(constraint.get('layoutEdge') === 'top' || constraint.get('layoutEdge') === 'bottom' || constraint.get('layoutEdge') === 'centerY') {
                        yConstraintsNumber++;
                    }
                }
            });
            if(yConstraintsNumber > 1) {
                return false;
            } else {
                return true;
            }
        }
    }.property(
        'constraints.@each.layoutEdge',
        'constraints.@each.valid',
        'isRatioConstrained'
    ),

    ratioCanBeConstrained: function() {
        if(this.get('isRatioConstrained')) {
            return true;
        }
        if(!(this.get('widthCanBeConstrained')) && !(this.get('heightCanBeConstrained'))) {
            return false;
        } else {
            return  !(this.get('isWidthConstrained') || this.get('isHeightConstrained'));
        }
    }.property(
        'isRatioConstrained',
        'isWidthConstrained',
        'isHeightConstrained',
        'widthCanBeConstrained',
        'heightCanBeConstrained'
    ),

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
        var self = this;
        var result = -1000;
        var constraints = self.get('constraints').filter(function(c) {
            return c.get('valid') && ((!c.get('isDirty') || c.get('isSaving')));
        });
        // Look for constraints with top
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'top') {
                if(constraint.get('withParent') === false) {
                    result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) + constraint.get('value');
                } else {
                    // Case top with parentTop
                    if (self.get('parentContainer') !== null) {
                        result = constraint.get('value');
                    } else {
                        // Check tab bar for menu in Android
                        var isAndroid = self.get('viewController.application.smartphone.platform') === 'android';
                        var currentViewControllerIsMenu = false;
                        var viewControllerName = self.get('viewController.name');
                        var menuItems = self.get('viewController.application.menu.menuItems');
                        menuItems.forEach(function (menuItem, index) {
                            if (viewControllerName === menuItem.get('navigation.destination.name')) {
                                currentViewControllerIsMenu = true;
                            }
                        });
                        // Offset from tab bar for menu in Android
                        if (isAndroid && currentViewControllerIsMenu) {
                            result = self.get('viewController.application.smartphone.viewTop') + 48 + constraint.get('value');
                        } else {
                            result = self.get('viewController.application.smartphone.viewTop') + constraint.get('value');
                        }
                    }
                }
            }
        });

        if(result === -1000) {
            // Look for other y constraints with parent
            constraints.forEach(function (constraint) {
                if(constraint.get('withParent') === true) {
                    // Case bottom - parentBottom
                    if(constraint.get('referenceLayoutEdge') === 'bottom') {
                        if (self.get('parentContainer') !== null) {
                            result = self.get('bottom') - self.get('outerHeight');
                        } else {
                            result = self.get('bottom') - self.get('outerHeight');
                        }
                    } else if(constraint.get('referenceLayoutEdge') === 'centerY') {
                        // Case centerY - parentCenterY
                        if (self.get('parentContainer') !== null) {
                            result = (self.get('parentContainer.height') / 2) - (self.get('outerHeight') / 2) + constraint.get('value');
                        } else {
                            // Check tab bar for menu in Android
                            var isAndroid = self.get('viewController.application.smartphone.platform') === 'android';
                            var currentViewControllerIsMenu = false;
                            var viewControllerName = self.get('viewController.name');
                            var menuItems = self.get('viewController.application.menu.menuItems');
                            menuItems.forEach(function (menuItem, index) {
                                if (viewControllerName === menuItem.get('navigation.destination.name')) {
                                    currentViewControllerIsMenu = true;
                                }
                            });

                            if (isAndroid && currentViewControllerIsMenu) {
                                result = self.get('viewController.application.smartphone.viewTop') + 48 +
                                    ((self.get('viewController.application.smartphone.viewBottom') -
                                    self.get('viewController.application.smartphone.viewTop') - 48) / 2) -
                                    (self.get('outerHeight') / 2) + constraint.get('value');
                            } else {
                                result = self.get('viewController.application.smartphone.viewTop') +
                                    ((self.get('viewController.application.smartphone.viewBottom') -
                                    self.get('viewController.application.smartphone.viewTop')) / 2) -
                                    (self.get('outerHeight') / 2) + constraint.get('value');
                            }
                        }
                    }
                }
            });

            if(result === -1000) {
                // Look for other y constraints with other uiPhoneControls
                constraints.forEach(function (constraint) {
                    if(constraint.get('withParent') === false) {
                        if(constraint.get('layoutEdge') === 'bottom') {
                            result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                                constraint.get('value') - self.get('outerHeight');
                        } else if(constraint.get('layoutEdge') === 'centerY') {
                            result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                                constraint.get('value') - (self.get('outerHeight') / 2);
                        }
                    }
                });
            }
        }

        // Base case: there aren't y constraints
        if(result != -1000) {
            return result;
        } else {
            if (self.get('parentContainer') !== null) {
                return parseFloat(self.get('posY'));
            } else {
                // Offset of top bar
                return parseFloat(self.get('posY')) + self.get('viewController.application.smartphone.viewTop');
            }
        }
    }.property(
        'constraints.@each.isDirty',
        'posY',
        'outerHeight',
        'constraints.@each.layoutEdge',
        'constraints.@each.withParent',
        'constraints.@each.referenceElement',
        'constraints.@each.referenceLayoutEdge',
        'constraints.@each.value',
        'constraints.@each.valid',
        'viewController.application.smartphone.viewTop',
        'viewController.application.smartphone.viewBottom',
        'viewController.application.smartphone.platform',
        'viewController.application.menu.menuItems',
        'viewController.name',
        'bottom',
        'parentContainer',
        'parentContainer.height'),

    bottom: function () {
        var self = this;
        var result = -1000;
        var constraints = self.get('constraints').filter(function(c) {
            return c.get('valid') && ((!c.get('isDirty') || c.get('isSaving')));
        });
        // look for a constraint with bottom
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'bottom') {
                if(constraint.get('withParent') === false) {
                    result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) + constraint.get('value');
                } else {
                    // Case bottom - parentBottom
                    if (self.get('parentContainer') !== null) {
                        result = self.get('parentContainer.height') + constraint.get('value');
                    } else {
                        // Check tab bar for menu in iOS
                        var isIOS = self.get('viewController.application.smartphone.platform') === 'ios';
                        var currentViewControllerIsMenu = false;
                        var viewControllerName = self.get('viewController.name');
                        var menuItems = self.get('viewController.application.menu.menuItems');
                        menuItems.forEach(function (menuItem, index) {
                            if (viewControllerName === menuItem.get('navigation.destination.name')) {
                                currentViewControllerIsMenu = true;
                            }
                        });
                        // Offset from tab bar for menu in iOS
                        if (isIOS && currentViewControllerIsMenu) {
                            result = self.get('viewController.application.smartphone.viewBottom') - 48 + constraint.get('value');
                        } else {
                            result = self.get('viewController.application.smartphone.viewBottom') + constraint.get('value');
                        }
                    }
                }
            }
        });

        if(result === -1000) {
            //Look for another y constraint with parentContainer
            constraints.forEach(function (constraint) {
                if(constraint.get('withParent') === true) {
                    // Case top - parentTop
                    if(constraint.get('referenceLayoutEdge') === 'top') {
                        if (self.get('parentContainer') !== null) {
                            result = self.get('top') + self.get('outerHeight');
                        } else {
                            result = self.get('top') + self.get('outerHeight');
                        }
                    } else if(constraint.get('referenceLayoutEdge') === 'centerY') {
                        // Case centerY - parentCenterY
                        if (self.get('parentContainer') !== null) {
                            result = (self.get('parentContainer.height') / 2) + (self.get('outerHeight') / 2) + constraint.get('value');
                        } else {
                            // Check tab bar for menu in iOS
                            var isIOS = self.get('viewController.application.smartphone.platform') === 'ios';
                            var currentViewControllerIsMenu = false;
                            var viewControllerName = self.get('viewController.name');
                            var menuItems = self.get('viewController.application.menu.menuItems');
                            menuItems.forEach(function (menuItem, index) {
                                if (viewControllerName === menuItem.get('navigation.destination.name')) {
                                    currentViewControllerIsMenu = true;
                                }
                            });
                            // Offset from tab bar for menu in iOS
                            if (isIOS && currentViewControllerIsMenu) {
                                result = self.get('viewController.application.smartphone.viewBottom') - 48 -
                                    ((self.get('viewController.application.smartphone.viewBottom') -
                                    self.get('viewController.application.smartphone.viewTop' - 48)) / 2) +
                                    (self.get('outerHeight') / 2) + constraint.get('value');
                            }
                            result = self.get('viewController.application.smartphone.viewBottom') -
                                ((self.get('viewController.application.smartphone.viewBottom') -
                                self.get('viewController.application.smartphone.viewTop')) / 2) +
                                (self.get('outerHeight') / 2) + constraint.get('value');
                        }
                    }
                }
            });

            if(result === -1000) {
                // Look for other y constraints with other uiPhoneControls
                constraints.forEach(function (constraint) {
                    if(constraint.get('withParent') === false) {
                        if(constraint.get('layoutEdge') === 'top') {
                            result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                                constraint.get('value') + self.get('outerHeight');
                        } else if(constraint.get('layoutEdge') === 'centerY') {
                            result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                                constraint.get('value') + (self.get('outerHeight') / 2);
                        }
                    }
                });
            }
        }

        // Base case: no y constraints
        if(result != -1000) {
            return result;
        } else {
            return self.get('top') + parseFloat(self.get('outerHeight'));
        }
    }.property(
        'constraints.@each.isDirty',
        'constraints.@each.layoutEdge',
        'constraints.@each.withParent',
        'constraints.@each.referenceElement',
        'constraints.@each.referenceLayoutEdge',
        'constraints.@each.value',
        'constraints.@each.valid',
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
        var self = this;
        var result = -1000;
        var constraints = self.get('constraints').filter(function(c) {
            return c.get('valid') && ((!c.get('isDirty') || c.get('isSaving')));
        });
        // look for a constraint with start
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'start') {
                if(constraint.get('withParent') === false) {
                    result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) + constraint.get('value');
                } else {
                    // Case start - parentStart
                    result = constraint.get('value');
                }
            }
        });

        if(result === -1000) {
            // look for another x constraint with parent
            constraints.forEach(function (constraint) {
                if(constraint.get('withParent') === true) {
                    // Case end - parentEnd
                    if(constraint.get('referenceLayoutEdge') === 'end') {
                        result = self.get('end') - self.get('outerWidth');
                    } else if(constraint.get('referenceLayoutEdge') === 'centerX') {
                        // Case centerX - parentCenterX
                        if(self.get('parentContainer') !== null) {
                            result = (self.get('parentContainer.width') / 2) - (self.get('outerWidth') / 2) + constraint.get('value');
                        } else {
                            result = (self.get('viewController.application.smartphone.screenWidth') / 2) - (self.get('outerWidth') / 2) + constraint.get('value');
                        }
                    }
                }
            });

            if(result === -1000) {
                // look for another x constraint with other uiPhoneControls
                constraints.forEach(function (constraint) {
                    if(constraint.get('withParent') === false) {
                        if(constraint.get('layoutEdge') === 'end') {
                            result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                                constraint.get('value') - self.get('outerWidth');
                        } else if(constraint.get('layoutEdge') === 'centerX') {
                            result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                                constraint.get('value') - (self.get('outerWidth') / 2);
                        }
                    }
                });
            }
        }

        if(result != -1000) {
            return result;
        } else {
            return parseFloat(self.get('posX'));
        }
    }.property(
        'constraints.@each.isDirty',
        'constraints.@each.layoutEdge',
        'constraints.@each.withParent',
        'constraints.@each.referenceElement',
        'constraints.@each.referenceLayoutEdge',
        'constraints.@each.value',
        'constraints.@each.valid',
        'posX',
        'outerWidth',
        'parentContainer',
        'parentContainer.width',
        'end',
        'viewController.application.smartphone.screenWidth'),

    end: function () {
        var self = this;
        var result = -1000;
        var constraints = self.get('constraints').filter(function(c) {
            return c.get('valid') && ((!c.get('isDirty') || c.get('isSaving')));
        });
        // look for a constraint with end
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'end') {
                if(constraint.get('withParent') === false) {
                    result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) + constraint.get('value');
                } else {
                    // Case end - parentEnd
                    if (self.get('parentContainer') !== null) {
                        result = self.get('parentContainer.width') + constraint.get('value');
                    } else {
                        result = self.get('viewController.application.smartphone.screenWidth') + constraint.get('value');
                    }
                }
            }
        });

        if(result === -1000) {
            // look for another x constraint with parent
            constraints.forEach(function (constraint) {
                if(constraint.get('withParent') === true) {
                    // Case end - parentEnd
                    if(constraint.get('referenceLayoutEdge') === 'start') {
                        result = self.get('start') + self.get('outerWidth');
                    } else if(constraint.get('referenceLayoutEdge') === 'centerX') {
                        // Case centerX - parentCenterX
                        if(self.get('parentContainer') !== null) {
                            result = (self.get('parentContainer.width') / 2) + (self.get('outerWidth') / 2) + constraint.get('value');
                        } else {
                            result = (self.get('viewController.application.smartphone.screenWidth') / 2) + (self.get('outerWidth') / 2) + constraint.get('value');
                        }
                    }
                }
            });

            if(result === -1000) {
                // look for another x constraint with other uiPhoneControls
                constraints.forEach(function (constraint) {
                    if(constraint.get('withParent') === false) {
                        if(constraint.get('layoutEdge') === 'start') {
                            result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                                constraint.get('value') + self.get('outerWidth');
                        } else if(constraint.get('layoutEdge') === 'centerX') {
                            result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                                constraint.get('value') + (self.get('outerWidth') / 2);
                        }
                    }
                });
            }
        }

        if(result != -1000) {
            return result;
        } else {
            return self.get('start') + parseFloat(self.get('outerWidth'));
        }
    }.property(
        'constraints.@each.isDirty',
        'constraints.@each.layoutEdge',
        'constraints.@each.withParent',
        'constraints.@each.referenceElement',
        'constraints.@each.referenceLayoutEdge',
        'constraints.@each.value',
        'constraints.@each.valid',
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

    ratioObserverWidth: function() {
        if(this.get('isRatioConstrained')) {
            var ratio = this.get('ratioHeight') / this.get('ratioWidth');
            this.set('height', this.get('width') * ratio);
        }
    }.observes('width', 'ratioWidth', 'ratioHeight'),

    ratioObserverHeight: function() {
        if(this.get('isRatioConstrained')) {
            var ratio = this.get('ratioWidth') / this.get('ratioHeight');
            this.set('width', this.get('height') * ratio);
        }
    }.observes('height'),

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

        var myConstraints = this.get('constraints');
        myConstraints.forEach(function (constraint) {
            constraint.deleteRecord();
            constraint.save();
        });

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

        var constraints = this.get('constraints').filter(function(c) {
            return c.get('valid');
        });
        if(constraints.get('length') > 0 || this.get('isWidthConstrained') || this.get('isHeightConstrained') || this.get('isRatioConstrained')) {
            var elem = xmlDoc.createElement('constraints');
            elem.setAttribute('constrainedWidth', this.get('isWidthConstrained'));
            elem.setAttribute('constrainedHeight', this.get('isHeightConstrained'));
            elem.setAttribute('constrainedRatio', this.get('isRatioConstrained'));
            if(this.get('isRatioConstrained')) {
                elem.setAttribute('ratio', this.get('ratioWidth') + ':' + this.get('ratioHeight'));
            }
            xmlElem.appendChild(elem);

            constraints.forEach(function(constraint) {
                elem.appendChild(constraint.toXml(xmlDoc));
            });
        }

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
