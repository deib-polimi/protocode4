App.MenuItemView = Ember.View.extend({
  tagName: 'div',
  classNames: ['app-menu-item'],
  classNameBindings: ['controller.controllers.editor.smartphone.platform'],
  templateName: 'views/menu_item_view',

  attributeBindings: ['style'],

  style: function() {
    var style = "";

    return style;
  }.property(
    'controller.controllers.editor.smartphone.platform',
    'context.navigation.destination.name',
    'controller.name'
  )

});
