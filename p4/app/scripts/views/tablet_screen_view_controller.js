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
    var style;
    // Set top
    style = "top:" + (this.get('context.top') - 1) + "px;";
    // Set height
    style = style + "height:" + this.get('context.height') + "px;";
    // Set left & width
    style = style + "left:" + this.get('context.start') + "px;width:" + this.get('context.width') + "px;";
    // Set color
    style += 'background-color: ' + this.get('context.backgroundColor') + ";";
  	return style;
  }.property(
  	'context.backgroundColor',
    'context.top',
    'context.height',
    'context.start',
    'context.width'
  )

});
