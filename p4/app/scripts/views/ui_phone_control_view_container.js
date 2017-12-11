App.UiContainerView = Ember.View.extend({
  tagName: 'div',
  classNames: ['control-container', 'expanded'],
  classNameBindings: ['controller.controllers.editor.device.platform'],
  templateName: 'views/ui_phone_control_view_container',

  click: function(evt) {
      var idPrefix = evt.target.id;
      idPrefix = (idPrefix.split('-'))[0];
      if(idPrefix === 'Container') {
          this.get('controller').send('transitionToRoute', 'controlContainer', this.get('context'));
      }
  }

});
