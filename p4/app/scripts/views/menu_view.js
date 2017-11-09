App.MenuView = Ember.View.extend({
  tagName: 'div',
  classNames: ['app-menu'],
  classNameBindings: ['controller.controllers.editor.smartphone.platform'],
  templateName: 'views/menu_view',

  attributeBindings: ['style'],

  style: function() {
    var currentViewControllerIsMenu = this.get('context.hasMenu');

    var style = "";

    if(!currentViewControllerIsMenu) {
        style += "display:none";
    }

    return style;
  }.property(
    'context.hasMenu'
  )

});
