App.TabletScreenView = Ember.View.extend(App.UiDroppable, {
  tagName: 'div',
  attributeBindings: ['style'],
  classNames: ['tablet-screen-view'],
  templateName: 'views/tablet_screen_view',

  style: function() {
    var style = "";
    style += 'background-color: ' + this.get('context.backgroundColor') + ";";
  	return style;
  }.property(
  	'context.backgroundColor'
  )

});
