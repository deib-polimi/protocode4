App.UiPhoneControl = App.UiControl.extend({
    // Defined here to be able to use them, but the values are overwritten in child classes
    defaultWidth: 0,
    defaultHeight: 0,
    widthFixed: DS.attr('number', {defaultValue: 1}),
    heightFixed: DS.attr('number', {defaultValue: 1}),

    //Override
    /*--------------------------------------------------------------*/
    //posY: DS.attr('number', {defaultValue: 96}),
    /*--------------------------------------------------------------*/

    viewController: DS.belongsTo('viewController', {inverse: 'uiPhoneControls'}),
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

    validConstraints: function() {
        return this.get('constraints').filter(function(c) {
    		return c.get('valid');
    	});
    }.property('constraints.@each.valid'),

    widthIsBindedByConstraints: function(constraints) {
        var xConstraintsNumber = 0;
        constraints.forEach(function(constraint) {
            if(constraint.get('valid')) {
                if(constraint.get('layoutEdge') === 'start' || constraint.get('layoutEdge') === 'end') {
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
                if(constraint.get('layoutEdge') === 'top' || constraint.get('layoutEdge') === 'bottom') {
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

    siblings: function () {
        if (this.get('viewController.uiPhoneControls')) {
            return this.get('viewController.uiPhoneControls').without(this);
        }
        return null;
    }.property('viewController.uiPhoneControls.@each'),

    getTopWithMargin: function(onlyValid) {
        // Get constraints
        var constraints;
        if(onlyValid) {
            constraints = this.get('validConstraints');
        } else {
            constraints = this.get('constraints').filter(function(c) {
                return (c.get('layoutEdge') === 'top') || (c.get('layoutEdge') === 'bottom');
            });
        }
        // Process constraints
        var i, layoutEdge = 'empty', referencePosition;
        for(i = 0; i < constraints.get('length') && layoutEdge !== 'top'; i++) {
            var c = constraints.objectAt(i);
            if(c.get('layoutEdge') === 'top') {
                layoutEdge = 'top';
                if(c.get('referenceLayoutEdge') === 'top') {
                    if(c.get('withParent')) {
                        referencePosition = this.get('viewController.top');
                    } else {
                        referencePosition = c.get('referenceElement.top');
                    }
                } else {
                    // Top aligned with Bottom can't be with parent
                    referencePosition = c.get('referenceElement.bottomWithMargin');
                }
            } else if(c.get('layoutEdge') === 'bottom') {
                layoutEdge = 'bottom';
            } else if(c.get('layoutEdge') === 'centerY') {
                layoutEdge = 'centerY';
                if(c.get('withParent')) {
                    referencePosition = this.get('viewController.centerY') - (this.get('height') / 2);
                } else {
                    referencePosition = c.get('referenceElement.centerY') - (this.get('height') / 2);
                }
            }
        }
        // In the case of bottom, i set here referencePosition to escape from infinte recursion
        if(layoutEdge === 'bottom') {
            referencePosition = this.get('bottomWithMargin') - this.get('outerHeight');
        }
        // Return position
        if(layoutEdge !== 'empty') {
            return referencePosition;
        } else {
            return parseFloat(this.get('posY')) + this.get('viewController.top');
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
        'outerHeight',
        'height',
        'constraints.@each.layoutEdge',
        'constraints.@each.withParent',
        'constraints.@each.referenceElement',
        'constraints.@each.referenceElement.marginTop',
        'constraints.@each.referenceElement.marginBottom',
        'constraints.@each.referenceLayoutEdge',
        'constraints.@each.valid',
        'viewController.top',
        'viewController.centerY',
        'bottomWithMargin'
    ),

    top: function () {
        return this.get('topWithMargin') + parseFloat(this.get('marginTop'));
    }.property('topWithMargin'),

    getBottomWithMargin: function(onlyValid) {
        // Get constraints
        var constraints;
        if(onlyValid) {
            constraints = this.get('validConstraints');
        } else {
            constraints = this.get('constraints').filter(function(c) {
                return (c.get('layoutEdge') === 'top') || (c.get('layoutEdge') === 'bottom');
            });
        }
        // Process constraints
        var i, layoutEdge = 'empty', referencePosition;
        for(i = 0; i < constraints.get('length') && layoutEdge !== 'bottom'; i++) {
            var c = constraints.objectAt(i);
            if(c.get('layoutEdge') === 'bottom') {
                layoutEdge = 'bottom';
                if(c.get('referenceLayoutEdge') === 'bottom') {
                    if(c.get('withParent')) {
                        referencePosition = this.get('viewController.bottom');
                    } else {
                        referencePosition = c.get('referenceElement.bottom');
                    }
                } else {
                    // Bottom aligned with top can't be with parent
                    referencePosition = c.get('referenceElement.topWithMargin');
                }
            } else if(c.get('layoutEdge') === 'top') {
                layoutEdge = 'top';
            } else if(c.get('layoutEdge') === 'centerY') {
                layoutEdge = 'centerY';
                referencePosition = this.get('topWithMargin') + this.get('outerHeight');
            }
        }
        // In the case of top, i set here referencePosition to escape from infinte recursion
        if(layoutEdge === 'top') {
            referencePosition = this.get('topWithMargin') + this.get('outerHeight');
        }
        // Return position
        if(layoutEdge !== 'empty') {
            return referencePosition;
        } else {
            return this.get('topWithMargin') + this.get('outerHeight');
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
        'outerHeight',
        'viewController.bottom'
    ),

    bottom: function () {
        return this.get('bottomWithMargin') - parseFloat(this.get('marginBottom'));
    }.property('bottomWithMargin'),

    getStartWithMargin: function(onlyValid) {
        // Get constraints
        var constraints;
        if(onlyValid) {
            constraints = this.get('validConstraints');
        } else {
            constraints = this.get('constraints').filter(function(c) {
                return (c.get('layoutEdge') === 'start') || (c.get('layoutEdge') === 'end');
            });
        }
        // Process constraints
        var i, layoutEdge = 'empty', referencePosition;
        for(i = 0; i < constraints.get('length') && layoutEdge !== 'start'; i++) {
            var c = constraints.objectAt(i);
            if(c.get('layoutEdge') === 'start') {
                layoutEdge = 'start';
                if(c.get('referenceLayoutEdge') === 'start') {
                    if(c.get('withParent')) {
                        referencePosition = this.get('viewController.start');
                    } else {
                        referencePosition = c.get('referenceElement.start');
                    }
                } else {
                    // Start aligned with end can't be with parent
                    referencePosition = c.get('referenceElement.endWithMargin');
                }
            } else if(c.get('layoutEdge') === 'end') {
                layoutEdge = 'end';
            } else if(c.get('layoutEdge') === 'centerX') {
                layoutEdge = 'centerX';
                if(c.get('withParent')) {
                    referencePosition = this.get('viewController.centerX') - (this.get('width') / 2);
                } else {
                    referencePosition = c.get('referenceElement.centerX') - (this.get('width') / 2);
                }
            }
        }
        // In the case of end, i set here referencePosition to escape from infinte recursion
        if(layoutEdge === 'end') {
            referencePosition = this.get('endWithMargin') - this.get('outerWidth');
        }
        // Return position
        if(layoutEdge !== 'empty') {
            return referencePosition;
        } else {
            return parseFloat(this.get('posX')) + this.get('viewController.start');
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
        'width',
        'endWithMargin',
        'viewController.start',
        'viewController.centerX'
    ),

    start: function () {
        return this.get('startWithMargin') + parseFloat(this.get('marginStart'));
    }.property('startWithMargin'),

    getEndWithMargin: function(onlyValid) {
        // Get constraints
        var constraints;
        if(onlyValid) {
            constraints = this.get('validConstraints');
        } else {
            constraints = this.get('constraints').filter(function(c) {
                return (c.get('layoutEdge') === 'start') || (c.get('layoutEdge') === 'end');
            });
        }
        // Process constraints
        var i, layoutEdge = 'empty', referencePosition;
        for(i = 0; i < constraints.get('length') && layoutEdge !== 'end'; i++) {
            var c = constraints.objectAt(i);
            if(c.get('layoutEdge') === 'end') {
                layoutEdge = 'end';
                if(c.get('referenceLayoutEdge') === 'end') {
                    if(c.get('withParent')) {
                        referencePosition = this.get('viewController.end');
                    } else {
                        referencePosition = c.get('referenceElement.end');
                    }
                } else {
                    // End aligned with start can't be with parent
                    referencePosition = c.get('referenceElement.startWithMargin');
                }
            } else if(c.get('layoutEdge') === 'start') {
                layoutEdge = 'start';
            } else if(c.get('layoutEdge') === 'centerX') {
                layoutEdge = 'centerX';
                referencePosition = this.get('startWithMargin') + this.get('outerWidth');
            }
        }
        // In the case of start, i set here referencePosition to escape from infinte recursion
        if(layoutEdge === 'start') {
            referencePosition = this.get('startWithMargin') + this.get('outerWidth');
        }
        // Return position
        if(layoutEdge !== 'empty') {
            return referencePosition;
        } else {
            return this.get('startWithMargin') + this.get('outerWidth');
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
        'outerWidth',
        'viewController.end'
    ),

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

    width: function() {
        if(this.get('isWidthConstrained')) {
            return parseFloat(this.get('widthFixed'));
        } else if(this.get('isWidthPercentConstrained')) {
            return this.get('viewController').getWidthFromPercent(this.get('widthPercent'));
        } else if(this.widthIsBindedByConstraints(this.get('constraints'))) {
            return this.get('computedWidth');
        } else if(this.get('isRatioConstrained')) {
            if(this.get('isHeightPercentConstrained') || this.heightIsBindedByConstraints(this.get('constraints'))) {
                return this.get('height') * (this.get('ratioWidth') / this.get('ratioHeight'));
            }
            return this.get('defaultWidth');
        }
        return this.get('defaultWidth');
    }.property(
        'isWidthConstrained',
        'widthFixed',
        'isWidthPercentConstrained',
        'widthPercent',
        'viewController.width',
        'computedWidth',
        'isRatioConstrained',
        'isHeightPercentConstrained',
        'height',
        'ratioWidth',
        'ratioHeight',
        'defaultWidth'
    ),

    height: function() {
        if(this.get('isHeightConstrained')) {
            return parseFloat(this.get('heightFixed'));
        } else if(this.get('isHeightPercentConstrained')) {
            return this.get('viewController').getHeightFromPercent(this.get('heightPercent'));
        } else if(this.heightIsBindedByConstraints(this.get('constraints'))) {
            return this.get('computedHeight');
        } else if(this.get('isRatioConstrained')) {
            return this.get('width') * (this.get('ratioHeight') / this.get('ratioWidth'));
        }
        return this.get('defaultHeight');
    }.property(
        'isHeightConstrained',
        'heightFixed',
        'isHeightPercentConstrained',
        'heightPercent',
        'viewController.height',
        'computedHeight',
        'isRatioConstrained',
        'ratioHeight',
        'ratioWidth',
        'width',
        'defaultHeight'
    ),

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

    // Used to reload views
    didCreate: function () {
        this.set('name', this.get('id') + '-' + this.constructor.toString().split(".")[1]);
    },

    deleteRecord: function () {
        var self = this;

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

        updatedPath = this.get('viewController').getRefPath(updatedPath);

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
