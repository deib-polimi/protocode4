App.ScreenCanvasComponent = Ember.Component.extend({
    tagName: "canvas",
    attributeBindings: ['width','height'],
    classNames: ['screen-canvas'],
    routerBinding: 'controller.target',
    uiControlTypes: [
        'button',
        'label',
        'editText',
        'spinner',
        'switch',
        'slider',
        'webView',
        'imageView',
        'videoView',
        'audioPlayer',
        'listView',
        'gridView',
        'photocameraController',
        'videocameraController',
        'audioRecorder',
        'map',
        'datepicker',
        'timepicker',
        'card'
    ],
    ctx: null,

    device: function() {
        return this.get('model.application.smartphone');
    }.property('model.application.smartphone'),

    width: function() {
        return this.get('device.screenWidth');
    }.property('device.screenWidth'),

    height: function() {
        return this.get('device.screenHeight');
    }.property('device.screenHeight'),

    didInsertElement: function() {
        this.set('ctx', this.get('element').getContext('2d'));
        this.clear();
    },

    onSomethingSelected: function() {
        var path = this.get('router.location.lastSetURL');
        var self = this;
        if(path) {
            var splittedPath = path.split('/');
            var selectedType = splittedPath[splittedPath.get('length') - 2];
            var selectedId = splittedPath.get('lastObject');
            //console.log('OOOO ' + path + ' ' + selectedType + ' ' + selectedId + ' ' + this.get('uiControlTypes').find(function(type) {return type === selectedType;}));
            if(this.get('uiControlTypes').find(function(type) {return type === selectedType;}) !== undefined) {
                this.clear();
                this.drawAllConstraints(selectedId);
            } else if(selectedType === 'constraints') {
                this.clear();
                /*var controls = this.get('model.uiPhoneControls').then(function(controls) {
                    var constraint = null;
                    var control = controls.find(function(control) {
                        var flag = false;
                        var thisControlConstraints = control.get('constraints');
                        if(thisControlConstraints) {
                            thisControlConstraints.forEach(function(c) {
                                if(!flag) {
                                    flag = c.get('id') === selectedId;
                                    if(flag) {
                                        constraint = c;
                                    }
                                }
                            });
                        }
                        return flag;
                    });
                    if(control !== undefined && constraint !== null) {
                        self.drawConstraint(constraint, control);
                    }
                });*/
            } else {
                this.clear();
            }
        } else {
            this.clear();
        }
    }.observes(
        'router.location.lastSetURL',
        'model.uiPhoneControls.@each.isWidthConstrained',
        'model.uiPhoneControls.@each.isHeightConstrained',
        'model.uiPhoneControls.@each.isRatioConstrained',
        'model.uiPhoneControls.@each.posX',
        'model.uiPhoneControls.@each.posY',
        'model.uiPhoneControls.@each.width',
        'model.uiPhoneControls.@each.height',
        'model.uiPhoneControls.@each.ratioWidth',
        'model.uiPhoneControls.@each.ratioHeight'
    ).on('init'),

    drawAllConstraints: function(id) {
        var self = this;
        var controls = this.get('model.uiPhoneControls').then(function(controls) {
            var control = controls.find(function(control) {return control.get('id') === id});
            if(control !== undefined) {
                var constraints = control.get('constraints').filter(function(c) {
                    return c.get('valid') && ((!c.get('isDirty') || c.get('isSaving')));
                });

                // Draw position constraints
                if(constraints) {
                    constraints.forEach(function(constraint) {
                        self.drawConstraint(constraint, control);
                    });
                }

                // Draw dimension constraints
                var ctx = self.get('ctx');
                if(ctx) {
                    ctx.fillStyle = "#ff0000";
                    if(control.get('isWidthConstrained')) {
                        ctx.fillRect(control.get('start'), control.get('top') - 2, control.get('outerWidth'), 2);
                        ctx.fillRect(control.get('start'), control.get('bottom'), control.get('outerWidth'), 2);
                    }
                    if(control.get('isHeightConstrained')) {
                        ctx.fillRect(control.get('start') - 2, control.get('top'), 2, control.get('outerHeight'));
                        ctx.fillRect(control.get('end'), control.get('top'), 2, control.get('outerHeight'));
                    }
                    ctx.fillStyle = "#ff00ff";
                    if(control.get('isRatioConstrained')) {
                        ctx.fillRect(control.get('start') - 2, control.get('top') - 2, 12, 2);
                        ctx.fillRect(control.get('start') - 2, control.get('top') - 2, 2, 12);
                        ctx.fillRect(control.get('end') - 10, control.get('bottom'), 12, 2);
                        ctx.fillRect(control.get('end'), control.get('bottom') - 10, 2, 12);
                    }
                }
            }
        });
    },

    drawConstraint: function(constraint, control) {
        var ctx = this.get('ctx');
        if(ctx) {
            ctx.fillStyle = "#00ff00";
            var plus = 7
            if(constraint.get('withParent')) {
                var isIOS = this.get('model.application.smartphone.platform') === 'ios';
                // Compute if the viewController has the menu bar
                var currentViewControllerIsMenu = false;
                var viewControllerName = this.get('model.name');
                var menuItems = this.get('model.application.menu.menuItems');
                menuItems.forEach(function (menuItem, index) {
                    if (viewControllerName === menuItem.get('navigation.destination.name')) {
                        currentViewControllerIsMenu = true;
                    }
                });
                var viewTop = this.get('device.viewTop');
                if(currentViewControllerIsMenu && !isIOS) {
                    viewTop = viewTop + 48;
                }
                var viewBottom = this.get('device.viewBottom');
                if(currentViewControllerIsMenu && isIOS) {
                    viewBottom = viewBottom - 48;
                }
                if(constraint.get('layoutEdge') === 'top') {
                    var startX = control.get('start') + (control.get('computedWidth') / 2);
                    var endY = constraint.get('value') + plus;
                    ctx.fillRect(startX, viewTop, 2, endY);
                } else if(constraint.get('layoutEdge') === 'bottom') {
                    var startX = control.get('start') + (control.get('computedWidth') / 2);
                    var endY = - constraint.get('value') + plus;
                    ctx.fillRect(startX, control.get('bottom') - plus, 2, endY);
                } else if(constraint.get('layoutEdge') === 'start') {
                    var startY = control.get('top') + (control.get('computedHeight') / 2);
                    var endX = constraint.get('value') + plus;
                    ctx.fillRect(0, startY, endX, 2);
                } else if(constraint.get('layoutEdge') === 'end') {
                    var startY = control.get('top') + (control.get('computedHeight') / 2);
                    var endX = - constraint.get('value') + plus;
                    ctx.fillRect(control.get('end') - plus, startY, endX, 2);
                } else if(constraint.get('layoutEdge') === 'centerX') {
                    ctx.fillStyle = "#ffff00";
                    var startY = control.get('top') + (control.get('computedHeight') / 2);
                    var endX = control.get('start') + plus;
                    ctx.fillRect(0, startY, endX, 2);
                    endX = this.get('computedWidth') - control.get('end') + plus;
                    ctx.fillRect(control.get('end') - plus, startY, endX, 2);
                    ctx.fillStyle = "#00ff00";
                } else if(constraint.get('layoutEdge') === 'centerY') {
                    ctx.fillStyle = "#ffff00";
                    var startX = control.get('start') + (control.get('computedWidth') / 2);
                    var endY = control.get('top') - viewTop + plus;
                    ctx.fillRect(startX, viewTop, 2, endY);
                    endY = this.get('device.viewBottom') - control.get('bottom') + plus;
                    ctx.fillRect(startX, control.get('bottom') - plus, 2, endY);
                    ctx.fillStyle = "#00ff00";
                    //console.log('AAAA ' + startX + ' ' + control.get('top') + ' ' + control.get('bottom') + ' ' + this.get('device.viewTop') + ' ' + this.get('device.viewBottom'));
                }
            } else {
                var x, y;
                var color = this.getColor();
                var r = 5;
                if(constraint.get('layoutEdge') === 'top' || constraint.get('layoutEdge') === 'bottom') {
                    x = control.get('start') + (control.get('computedWidth') / 2);
                    y = control.get(constraint.get('layoutEdge'));
                } else if(constraint.get('layoutEdge') === 'start' || constraint.get('layoutEdge') === 'end') {
                    x = control.get(constraint.get('layoutEdge'));
                    y = control.get('top') + (control.get('computedHeight') / 2);
                }
                this.drawCircle(x, y, r, color);
                if(constraint.get('referenceLayoutEdge') === 'top' || constraint.get('referenceLayoutEdge') === 'bottom') {
                    x = constraint.get('referenceElement.start') + (constraint.get('referenceElement.computedWidth') / 2);
                    y = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge'));
                } else if(constraint.get('referenceLayoutEdge') === 'start' || constraint.get('referenceLayoutEdge') === 'end') {
                    x = constraint.get('referenceElement.' + constraint.get('referenceLayoutEdge'));
                    y = constraint.get('referenceElement.top') + (constraint.get('referenceElement.computedHeight') / 2);
                }
                this.drawCircle(x, y, r, color);
            }
        }
    },

    drawCircle: function(x, y, radius, color) {
        var ctx = this.get('ctx');
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2*Math.PI);
        ctx.stroke();
        ctx.fill();
    },

    getColor: function() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },

    clear: function() {
        var ctx = this.get('ctx');
        if(ctx) {
            ctx.fillStyle = '#fff';
            ctx.clearRect(0, 0, this.get('width'), this.get('height'));
        }
    }
});
