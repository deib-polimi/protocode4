App.UiGridViewView = Ember.View.extend({
  tagName: 'div',
  classNames: ['control-grid-view', 'expanded'],
  classNameBindings: ['controller.controllers.editor.smartphone.platform'],
  templateName: 'views/ui_phone_control_view_grid_view'
});