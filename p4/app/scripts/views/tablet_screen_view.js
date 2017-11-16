App.TabletScreenView = Ember.View.extend(App.UiDroppable, {
  tagName: 'div',
  attributeBindings: ['style'],
  classNames: ['tablet-screen-view'],
  classNameBindings: ['isRotated'],
  templateName: 'views/tablet_screen_view',

  isRotated: function() {
      if(this.get('context.isRotated')) {
          return 'rotated';
      } else {
          return '';
      }
  }.property('context.isRotated'),

  style: function() {
    var style = "";
    style += 'background-color: ' + this.get('context.backgroundColor') + ";";
  	return style;
  }.property(
  	'context.backgroundColor'
  )

});
