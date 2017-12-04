App.ControlChain = DS.Model.extend({
    viewController: DS.belongsTo('viewController', {inverse: 'controlChains'}),

    name: DS.attr('string'),
    axis: DS.attr('string'),
    type: DS.attr('string'),
    byas: DS.attr('number', {defaultValue: 0.5}),
    uiPhoneControls: DS.hasMany('uiPhoneControl', {polymorphic: true}),
    spacing: DS.attr('number', {defaultValue: 0}),

    xmlName: 'controlChain',

    valid: function() {
        if(!this.get('isDeleted')) {
            if(this.get('axis') && this.get('type') && this.get('uiPhoneControls.length') >= 2) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }.property('axis', 'type', 'uiPhoneControls.@each'),

    invalid: function() {
        return !this.get('valid');
    }.property('valid'),

    totalValue: function() {
        var total = 0;
        this.get('uiPhoneControls').forEach(function(c) {
            total = total + c.get('valueInChain');
        });
        return total;
    }.property(
        'uiPhoneControls.@each.valueInChain'
    ),

    byasCantBeChanged: function() {
        if(!this.get('valid')) {
            return true;
        } else if(this.get('type')) {
            return this.get('type') !== 'packed';
        } else {
            return true;
        }
    }.property('type', 'valid'),

    viewTop: function() {
        var isAndroid = this.get('viewController.scene.application.device.platform') === 'android';
        // Compute if the viewController has the menu bar
        var currentViewControllerIsMenu = this.get('viewController.scene.mustShowTabMenu');
        if(isAndroid && currentViewControllerIsMenu) {
            return this.get('viewController.scene.application.device.viewTop') + 48;
        } else {
            return this.get('viewController.scene.application.device.viewTop');
        }
    }.property(
        'viewController.scene.application.device.platform',
        'viewController.scene.mustShowTabMenu',
        'viewController.scene.application.device.viewTop'
    ),

    viewBottom: function() {
        var isAndroid = this.get('viewController.scene.application.device.platform') === 'android';
        // Compute if the viewController has the menu bar
        var currentViewControllerIsMenu = this.get('viewController.scene.mustShowTabMenu');
        if(!isAndroid && currentViewControllerIsMenu) {
            return this.get('viewController.scene.application.device.viewBottom') - 48;
        } else {
            return this.get('viewController.scene.application.device.viewBottom');
        }
    }.property(
        'viewController.scene.application.device.platform',
        'viewController.scene.mustShowTabMenu',
        'viewController.scene.application.menu.menuItems.@each',
        'viewController.scene.application.device.viewBottom'
    ),

    screenHeight: function() {
        return this.get('viewBottom') - this.get('viewTop');
    }.property('viewTop', 'viewBottom'),

    availableSpace: function() {
        var controls = this.get('uiPhoneControls');
        var dimension;
        var availableSpace;
        if(!this.get('valid')) {
            return 0;
        }
        if(this.get('axis') === 'horizontal') {
            dimension = 'width';
            availableSpace = this.get('viewController.width');
        } else {
            dimension = 'height';
            availableSpace = this.get('screenHeight');
        }
        var firstMargin, lastMargin;
        if(dimension === 'height') {
            firstMargin = parseFloat(controls.get('firstObject.marginTop'));
            lastMargin = parseFloat(controls.get('lastObject.marginBottom'));
        } else {
            firstMargin = parseFloat(controls.get('firstObject.marginStart'));
            lastMargin = parseFloat(controls.get('lastObject.marginEnd'));
        }
        availableSpace = availableSpace  - firstMargin - lastMargin;
        // WEIGHTED case: availableSpace is the space available for controls
        // ALL other cases: availableSpace is the space available to distribute the controls (empty space)
        if(this.get('type') === 'weighted') {
            return availableSpace - ((controls.get('length') + 1) * this.get('spacing'));
        } else if(this.get('type') === 'packed') {
            var spaceForControls = 0;
            controls.forEach(function(c) {
                spaceForControls = spaceForControls + parseFloat(c.get(dimension));
            });
            return availableSpace - ((controls.get('length') - 1) * this.get('spacing')) - spaceForControls;
        } else {
            var spaceForControls = 0;
            controls.forEach(function(c) {
                spaceForControls = spaceForControls + parseFloat(c.get(dimension));
            });
            return availableSpace - spaceForControls;
        }
    }.property(
        'valid',
        'type',
        'axis',
        'screenHeight',
        'spacing',
        'viewController.width',
        'uiPhoneControls.length',
        'uiPhoneControls.@each.width',
        'uiPhoneControls.@each.height',
        'uiPhoneControls.@each.marginTop',
        'uiPhoneControls.@each.marginBottom',
        'uiPhoneControls.@each.marginStart',
        'uiPhoneControls.@each.marginEnd'
    ),

    spacingCantBeChanged: function() {
        if(!this.get('isDeleted')) {
            return (this.get('type') === 'spread') || (this.get('type') === 'spread_inside');
        }
        return false;
    }.property('type'),

    spacingSet: function() {
        if(!(this.get('isDeleted'))) {
            this.set('spacing', parseFloat(this.get('spacing')));
        }
    }.observes('spacing'),

    byasSet: function() {
        if(!(this.get('isDeleted'))) {
            this.set('byas', parseFloat(this.get('byas')));
        }
    }.observes('byas'),

    getSpreadSpace: function(inside) {
        var controls = this.get('uiPhoneControls');
        var spreadSpace, slots;
        if(inside)  {
            if(controls.get('length') > 1) {
                slots = controls.get('length') - 1;
            } else {
                slots = 1;
            }
        } else {
            slots = controls.get('length') + 1;
        }
        spreadSpace = this.get('availableSpace') / slots;
        return spreadSpace;
    },

    getPackedSpace: function(first) {
        var packedSpace;
        if(first) {
            packedSpace = this.get('availableSpace') * this.get('byas');
        } else {
            packedSpace = this.get('availableSpace') * (1 - this.get('byas'));
        }
        return packedSpace;
    },

    getTopInChain: function(controlId) {
        if(this.get('valid')) {
            var controls = this.get('uiPhoneControls');
            var control = controls.findBy('id', controlId);
            var index = controls.indexOf(control);
            if(this.get('axis') === 'vertical') {
                // Case type: weighted
                if(this.get('type') === 'weighted') {
                    var topInChain;
                    if(index === 0) {
                        topInChain = this.get('viewTop');
                    } else {
                        var precedingControl = controls.objectAt(index - 1);
                        topInChain = parseFloat(precedingControl.get('bottom'));
                    }
                    topInChain = topInChain + this.get('spacing');
                    return topInChain;
                } else if(this.get('type') === 'spread') {
                    // Case type: spread
                    var spreadSpace = this.getSpreadSpace(false);
                    var topInChain;
                    if(index === 0) {
                        topInChain = this.get('viewTop') + spreadSpace;
                    } else {
                        var precedingControl = controls.objectAt(index - 1);
                        topInChain = parseFloat(precedingControl.get('bottom')) + spreadSpace;
                    }
                    return topInChain;
                } else if(this.get('type') === 'spread_inside') {
                    // Case type: spread_inside
                    var spreadSpace = this.getSpreadSpace(true);
                    var topInChain;
                    if(index === 0) {
                        topInChain = this.get('viewTop');
                    } else {
                        var precedingControl = controls.objectAt(index - 1);
                        topInChain = parseFloat(precedingControl.get('bottom')) + spreadSpace;
                    }
                    return topInChain;
                } else if(this.get('type') === 'packed') {
                    // Case type: packed
                    var packedSpaceFirst = this.getPackedSpace(true);
                    var topInChain;
                    if(index === 0) {
                        topInChain = this.get('viewTop') + packedSpaceFirst;
                    } else {
                        var precedingControl = controls.objectAt(index - 1);
                        topInChain = parseFloat(precedingControl.get('bottom')) + this.get('spacing');
                    }
                    return topInChain;
                }
            } else {
                if(index === 0) {
                    return control.getTopWithMargin(true);
                } else {
                    return controls.get('firstObject.topWithMargin');
                }
            }
        } else {
            return 0;
        }
    },

    getBottomInChain: function(controlId, value) {
        if(this.get('valid')) {
            var controls = this.get('uiPhoneControls');
            var control = controls.findBy('id', controlId);
            if(this.get('axis') === 'vertical') {
                // Case type: weighted
                if(this.get('type') === 'weighted') {
                    var availableSpace = this.get('availableSpace');
                    var height = availableSpace / this.get('totalValue') * value;
                    var bottomInChain = parseFloat(control.get('top')) + height + parseFloat(control.get('marginBottom'));
                    control.set('height', height);
                    return bottomInChain;
                } else if(this.get('type') === 'spread') {
                    // Case type: spread
                    return (parseFloat(control.get('topWithMargin')) + parseFloat(control.get('outerHeight')));
                } else if(this.get('type') === 'spread_inside') {
                    // Case type: spread_inside
                    return (parseFloat(control.get('topWithMargin')) + parseFloat(control.get('outerHeight')));
                } else if(this.get('type') === 'packed') {
                    // Case type: packed
                    return (parseFloat(control.get('topWithMargin')) + parseFloat(control.get('outerHeight')));
                }
            } else {
                return parseFloat(control.getBottomWithMargin(true));
            }
        } else {
            return 0;
        }
    },

    getStartInChain: function(controlId) {
        if(this.get('valid')) {
            var controls = this.get('uiPhoneControls');
            var control = controls.findBy('id', controlId);
            var index = controls.indexOf(control);
            if(this.get('axis') === 'horizontal') {
                // Case type: weighted
                if(this.get('type') === 'weighted') {
                    var startInChain;
                    if(index === 0) {
                        startInChain = this.get('viewController.start');
                    } else {
                        var precedingControl = controls.objectAt(index - 1);
                        startInChain = parseFloat(precedingControl.get('end'));
                    }
                    startInChain = startInChain + this.get('spacing');
                    return startInChain;
                } else if(this.get('type') === 'spread') {
                    // Case type: spread
                    var spreadSpace = this.getSpreadSpace(false);
                    var startInChain;
                    if(index === 0) {
                        startInChain = this.get('viewController.start') + spreadSpace;
                    } else {
                        var precedingControl = controls.objectAt(index - 1);
                        startInChain = parseFloat(precedingControl.get('end')) + spreadSpace;
                    }
                    return startInChain;
                } else if(this.get('type') === 'spread_inside') {
                    // Case type: spread_inside
                    var spreadSpace = this.getSpreadSpace(true);
                    var startInChain;
                    if(index === 0) {
                        startInChain = this.get('viewController.start');
                    } else {
                        var precedingControl = controls.objectAt(index - 1);
                        startInChain = parseFloat(precedingControl.get('end')) + spreadSpace;
                    }
                    return startInChain;
                } else if(this.get('type') === 'packed') {
                    // Case type: packed
                    var packedSpaceFirst = this.getPackedSpace(true);
                    var startInChain;
                    if(index === 0) {
                        startInChain = this.get('viewController.start') + packedSpaceFirst;
                    } else {
                        var precedingControl = controls.objectAt(index - 1);
                        startInChain = parseFloat(precedingControl.get('end')) + this.get('spacing');
                    }
                    return startInChain;
                }
            } else {
                if(index === 0) {
                    return control.getStartWithMargin(true);
                } else {
                    return controls.get('firstObject.startWithMargin');
                }
            }
        } else {
            return 0;
        }
    },

    getEndInChain: function(controlId, value) {
        if(this.get('valid')) {
            var controls = this.get('uiPhoneControls');
            var control = controls.findBy('id', controlId);
            if(this.get('axis') === 'horizontal') {
                // Case type: weighted
                if(this.get('type') === 'weighted') {
                    var availableSpace = this.get('availableSpace');
                    var width = availableSpace / this.get('totalValue') * value;
                    var endInChain = parseFloat(control.get('start')) + width + parseFloat(control.get('marginEnd'));
                    control.set('width', width);
                    return endInChain;
                } else if(this.get('type') === 'spread') {
                    // Case type: spread
                    return (parseFloat(control.get('startWithMargin')) + parseFloat(control.get('outerWidth')));
                } else if(this.get('type') === 'spread_inside') {
                    // Case type: spread_inside
                    return (parseFloat(control.get('startWithMargin')) + parseFloat(control.get('outerWidth')));
                } else if(this.get('type') === 'packed') {
                    // Case type: packed
                    return (parseFloat(control.get('startWithMargin')) + parseFloat(control.get('outerWidth')));
                }
            } else {
                return parseFloat(control.getEnd(true));
            }
        } else {
            return 0;
        }
    },

    canMarginTopBeChanged: function(id) {
        if(this.get('valid')) {
            if(this.get('type') === 'spread' || this.get('type') === 'packed') {
                return false;
            }
            var controls = this.get('uiPhoneControls');
            var control = controls.findBy('id', id);
            var index = controls.indexOf(control);
            return index === 0;
        } else {
            return true;
        }
    },

    canMarginBottomBeChanged: function(id) {
        if(this.get('valid')) {
            if(this.get('type') === 'spread' || this.get('type') === 'packed') {
                return false;
            }
            var controls = this.get('uiPhoneControls');
            var control = controls.findBy('id', id);
            var index = controls.indexOf(control);
            return index === (controls.get('length') - 1);
        } else {
            return true;
        }
    },

    canMarginStartBeChanged: function(id) {
        if(this.get('valid')) {
            if(this.get('type') === 'spread' || this.get('type') === 'packed') {
                return false;
            }
            var controls = this.get('uiPhoneControls');
            var control = controls.findBy('id', id);
            var index = controls.indexOf(control);
            return index === 0;
        } else {
            return true;
        }
    },

    canMarginEndBeChanged: function(id) {
        if(this.get('valid')) {
            if(this.get('type') === 'spread' || this.get('type') === 'packed') {
                return false;
            }
            var controls = this.get('uiPhoneControls');
            var control = controls.findBy('id', id);
            var index = controls.indexOf(control);
            return index === (controls.get('length') - 1);
        } else {
            return true;
        }
    },

    getHorizontalSpaceForControls: function() {
        var controls = this.get('uiPhoneControls');
        var spaceForControls = 0;
        controls.forEach(function(c) {
            spaceForControls = spaceForControls + parseFloat(c.get('outerWidth'));
        });
        if(this.get('type') === 'weighted' || this.get('type') === 'packed') {
            spaceForControls = spaceForControls - ((controls.get('length') + 1) * this.get('spacing'));
        }
        return spaceForControls;
    },

    didCreate: function () {
        this._super();
        this.set('name', this.get('id') + '-Chain');
        this.save();
    },

    deleteRecord: function () {
        this.get('uiPhoneControls').forEach(function (uiPhoneControl) {
            Ember.run.once(self, function () {
                uiPhoneControl.deleteRecord();
                uiPhoneControl.save();
            });
        });

        this._super();
    },

    toXml: function (xmlDoc) {
        var chain = xmlDoc.createElement(this.get('xmlName'));
        chain.setAttribute('id', this.get('id'));
        chain.setAttribute('axis', this.get('axis'));
        chain.setAttribute('type', this.get('type'));
        if(this.get('type') === 'packed') {
            chain.setAttribute('byas', this.get('byas'));
        }
        if(this.get('type') === 'packed' || this.get('type') === 'weighted') {
            chain.setAttribute('spacing', this.get('spacing'));
        }
        var controls = this.get('uiPhoneControls');
        var self = this;
        controls.forEach(function(control, index) {
            var elem = xmlDoc.createElement('uiPhoneControl');
            elem.setAttribute('id', control.get('id'));
            elem.setAttribute('type', control.get('xmlName'));
            elem.setAttribute('index', index);
            if(self.get('type') === 'weighted') {
                elem.setAttribute('weight', control.get('valueInChain'));
            }
            chain.appendChild(elem);
        });

        return chain;
    },

    getRefPath: function (path) {
        var updatedPath = '/@' + this.get('xmlName') + '[id=\'' + this.get('id') + '\']';
        return updatedPath;
    },
});
