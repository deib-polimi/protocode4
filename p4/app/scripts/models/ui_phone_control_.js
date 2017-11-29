App.UiPhoneControl = App.UiControl.extend({
    defaultWidth: 0,
    defaultHeight: 0,

    //Override
    /*--------------------------------------------------------------*/
    posY: DS.attr('number', {defaultValue: 96}),
    /*--------------------------------------------------------------*/

    viewController: DS.belongsTo('viewController'),
    parentContainer: DS.belongsTo('container', {inverse: 'uiPhoneControls'}),
    controlChain: DS.belongsTo('controlChain', {inverse: 'uiPhoneControls'}),
    valueInChain: DS.attr('number', {defaultValue: 1}),

    constraints: DS.hasMany('constraint', {inverse: 'uiPhoneControl'}),
    bindedControls: DS.hasMany('uiPhoneControl', {polymorphic: true}),
    isWidthConstrained: DS.attr('boolean', {defaultValue: false}),
    isHeightConstrained: DS.attr('boolean', {defaultValue: false}),
    isWidthPercentConstrained: DS.attr('boolean', {defaultValue: false}),
    isHeightPercentConstrained: DS.attr('boolean', {defaultValue: false}),
    widthPercent: DS.attr('number', {defaultValue: 1}),
    heightPercent: DS.attr('number', {defaultValue: 1}),
    isRatioConstrained: DS.attr('boolean', {defaultValue: false}),
    ratioWidth: DS.attr('number', {defaultValue: 1}),
    ratioHeight: DS.attr('number', {defaultValue: 1}),

    isntWidthConstrained: function() {
        return !this.get('isWidthConstrained');
    }.property('isWidthConstrained'),

    isntHeightConstrained: function() {
        return !this.get('isHeightConstrained');
    }.property('isHeightConstrained'),

    isntWidthPercentConstrained: function() {
        return !this.get('isWidthPercentConstrained');
    }.property('isWidthPercentConstrained'),

    isntHeightPercentConstrained: function() {
        return !this.get('isHeightPercentConstrained');
    }.property('isHeightPercentConstrained'),

    isntRatioConstrained: function() {
        return !this.get('isRatioConstrained');
    }.property('isRatioConstrained'),

    widthIsBindedByConstraints: function(constraints) {
        var xConstraintsNumber = 0;
        constraints.forEach(function(constraint) {
            if(constraint.get('valid')) {
                if(constraint.get('layoutEdge') === 'start' || constraint.get('layoutEdge') === 'end' || constraint.get('layoutEdge') === 'centerX') {
                    xConstraintsNumber++;
                }
            }
        });
        if(xConstraintsNumber > 1) {
            return true;
        } else {
            return false;
        }
    },

    heightIsBindedByConstraints: function(constraints) {
        var yConstraintsNumber = 0;
        constraints.forEach(function(constraint) {
            if(constraint.get('valid')) {
                if(constraint.get('layoutEdge') === 'top' || constraint.get('layoutEdge') === 'bottom' || constraint.get('layoutEdge') === 'centerY') {
                    yConstraintsNumber++;
                }
            }
        });
        if(yConstraintsNumber > 1) {
            return true;
        } else {
            return false;
        }
    },

    widthCanBeConstrained: function() {
        if(this.get('isRatioConstrained')) {
            return false;
        } else if(this.get('isWidthPercentConstrained')) {
            return false;
        } else if(this.widthIsBindedByConstraints(this.get('constraints'))) {
            return false;
        } else if(this.get('controlChain')) {
            if(this.get('controlChain.axis') === 'horizontal' && this.get('controlChain.type') === 'weighted') {
                return false;
            }
        }
        return true;
    }.property(
        'isRatioConstrained',
        'isWidthPercentConstrained',
        'constraints.@each.layoutEdge',
        'constraints.@each.valid',
        'controlChain',
        'controlChain.axis',
        'controlChain.type'
    ),

    heightCanBeConstrained: function() {
        if(this.get('isRatioConstrained')) {
            return false;
        } else if(this.get('isHeightPercentConstrained')) {
            return false;
        } if (this.heightIsBindedByConstraints(this.get('constraints'))) {
            return false;
        } else if(this.get('controlChain')) {
            if(this.get('controlChain.axis') === 'vertical' && this.get('controlChain.type') === 'weighted') {
                return false;
            }
        }
        return true;
    }.property(
        'isRatioConstrained',
        'isHeightPercentConstrained',
        'constraints.@each.layoutEdge',
        'constraints.@each.valid',
        'controlChain',
        'controlChain.axis',
        'controlChain.type'
    ),

    widthPercentCanBeConstrained: function() {
        if(this.get('isRatioConstrained') && this.get('isHeightPercentConstrained')) {
            return false;
        } else if(this.get('isWidthConstrained')) {
            return false;
        } else if(this.widthIsBindedByConstraints(this.get('constraints'))) {
            return false;
        } else if(this.get('controlChain')) {
            if(this.get('controlChain.axis') === 'horizontal' && this.get('controlChain.type') === 'weighted') {
                return false;
            }
        }
        return true;
    }.property(
        'isRatioConstrained',
        'isHeightPercentConstrained',
        'isWidthConstrained',
        'constraints.@each.layoutEdge',
        'constraints.@each.valid',
        'controlChain',
        'controlChain.axis',
        'controlChain.type'
    ),

    heightPercentCanBeConstrained: function() {
        if(this.get('isRatioConstrained') && this.get('isWidthPercentConstrained')) {
            return false;
        } else if(this.get('isHeightConstrained')) {
            return false;
        } if (this.heightIsBindedByConstraints(this.get('constraints'))) {
            return false;
        } else if(this.get('controlChain')) {
            if(this.get('controlChain.axis') === 'vertical' && this.get('controlChain.type') === 'weighted') {
                return false;
            }
        }
        return true;
    }.property(
        'isRatioConstrained',
        'isWidthPercentConstrained',
        'isHeightConstrained',
        'constraints.@each.layoutEdge',
        'constraints.@each.valid',
        'controlChain',
        'controlChain.axis',
        'controlChain.type'
    ),

    ratioCanBeConstrained: function() {
        if(this.get('isRatioConstrained')) {
            return true;
        }
        if(!(this.get('widthCanBeConstrained')) && !(this.get('heightCanBeConstrained'))) {
            return false;
        } else if(this.get('isWidthConstrained') || this.get('isHeightConstrained')) {
            return false;
        } else {
            return !(this.get('isWidthPercentConstrained') && this.get('isHeightPercentConstrained'));
        }
    }.property(
        'isRatioConstrained',
        'isWidthConstrained',
        'isHeightConstrained',
        'isWidthPercentConstrained',
        'isHeightPercentConstrained',
        'widthCanBeConstrained',
        'heightCanBeConstrained'
    ),

    widthCantBeConstrained: function() {
        return !this.get('widthCanBeConstrained');
    }.property('widthCanBeConstrained'),

    heightCantBeConstrained: function() {
        return !this.get('heightCanBeConstrained');
    }.property('heightCanBeConstrained'),

    widthPercentCantBeConstrained: function() {
        return !this.get('widthPercentCanBeConstrained');
    }.property('widthPercentCanBeConstrained'),

    heightPercentCantBeConstrained: function() {
        return !this.get('heightPercentCanBeConstrained');
    }.property('heightPercentCanBeConstrained'),

    ratioCantBeConstrained: function() {
        return !this.get('ratioCanBeConstrained');
    }.property('ratioCanBeConstrained'),

    widthPercentMin: function() {
        var i;
        var flag = true;
        for(i = 0.1; i < 1 && flag; i = i+0.1) {
            if((i * this.get('viewController.scene.application.device.screenWidth')) > this.get('minWidth')) {
                flag = false;
            }
        }
        return i;
    }.property('minWidth', 'viewController.scene.application.device.screenWidth'),

    heightPercentMin: function() {
        var availableHeight = this.get('viewController.scene.application.device.viewBottom') - this.get('viewController.scene.application.device.viewTop');
        if(this.get('viewController.hasTabMenu')) {
            availableHeight = availableHeight - 48;
        }
        var i;
        var flag = true;
        for(i = 0.1; i < 1 && flag; i = i+0.1) {
            if((i * availableHeight) > this.get('minHeight')) {
                flag = false;
            }
        }
        return i;
    }.property('minHeight',
        'viewController.hasTabMenu',
        'viewController.scene.application.device.viewTop',
        'viewController.scene.application.device.viewBottom',
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

    getTopWithMargin: function(onlyValid) {
        var self = this;
        var result = -1000;
        var constraints = self.get('constraints');
        if(onlyValid) {
            constraints = constraints.filter(function(c) {
                return c.get('valid');
            });
        }
        // Look for constraints with top
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'top') {
                if(constraint.get('withParent') === false) {
                    if(constraint.get('referenceLayoutEdge') === 'top') {
                        result = constraint.get('referenceElement.top');
                    } else {
                        result = constraint.get('referenceElement.bottomWithMargin');
                    }
                } else {
                    // Case top with parentTop
                    if (self.get('parentContainer') !== null) {
                        result = parseFloat(self.get('marginTop'));
                    } else {
                        // Check tab bar for menu in Android
                        var isAndroid = self.get('viewController.scene.application.device.platform') === 'android';
                        var currentViewControllerIsMenu = self.get('viewController.hasTabMenu');
                        // Offset from tab bar for menu in Android
                        if (isAndroid && currentViewControllerIsMenu) {
                            result = self.get('viewController.scene.application.device.viewTop') + 48;
                        } else {
                            result = self.get('viewController.scene.application.device.viewTop');
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
                            result = self.get('bottomWithMargin') - self.get('outerHeight');
                        } else {
                            result = self.get('bottomWithMargin') - self.get('outerHeight');
                        }
                    } else if(constraint.get('referenceLayoutEdge') === 'centerY') {
                        // Case centerY - parentCenterY
                        if (self.get('parentContainer') !== null) {
                            result = (self.get('parentContainer.height') / 2) - (self.get('outerHeight') / 2);
                        } else {
                            // Check tab bar for menu in Android
                            var isAndroid = self.get('viewController.scene.application.device.platform') === 'android';
                            var currentViewControllerIsMenu = self.get('viewController.hasTabMenu');

                            if (isAndroid && currentViewControllerIsMenu) {
                                result = self.get('viewController.scene.application.device.viewTop') + 48 +
                                    ((self.get('viewController.scene.application.device.viewBottom') -
                                    self.get('viewController.scene.application.device.viewTop') - 48) / 2) -
                                    (self.get('outerHeight') / 2);
                            } else {
                                result = self.get('viewController.scene.application.device.viewTop') +
                                    ((self.get('viewController.scene.application.device.viewBottom') -
                                    self.get('viewController.scene.application.device.viewTop')) / 2) -
                                    (self.get('outerHeight') / 2);
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
                            if(constraint.get('referenceLayoutEdge') === 'bottom') {
                                result = constraint.get('referenceElement.bottom');
                            } else {
                                result = constraint.get('referenceElement.topWithMargin');
                            }
                            result = result - self.get('outerHeight');
                        } else if(constraint.get('layoutEdge') === 'centerY') {
                            result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) -
                                (self.get('height') / 2);
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
                return parseFloat(self.get('posY')) + self.get('viewController.scene.application.device.viewTop');
            }
        }
    },

    topWithMargin: function () {
        if(!this.get('isDeleted')) {
            if(this.get('controlChain') && this.get('controlChain.axis') === 'vertical') {
                return this.get('controlChain').getTopInChain(this.get('id'));
            } else {
                return this.getTopWithMargin(true);
            }
        } else {
            return null;
        }
    }.property(
        'controlChain',
        'controlChain.axis',
        'controlChain.type',
        'controlChain.totalValue',
        'controlChain.byas',
        'controlChain.spacing',
        'controlChain.availableSpace',
        'controlChain.valid',
        'bindedControls.@each.top',
        'posY',
        'viewController.hasTabMenu',
        'outerHeight',
        'constraints.@each.layoutEdge',
        'constraints.@each.withParent',
        'constraints.@each.referenceElement',
        'constraints.@each.referenceElement.marginTop',
        'constraints.@each.referenceElement.marginBottom',
        'constraints.@each.referenceLayoutEdge',
        'constraints.@each.valid',
        'viewController.scene.application.device.viewTop',
        'viewController.scene.application.device.viewBottom',
        'viewController.scene.application.device.platform',
        'bottomWithMargin',
        'parentContainer',
        'parentContainer.height'),

    top: function () {
        return this.get('topWithMargin') + parseFloat(this.get('marginTop'));
    }.property('topWithMargin'),

    getBottomWithMargin: function(onlyValid) {
        var self = this;
        var result = -1000;
        var constraints = self.get('constraints');
        if(onlyValid) {
            constraints = constraints.filter(function(c) {
                return c.get('valid');
            });
        }
        // look for a constraint with bottom
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'bottom') {
                if(constraint.get('withParent') === false) {
                    if(constraint.get('referenceLayoutEdge') === 'bottom') {
                        result = constraint.get('referenceElement.bottom');
                    } else {
                        result = constraint.get('referenceElement.topWithMargin');
                    }
                } else {
                    // Case bottom - parentBottom
                    if (self.get('parentContainer') !== null) {
                        result = self.get('parentContainer.height');
                    } else {
                        // Check tab bar for menu in iOS
                        var isIOS = self.get('viewController.scene.application.device.platform') === 'ios';
                        var currentViewControllerIsMenu = self.get('viewController.hasTabMenu');
                        // Offset from tab bar for menu in iOS
                        if (isIOS && currentViewControllerIsMenu) {
                            result = self.get('viewController.scene.application.device.viewBottom') - 48;
                        } else {
                            result = self.get('viewController.scene.application.device.viewBottom');
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
                            result = self.get('topWithMargin') + self.get('outerHeight');
                        } else {
                            result = self.get('topWithMargin') + self.get('outerHeight');
                        }
                    } else if(constraint.get('referenceLayoutEdge') === 'centerY') {
                        // Case centerY - parentCenterY
                        if (self.get('parentContainer') !== null) {
                            result = (self.get('parentContainer.height') / 2) + (self.get('outerHeight') / 2);
                        } else {
                            // Check tab bar for menu in iOS
                            var isIOS = self.get('viewController.scene.application.device.platform') === 'ios';
                            var currentViewControllerIsMenu = self.get('viewController.hasTabMenu');
                            // Offset from tab bar for menu in iOS
                            if (isIOS && currentViewControllerIsMenu) {
                                result = self.get('viewController.scene.application.device.viewBottom') - 48 -
                                    ((self.get('viewController.scene.application.device.viewBottom') -
                                    self.get('viewController.scene.application.device.viewTop' - 48)) / 2) +
                                    (self.get('outerHeight') / 2);
                            }
                            result = self.get('viewController.scene.application.device.viewBottom') -
                                ((self.get('viewController.scene.application.device.viewBottom') -
                                self.get('viewController.scene.application.device.viewTop')) / 2) +
                                (self.get('outerHeight') / 2);
                        }
                    }
                }
            });

            if(result === -1000) {
                // Look for other y constraints with other uiPhoneControls
                constraints.forEach(function (constraint) {
                    if(constraint.get('withParent') === false) {
                        if(constraint.get('layoutEdge') === 'top') {
                            if(constraint.get('referenceLayoutEdge') === 'top') {
                                result = constraint.get('referenceElement.top');
                            } else {
                                result = constraint.get('referenceElement.bottomWithMargin');
                            }
                            result = result + self.get('outerHeight');
                        } else if(constraint.get('layoutEdge') === 'centerY') {
                            result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                                (self.get('height') / 2);
                        }
                    }
                });
            }
        }

        // Base case: no y constraints
        if(result != -1000) {
            return result;
        } else {
            return self.get('topWithMargin') + parseFloat(self.get('outerHeight'));
        }
    },

    bottomWithMargin: function () {
        if(!this.get('isDeleted')) {
            if(this.get('controlChain') && this.get('controlChain.axis') === 'vertical') {
                return this.get('controlChain').getBottomInChain(this.get('id'), this.get('valueInChain'));
            } else {
                return this.getBottomWithMargin(true);
            }
        } else {
            return null;
        }
    }.property(
        'controlChain',
        'controlChain.axis',
        'controlChain.type',
        'controlChain.totalValue',
        'controlChain.byas',
        'controlChain.spacing',
        'controlChain.availableSpace',
        'controlChain.valid',
        'bindedControls.@each.bottom',
        'constraints.@each.layoutEdge',
        'constraints.@each.withParent',
        'constraints.@each.referenceElement',
        'constraints.@each.referenceElement.marginTop',
        'constraints.@each.referenceElement.marginBottom',
        'constraints.@each.referenceLayoutEdge',
        'constraints.@each.valid',
        'topWithMargin',
        'viewController.hasTabMenu',
        'outerHeight',
        'viewController.scene.application.device.platform',
        'viewController.scene.application.device.viewBottom',
        'viewController.scene.application.device.viewTop',
        'parentContainer',
        'parentContainer.height'
    ),

    bottom: function () {
        return this.get('bottomWithMargin') - parseFloat(this.get('marginBottom'));
    }.property('bottomWithMargin'),

    getStartWithMargin: function(onlyValid) {
        var self = this;
        var result = -1000;
        var constraints = self.get('constraints');
        if(onlyValid) {
            constraints = constraints.filter(function(c) {
                return c.get('valid');
            });
        }
        // look for a constraint with start
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'start') {
                if(constraint.get('withParent') === false) {
                    if(constraint.get('referenceLayoutEdge') === 'start') {
                        result = constraint.get('referenceElement.start');
                    } else {
                        result = constraint.get('referenceElement.endWithMargin');
                    }
                } else {
                    // Case start - parentStart
                    result = self.get('viewController.startInScreen');
                }
            }
        });

        if(result === -1000) {
            // look for another x constraint with parent
            constraints.forEach(function (constraint) {
                if(constraint.get('withParent') === true) {
                    // Case end - parentEnd
                    if(constraint.get('referenceLayoutEdge') === 'end') {
                        result = self.get('endWithMargin') - self.get('outerWidth');
                    } else if(constraint.get('referenceLayoutEdge') === 'centerX') {
                        // Case centerX - parentCenterX
                        if(self.get('parentContainer') !== null) {
                            result = (self.get('parentContainer.width') / 2) - (self.get('outerWidth') / 2);
                        } else {
                            result = self.get('viewController.startInScreen') + (self.get('viewController.width') / 2) - (self.get('outerWidth') / 2);
                        }
                    }
                }
            });

            if(result === -1000) {
                // look for another x constraint with other uiPhoneControls
                constraints.forEach(function (constraint) {
                    if(constraint.get('withParent') === false) {
                        if(constraint.get('layoutEdge') === 'end') {
                            if(constraint.get('referenceLayoutEdge') === 'end') {
                                result = constraint.get('referenceElement.end');
                            } else {
                                result = constraint.get('referenceElement.startWithMargin');
                            }
                            result = result - self.get('outerWidth');
                        } else if(constraint.get('layoutEdge') === 'centerX') {
                            result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) -
                                (self.get('width') / 2);
                        }
                    }
                });
            }
        }

        if(result != -1000) {
            return result;
        } else {
            return parseFloat(self.get('posX')) + self.get('viewController.startInScreen');
        }
    },

    startWithMargin: function () {
        if(!this.get('isDeleted')) {
            if(this.get('controlChain') && this.get('controlChain.axis') === 'horizontal') {
                return this.get('controlChain').getStartInChain(this.get('id'));
            } else {
                return this.getStartWithMargin(true);
            }
        } else {
            return null;
        }
    }.property(
        'controlChain',
        'controlChain.axis',
        'controlChain.type',
        'controlChain.totalValue',
        'controlChain.byas',
        'controlChain.availableSpace',
        'controlChain.spacing',
        'controlChain.valid',
        'bindedControls.@each.start',
        'constraints.@each.layoutEdge',
        'constraints.@each.withParent',
        'constraints.@each.referenceElement',
        'constraints.@each.referenceElement.marginStart',
        'constraints.@each.referenceElement.marginEnd',
        'constraints.@each.referenceLayoutEdge',
        'constraints.@each.valid',
        'posX',
        'outerWidth',
        'parentContainer',
        'parentContainer.width',
        'endWithMargin',
        'viewController.startInScreen',
        'viewController.width'),

    start: function () {
        return this.get('startWithMargin') + parseFloat(this.get('marginStart'));
    }.property('startWithMargin'),

    getEndWithMargin: function(onlyValid) {
        var self = this;
        var result = -1000;
        var constraints = self.get('constraints');
        if(onlyValid) {
            constraints = constraints.filter(function(c) {
                return c.get('valid');
            });
        }
        // look for a constraint with end
        constraints.forEach(function (constraint) {
            if(constraint.get('layoutEdge') === 'end') {
                if(constraint.get('withParent') === false) {
                    if(constraint.get('referenceLayoutEdge') === 'end') {
                        result = constraint.get('referenceElement.end');
                    } else {
                        result = constraint.get('referenceElement.startWithMargin');
                    }
                } else {
                    // Case end - parentEnd
                    if (self.get('parentContainer') !== null) {
                        result = self.get('parentContainer.width');
                    } else {
                        result = self.get('viewController.endInScreen');
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
                        result = self.get('startWithMargin') + self.get('outerWidth');
                    } else if(constraint.get('referenceLayoutEdge') === 'centerX') {
                        // Case centerX - parentCenterX
                        if(self.get('parentContainer') !== null) {
                            result = self.get('startWithMargin') + self.get('outerWidth');
                        } else {
                            result = self.get('startWithMargin') + self.get('outerWidth');
                        }
                    }
                }
            });

            if(result === -1000) {
                // look for another x constraint with other uiPhoneControls
                constraints.forEach(function (constraint) {
                    if(constraint.get('withParent') === false) {
                        if(constraint.get('layoutEdge') === 'start') {
                            if(constraint.get('referenceLayoutEdge') === 'start') {
                                result = constraint.get('referenceElement.start');
                            } else {
                                result = constraint.get('referenceElement.endWithMargin');
                            }
                            result = result + self.get('outerWidth');
                        } else if(constraint.get('layoutEdge') === 'centerX') {
                            result = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge')) +
                                (self.get('width') / 2);
                        }
                    }
                });
            }
        }

        if(result != -1000) {
            return result;
        } else {
            return self.get('startWithMargin') + parseFloat(self.get('outerWidth'));
        }
    },

    endWithMargin: function () {
        if(!this.get('isDeleted')) {
            if(this.get('controlChain') && this.get('controlChain.axis') === 'horizontal') {
                return this.get('controlChain').getEndInChain(this.get('id'), this.get('valueInChain'));
            } else {
                return this.getEndWithMargin(true);
            }
        } else {
            return null;
        }
    }.property(
        'controlChain',
        'controlChain.axis',
        'controlChain.type',
        'controlChain.totalValue',
        'controlChain.byas',
        'controlChain.spacing',
        'controlChain.valid',
        'controlChain.availableSpace',
        'bindedControls.@each.end',
        'constraints.@each.layoutEdge',
        'constraints.@each.withParent',
        'constraints.@each.referenceElement',
        'constraints.@each.referenceElement.marginStart',
        'constraints.@each.referenceElement.marginEnd',
        'constraints.@each.referenceLayoutEdge',
        'constraints.@each.valid',
        'startWithMargin',
        'parentContainer',
        'parentContainer.width',
        'outerWidth',
        'viewController.endInScreen',
        'viewController.width'),

    end: function () {
        return this.get('endWithMargin') - parseFloat(this.get('marginEnd'));
    }.property('endWithMargin'),

    centerX: function() {
        return this.get('start') + (this.get('width') / 2);
    }.property('start', 'width'),

    centerY: function() {
        return this.get('top') + (this.get('height') / 2);
    }.property('top', 'height'),

    computedWidth: function () {
        return parseFloat(this.get('end')) -
            parseFloat(this.get('start'));
    }.property(
        'start',
        'end',
        'marginStart',
        'paddingStart',
        'paddingEnd',
        'marginEnd'),

    computedHeight: function () {
        return parseFloat(this.get('bottom')) -
            parseFloat(this.get('top'));
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

    valueInChainCanBeChanged: function() {
        if(!this.get('isDeleted') && this.get('controlChain')) {
            if(this.get('controlChain.type') === 'weighted') {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }.property('controlChain.type'),

    valueInChainCantBeChanged: function() {
        return !this.get('valueInChainCanBeChanged');
    }.property('valueInChainCanBeChanged'),

    marginTopCantBeChanged: function() {
        if(!this.get('isDeleted')) {
            if(this.get('controlChain') && this.get('controlChain.axis') === 'vertical') {
                return !this.get('controlChain').canMarginTopBeChanged(this.get('id'));
            } else {
                return false;
            }
        }
        return true;
    }.property(
        'controlChain',
        'controlChain.type',
        'controlChain.axis'
    ),

    marginBottomCantBeChanged: function() {
        if(!this.get('isDeleted')) {
            if(this.get('controlChain') && this.get('controlChain.axis') === 'vertical') {
                return !this.get('controlChain').canMarginBottomBeChanged(this.get('id'));
            } else {
                return false;
            }
        }
        return true;
    }.property(
        'controlChain',
        'controlChain.type',
        'controlChain.axis',
        'controlChain.uiPhoneControls.length'
    ),

    marginStartCantBeChanged: function() {
        if(!this.get('isDeleted')) {
            if(this.get('controlChain') && this.get('controlChain.axis') === 'horizontal') {
                return !this.get('controlChain').canMarginStartBeChanged(this.get('id'));
            } else {
                return false;
            }
        }
        return true;
    }.property(
        'controlChain',
        'controlChain.type',
        'controlChain.axis'
    ),

    marginEndCantBeChanged: function() {
        if(!this.get('isDeleted')) {
            if(this.get('controlChain') && this.get('controlChain.axis') === 'horizontal') {
                return !this.get('controlChain').canMarginEndBeChanged(this.get('id'));
            } else {
                return false;
            }
        }
        return true;
    }.property(
        'controlChain',
        'controlChain.type',
        'controlChain.axis',
        'controlChain.uiPhoneControls.length'
    ),

    marginObserver: function() {
        if(!this.get('isDeleted')) {
            if(this.get('marginTopCantBeChanged')) {
                this.set('marginTop', 0);
            }
            if(this.get('marginBottomCantBeChanged')) {
                this.set('marginBottom', 0);
            }
            if(this.get('marginStartCantBeChanged')) {
                this.set('marginStart', 0);
            }
            if(this.get('marginEndCantBeChanged')) {
                this.set('marginEnd', 0);
            }
            this.save();
        }
    }.observes(
        'marginTopCantBeChanged',
        'marginBottomCantBeChanged',
        'marginStartCantBeChanged',
        'marginEndCantBeChanged'
    ),

    valueObserver: function() {
        if(!this.get('isDeleted')) {
            this.set('valueInChain', parseInt(this.get('valueInChain')));
        }
    }.observes('valueInChain'),

    ratioObserver: function() {
        if(!this.get('isDeleted')) {
            if(this.get('isRatioConstrained')) {
                var ratio;
                if(this.get('isWidthPercentConstrained') || this.widthIsBindedByConstraints(this.get('constraints'))) {
                    ratio = this.get('ratioHeight') / this.get('ratioWidth');
                    this.set('height', this.get('width') * ratio);
                } else if(this.get('isHeightPercentConstrained') || this.heightIsBindedByConstraints(this.get('constraints'))) {
                    ratio = this.get('ratioWidth') / this.get('ratioHeight');
                    this.set('width', this.get('height') * ratio);
                } else if(this.get('ratioWidth') < this.get('ratioHeight')) {
                    ratio = this.get('ratioWidth') / this.get('ratioHeight');
                    this.set('width', this.get('height') * ratio);
                } else {
                    ratio = this.get('ratioHeight') / this.get('ratioWidth');
                    this.set('height', this.get('width') * ratio);
                }
            } else {
                var mustUpdateWidth = true;
                mustUpdateWidth = mustUpdateWidth && !this.get('isWidthPercentConstrained');
                mustUpdateWidth = mustUpdateWidth && !this.widthIsBindedByConstraints(this.get('constraints'));
                if(this.get('controlChain')) {
                    mustUpdateWidth = mustUpdateWidth && (this.get('controlChain.axis') !== 'horizontal');
                }
                if(mustUpdateWidth) {
                    this.set('width', this.get('defaultWidth'));
                }
                var mustUpdateHeight = true;
                mustUpdateHeight = mustUpdateHeight && !this.get('isHeightPercentConstrained');
                mustUpdateHeight = mustUpdateHeight && !this.heightIsBindedByConstraints(this.get('constraints'));
                if(this.get('controlChain')) {
                    mustUpdateHeight = mustUpdateHeight && (this.get('controlChain.axis') !== 'vertical');
                }
                if(mustUpdateHeight) {
                    this.set('height', this.get('defaultHeight'));
                }
            }
        }
    }.observes(
        'isRatioConstrained',
        'ratioWidth',
        'ratioHeight'
    ),

    ratioObserverWidth: function() {
        if(!this.get('isDeleted') && this.get('isRatioConstrained')) {
            var ratio = this.get('ratioHeight') / this.get('ratioWidth');
            this.set('height', this.get('width') * ratio);
        }
    }.observes('width'),

    ratioObserverHeight: function() {
        if(!this.get('isDeleted') && this.get('isRatioConstrained')) {
            var ratio = this.get('ratioWidth') / this.get('ratioHeight');
            this.set('width', this.get('height') * ratio);
        }
    }.observes('height'),

    widthObserver: function() {
        var mustUpdateWidth = true;
        mustUpdateWidth = mustUpdateWidth && !this.get('isDeleted');
        mustUpdateWidth = mustUpdateWidth && !this.widthIsBindedByConstraints(this.get('constraints'));
        if(mustUpdateWidth) {
            if(this.get('isWidthPercentConstrained')) {
                this.set('width', this.get('viewController').getWidthFromPercent(this.get('widthPercent')));
            }
        }
        mustUpdateWidth = mustUpdateWidth && !this.get('isRatioConstrained');
        if(mustUpdateWidth) {
            if(this.get('isWidthConstrained')) {

            } else if(this.get('isWidthPercentConstrained')) {
                this.set('width', this.get('viewController').getWidthFromPercent(this.get('widthPercent')));
            } else if(!this.get('isWidthConstrained')) {
                this.set('width', this.get('defaultWidth'));
            } else if(!this.get('isWidthPercentConstrained')) {
                this.set('width', this.get('defaultWidth'));
            }
        }
    }.observes(
        'viewController.sceneScreen',
        'viewController.sceneScreen.viewControllers.@each.widthPercentInScreen',
        'viewController.scene.application.device.type',
        'viewController.scene.application.device.screenWidth',
        'widthPercent',
        'isWidthConstrained',
        'isWidthPercentConstrained',
        'computedWidth'
    ),

    heightObserver: function() {
        var mustUpdateHeight = true;
        mustUpdateHeight = mustUpdateHeight && !this.get('isDeleted');
        mustUpdateHeight = mustUpdateHeight && !this.heightIsBindedByConstraints(this.get('constraints'));
        if(mustUpdateHeight) {
            if(this.get('isHeightPercentConstrained')) {
                var screenHeight = this.get('viewController.scene.application.device.viewBottom') - this.get('viewController.scene.application.device.viewTop');
                if(this.get('viewController.hasTabMenu')) {
                    screenHeight = screenHeight - 48;
                }
                this.set('height', this.get('heightPercent') * screenHeight);
            }
        }
        mustUpdateHeight = mustUpdateHeight && !this.get('isRatioConstrained');
        if(mustUpdateHeight) {
            if(this.get('isHeightConstrained')) {

            } else if(this.get('isHeightPercentConstrained')) {
                var screenHeight = this.get('viewController.scene.application.device.viewBottom') - this.get('viewController.scene.application.device.viewTop');
                if(this.get('viewController.hasTabMenu')) {
                    screenHeight = screenHeight - 48;
                }
                this.set('height', this.get('heightPercent') * screenHeight);
            } else if(!this.get('isHeightConstrained')) {
                this.set('height', this.get('defaultHeight'));
            } else if(!this.get('isHeightPercentConstrained')) {
                this.set('height', this.get('defaultHeight'));
            }
        }
    }.observes(
        'viewController.scene.application.device.viewTop',
        'viewController.scene.application.device.viewBottom',
        'viewController.hasTabMenu',
        'heightPercent',
        'isHeightConstrained',
        'isHeightPercentConstrained',
        'computedHeight'
    ),

    constraintsObserver: function() {
        if(!this.get('isDeleted')) {
            if(this.widthIsBindedByConstraints(this.get('constraints'))) {
                this.set('width', this.get('computedWidth'));
            }
            if(this.heightIsBindedByConstraints(this.get('constraints'))) {
                this.set('height', this.get('computedHeight'));
            }
        }
    }.observes('computedWidth', 'computedHeight'),

    // Used to reload views
    didCreate: function () {
        this.set('name', this.get('id') + '-' + this.constructor.toString().split(".")[1]);

        var self = this;
        if (this.get('parentContainer')) {
            var uiPhoneControls = this.get('parentContainer.uiPhoneControls');
            uiPhoneControls.pushObject(self);
            this.get('parentContainer').save();
        }
    },

    deleteRecord: function () {
        var viewController = this.get('viewController');
        var self = this;

        if (viewController) {
            viewController.get('uiPhoneControls').forEach(function (uiPhoneControl) {
                var constraints = uiPhoneControl.get('constraints');
                constraints.forEach(function (constraint) {
                    if (constraint.get('referenceElement') === self) {
                        //Ember.run.once(self, function () {
                            if(constraint) {
                                constraint.set('referenceElement', null);
                                constraint.save();
                                uiPhoneControl.get('bindedControls').removeObject(self);
                                uiPhoneControl.save();
                            }
                        //});
                    }
                });
            });
        }

        var myConstraints = this.get('constraints');
        myConstraints.forEach(function (constraint) {
            Ember.run.once(self, function () {
                constraint.deleteRecord();
                constraint.save();
            });
        });

        this._super();
    },

    decorateXml: function (xmlDoc, xmlElem) {
        xmlElem.setAttribute('id', this.get('name'));

        xmlElem.setAttribute('posX', this.get('posX'));
        xmlElem.setAttribute('posY', this.get('posY'));

        xmlElem.setAttribute('width', this.get('width'));
        xmlElem.setAttribute('height', this.get('height'));

        if(this.get('controlChain')) {
            xmlElem.setAttribute('controlChain', this.get('controlChain').getRefPath(''));
        }

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
        if(constraints.get('length') > 0 || this.get('isWidthConstrained') || this.get('isHeightConstrained')  || this.get('isWidthPercentConstrained')  || this.get('isHeightPercentConstrained') || this.get('isRatioConstrained')) {
            var elem = xmlDoc.createElement('constraints');
            if(this.get('isWidthConstrained')) {
                elem.setAttribute('fixedWidth', true);
            }
            if(this.get('isHeightConstrained')) {
                elem.setAttribute('fixedHeight', true);
            }
            if(this.get('isRatioConstrained')) {
                elem.setAttribute('fixedRatio', true);
                elem.setAttribute('ratio', this.get('ratioWidth') + ':' + this.get('ratioHeight'));
            }
            if(this.get('isWidthPercentConstrained')) {
                elem.setAttribute('fixedPercentWidth', true);
                elem.setAttribute('widthPercent', this.get('widthPercent'));
            }
            if(this.get('isHeightPercentConstrained')) {
                elem.setAttribute('fixedPercentHeight', true);
                elem.setAttribute('heightPercent', this.get('heightPercent'));
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
        var updatedPath = '/@' + this.get('xmlName') + '[id=\'' + this.get('id') + '\']';

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
