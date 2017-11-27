App.TabletScreenViewController = Ember.View.extend(App.UiDroppable, {
  tagName: 'div',
  attributeBindings: ['style'],
  classNames: ['tablet-screen-view-controller'],
  classNameBindings: ['isRotated'],

  isRotated: function() {
      if(this.get('context.isRotated')) {
          return 'rotated';
      } else {
          return '';
      }
  }.property('context.isRotated'),

  style: function() {
    var style = "";
    var menuOffset = 0;
    if(this.get('context.hasTabMenu')) {
        menuOffset = 48;
    }
    // Set top
    if(this.get('context.scene.application.device.platform') === 'ios') {
        style = "top:" + (this.get('context.scene.application.device.viewTop') - 1) + "px;";
    } else {
        style = "top:" + (this.get('context.scene.application.device.viewTop') + menuOffset - 1) + "px;";
    }
    // Set height
    var height = this.get('context.scene.application.device.viewBottom') - this.get('context.scene.application.device.viewTop') - menuOffset;
    style = style + "height:" + height + "px;";
    // Set left & width
    style = style + "left:" + this.get('context.startInScreen') + "px;width:" + this.get('context.width') + "px;";
    // Set color
    style += 'background-color: ' + this.get('context.backgroundColor') + ";";
  	return style;
  }.property(
  	'context.backgroundColor',
    'context.hasTabMenu',
    'context.scene.application.device.platform',
    'context.scene.application.device.viewTop',
    'context.scene.application.device.viewBottom',
    'context.startInScreen',
    'context.width'
  )

});
