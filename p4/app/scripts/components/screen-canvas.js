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
                this.drawAllConstraints(selectedId);
            } else if(selectedType === 'constraints') {
                this.clear();
                /*var controls = this.get('model.uiPhoneControls').then(function(controls) {
                    console.log('OOOO');
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
                    console.log('OOOO ' + control + ' ' + constraint);
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
    }.observes('router.location.lastSetURL'),

    drawAllConstraints: function(id) {
        var self = this;
        var controls = this.get('model.uiPhoneControls').then(function(controls) {
            var control = controls.find(function(control) {return control.get('id') === id});
            var constraints = control.get('constraints').filter(function(c) {
                return c.get('valid') && ((!c.get('isDirty') || c.get('isSaving')));
            });

            if(constraints) {
                constraints.forEach(function(constraint) {
                    self.drawConstraint(constraint, control);
                });
            }
        });
    },

    drawConstraint: function(constraint, control) {
        var ctx = this.get('ctx');
        if(ctx) {
            ctx.fillStyle = "#00ff00";
            var plus = 7
            if(constraint.get('withParent')) {
                if(constraint.get('layoutEdge') === 'top') {
                    var startX = control.get('start') + ((control.get('end') - control.get('start')) / 2);
                    var endY = constraint.get('value') + plus;
                    ctx.fillRect(startX, this.get('device.viewTop'), 2, endY);
                } else if(constraint.get('layoutEdge') === 'bottom') {
                    var startX = control.get('start') + ((control.get('end') - control.get('start')) / 2);
                    var endY = - constraint.get('value') + plus;
                    ctx.fillRect(startX, control.get('bottom') - plus, 2, endY);
                } else if(constraint.get('layoutEdge') === 'start') {
                    var startY = control.get('top') + ((control.get('bottom') - control.get('top')) / 2);
                    var endX = constraint.get('value') + plus;
                    ctx.fillRect(0, startY, endX, 2);
                } else if(constraint.get('layoutEdge') === 'end') {
                    var startY = control.get('top') + ((control.get('bottom') - control.get('top')) / 2);
                    var endX = - constraint.get('value') + plus;
                    ctx.fillRect(control.get('end') - plus, startY, endX, 2);
                } else if(constraint.get('layoutEdge') === 'centerX') {
                    ctx.fillStyle = "#0000ff";
                    var startY = control.get('top') + ((control.get('bottom') - control.get('top')) / 2);
                    var endX = control.get('start') + plus;
                    ctx.fillRect(0, startY, endX, 2);
                    endX = this.get('width') - control.get('end') + plus;
                    ctx.fillRect(control.get('end') - plus, startY, endX, 2);
                    ctx.fillStyle = "#00ff00";
                } else if(constraint.get('layoutEdge') === 'centerY') {
                    ctx.fillStyle = "#0000ff";
                    var startX = control.get('start') + ((control.get('end') - control.get('start')) / 2);
                    var endY = control.get('top') - this.get('device.viewTop') + plus;
                    ctx.fillRect(startX, this.get('device.viewTop'), 2, endY);
                    endY = this.get('device.viewBottom') - control.get('bottom') + plus;
                    ctx.fillRect(startX, control.get('bottom') - plus, 2, endY);
                    ctx.fillStyle = "#00ff00";
                    //console.log('AAAA ' + startX + ' ' + control.get('top') + ' ' + control.get('bottom') + ' ' + this.get('device.viewTop') + ' ' + this.get('device.viewBottom'));
                }
            } else {

            }
        }
    },

    clear: function() {
        var ctx = this.get('ctx');
        if(ctx) {
            ctx.fillStyle = '#fff';
            ctx.clearRect(0, 0, this.get('width'), this.get('height'));
        }
    }
});
