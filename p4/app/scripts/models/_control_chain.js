App.ControlChain = DS.Model.extend({
    viewController: DS.belongsTo('viewController', {inverse: 'controlChains'}),

    axis: DS.attr('string'),
    type: DS.attr('string'),
    spacing: DS.attr('number', {defaultValue: 0}),
    byas: DS.attr('number', {defaultValue: 0.5}),
    uiPhoneControls: DS.hasMany('uiPhoneControl', {polymorphic: true}),

    xmlName: 'controlChain',

    valid: function() {
        if(!this.get('isDeleted')) {
            if(this.get('axis') && this.get('type')) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }.property('axis', 'type'),

    name: function() {
        var name = 'chain:';
        var controls = this.get('uiPhoneControls');
        controls.forEach(function(c, index) {
            name = name + c.get('name');
            if(index < (controls.get('length') - 1)) {
                name = name + '-';
            }
        });
        return name;
    }.property('uiPhoneControls.@each'),

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
        var isAndroid = this.get('viewController.application.smartphone.platform') === 'android';
        // Compute if the viewController has the menu bar
        var currentViewControllerIsMenu = this.get('viewController.hasMenu');
        if(isAndroid && currentViewControllerIsMenu) {
            return this.get('viewController.application.smartphone.viewTop') + 48;
        } else {
            return this.get('viewController.application.smartphone.viewTop');
        }
    }.property(
        'viewController.application.smartphone.platform',
        'viewController.hasMenu',
        'viewController.application.smartphone.viewTop'
    ),

    viewBottom: function() {
        var isAndroid = this.get('viewController.application.smartphone.platform') === 'android';
        // Compute if the viewController has the menu bar
        var currentViewControllerIsMenu = this.get('viewController.hasMenu');
        if(!isAndroid && currentViewControllerIsMenu) {
            return this.get('viewController.application.smartphone.viewBottom') - 48;
        } else {
            return this.get('viewController.application.smartphone.viewBottom');
        }
    }.property(
        'viewController.application.smartphone.platform',
        'viewController.hasMenu',
        'viewController.application.menu.menuItems.@each',
        'viewController.application.smartphone.viewBottom'
    ),

    screenHeight: function() {
        return this.get('viewBottom') - this.get('viewTop');
    }.property('viewTop', 'viewBottom'),

    availableSpace: function() {
        var controls = this.get('uiPhoneControls');
        var dimension;
        if(this.get('axis') === 'horizontal') {
            dimension = 'width';
        } else if(this.get('axis') === 'vertical') {
            dimension = 'height';
        } else {
            return 0;
        }
        var spaceForControls = 0;
        controls.forEach(function(c) {
            spaceForControls = spaceForControls + parseFloat(c.get(dimension));
        });
        if(dimension === 'height') {
            return this.get('screenHeight') - spaceForControls;
        } else {
            return this.get('viewController.application.smartphone.screenWidth') - spaceForControls;
        }
    }.property(
        'axis',
        'screenHeight',
        'viewController.application.smartphone.screenWidth',
        'uiPhoneControls.@each.width',
        'uiPhoneControls.@each.height'
    ),

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

    getSpreadSpace: function(dimension, inside) {
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

    getPackedSpace: function(dimension, first) {
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
            var control = this.get('uiPhoneControls').findBy('id', controlId);
            var index = this.get('uiPhoneControls').indexOf(control);
            if(this.get('axis') === 'vertical') {
                // Case type: weighted
                if(this.get('type') === 'weighted') {
                    var topInChain;
                    if(index === 0) {
                        topInChain = this.get('viewTop');
                    } else {
                        var precedingControl = this.get('uiPhoneControls').objectAt(index - 1);
                        topInChain = parseFloat(precedingControl.get('bottom'));
                    }
                    topInChain = topInChain + this.get('spacing');
                    return topInChain;
                } else if(this.get('type') === 'spread') {
                    // Case type: spread
                    var spreadSpace = this.getSpreadSpace('height', false);
                    var topInChain;
                    if(index === 0) {
                        topInChain = this.get('viewTop') + spreadSpace;
                    } else {
                        var precedingControl = this.get('uiPhoneControls').objectAt(index - 1);
                        topInChain = parseFloat(precedingControl.get('bottom')) + spreadSpace;
                    }
                    topInChain = topInChain + this.get('spacing');
                    return topInChain;
                } else if(this.get('type') === 'spread_inside') {
                    // Case type: spread_inside
                    var spreadSpace = this.getSpreadSpace('height', true);
                    var topInChain;
                    if(index === 0) {
                        topInChain = this.get('viewTop');
                    } else {
                        var precedingControl = this.get('uiPhoneControls').objectAt(index - 1);
                        topInChain = parseFloat(precedingControl.get('bottom')) + spreadSpace;
                    }
                    topInChain = topInChain + this.get('spacing');
                    return topInChain;
                } else if(this.get('type') === 'packed') {
                    // Case type: packed
                    var packedSpaceFirst = this.getPackedSpace('height', true);
                    var topInChain;
                    if(index === 0) {
                        topInChain = this.get('viewTop') + packedSpaceFirst;
                    } else {
                        var precedingControl = this.get('uiPhoneControls').objectAt(index - 1);
                        topInChain = parseFloat(precedingControl.get('bottom'));
                    }
                    topInChain = topInChain;
                    return topInChain;
                }
            } else {
                if(index === 0) {
                    return control.getTop(true);
                } else {
                    return this.get('uiPhoneControls.firstObject.top');
                }
            }
        } else {
            return 0;
        }
    },

    getBottomInChain: function(controlId, value) {
        if(this.get('valid')) {
            var control = this.get('uiPhoneControls').findBy('id', controlId);
            if(this.get('axis') === 'vertical') {
                // Case type: weighted
                if(this.get('type') === 'weighted') {
                    var availableSpace = this.get('screenHeight') - ((this.get('uiPhoneControls.length') + 1) * this.get('spacing'));
                    var height = availableSpace / this.get('totalValue') * value;
                    var bottomInChain = parseFloat(control.get('top')) + height;
                    return bottomInChain;
                } else if(this.get('type') === 'spread') {
                    // Case type: spread
                    return (parseFloat(control.get('top')) + parseFloat(control.get('height')));
                } else if(this.get('type') === 'spread_inside') {
                    // Case type: spread_inside
                    return (parseFloat(control.get('top')) + parseFloat(control.get('height')));
                } else if(this.get('type') === 'packed') {
                    // Case type: packed
                    return (parseFloat(control.get('top')) + parseFloat(control.get('height')));
                }
            } else {
                return parseFloat(control.getBottom(true));
            }
        } else {
            return 0;
        }
    },

    getStartInChain: function(controlId) {
        if(this.get('valid')) {
            var control = this.get('uiPhoneControls').findBy('id', controlId);
            var index = this.get('uiPhoneControls').indexOf(control);
            if(this.get('axis') === 'horizontal') {
                // Case type: weighted
                if(this.get('type') === 'weighted') {
                    var startInChain;
                    if(index === 0) {
                        startInChain = 0;
                    } else {
                        var precedingControl = this.get('uiPhoneControls').objectAt(index - 1);
                        startInChain = parseFloat(precedingControl.get('end'));
                    }
                    startInChain = startInChain + this.get('spacing');
                    return startInChain;
                } else if(this.get('type') === 'spread') {
                    // Case type: spread
                    var spreadSpace = this.getSpreadSpace('width', false);
                    var startInChain;
                    if(index === 0) {
                        startInChain = spreadSpace;
                    } else {
                        var precedingControl = this.get('uiPhoneControls').objectAt(index - 1);
                        startInChain = parseFloat(precedingControl.get('end')) + spreadSpace;
                    }
                    startInChain = startInChain + this.get('spacing');
                    return startInChain;
                } else if(this.get('type') === 'spread_inside') {
                    // Case type: spread_inside
                    var spreadSpace = this.getSpreadSpace('width', true);
                    var startInChain;
                    if(index === 0) {
                        startInChain = 0;
                    } else {
                        var precedingControl = this.get('uiPhoneControls').objectAt(index - 1);
                        startInChain = parseFloat(precedingControl.get('end')) + spreadSpace;
                    }
                    startInChain = startInChain + this.get('spacing');
                    return startInChain;
                } else if(this.get('type') === 'packed') {
                    // Case type: packed
                    var packedSpaceFirst = this.getPackedSpace('width', true);
                    var startInChain;
                    if(index === 0) {
                        startInChain = packedSpaceFirst;
                    } else {
                        var precedingControl = this.get('uiPhoneControls').objectAt(index - 1);
                        startInChain = parseFloat(precedingControl.get('end'));
                    }
                    startInChain = startInChain;
                    return startInChain;
                }
            } else {
                if(index === 0) {
                    return control.getStart(true);
                } else {
                    return this.get('uiPhoneControls.firstObject.start');
                }
            }
        } else {
            return 0;
        }
    },

    getEndInChain: function(controlId, value) {
        if(this.get('valid')) {
            var control = this.get('uiPhoneControls').findBy('id', controlId);
            if(this.get('axis') === 'horizontal') {
                // Case type: weighted
                if(this.get('type') === 'weighted') {
                    var availableSpace = this.get('viewController.application.smartphone.screenWidth') - ((this.get('uiPhoneControls.length') + 1) * this.get('spacing'));
                    var width = availableSpace / this.get('totalValue') * value;
                    var endInChain = parseFloat(control.get('start')) + width;
                    return endInChain;
                } else if(this.get('type') === 'spread') {
                    // Case type: spread
                    return (parseFloat(control.get('start')) + parseFloat(control.get('width')));
                } else if(this.get('type') === 'spread_inside') {
                    // Case type: spread_inside
                    return (parseFloat(control.get('start')) + parseFloat(control.get('width')));
                } else if(this.get('type') === 'packed') {
                    // Case type: packed
                    return (parseFloat(control.get('start')) + parseFloat(control.get('width')));
                }
            } else {
                return parseFloat(control.getEnd(true));
            }
        } else {
            return 0;
        }
    },

    toXml: function (xmlDoc) {
        var chain = xmlDoc.createElement(this.get('xmlName'));
        chain.setAttribute('id', this.get('id'));
        chain.setAttribute('axis', this.get('axis'));
        chain.setAttribute('type', this.get('type'));
        if(this.get('type') === 'packed') {
            chain.setAttribute('byas', this.get('byas'));
        }
        chain.setAttribute('spacing', this.get('spacing'));
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
