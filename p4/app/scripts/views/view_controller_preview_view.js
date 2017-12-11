App.ViewControllerPreviewView = Ember.View.extend(App.UiDroppable, {
  tagName: 'div',
  attributeBindings: ['style'],
  classNames: ['view-controller-preview-view'],
  classNameBindings: ['isRotated'],
  templateName: 'views/view_controller_preview_view',

  viewController: function() {
      if(this.get('context').constructor.toString() === 'App.SceneController') {
          return this.get('controller.viewControllerToShow');
      }
      return this.get('context.childViewController');
  }.property(
      'context',
      'controller.viewControllerToShow',
      'context.childViewController'
  ),

  click: function(evt) {
      //console.log('ooo '+this.get('context').constructor.toString());
      if(evt.target.id === 'view-controller-background') {
          this.get('controller').send('transitionToRoute', 'viewController', this.get('viewController'));
      }
  },

  style: function() {
    var style = "", viewController;
    if(this.get('context').constructor.toString() === 'App.SceneController') {
        // Set top
        style = style + "top:" + this.get('viewController.top') + "px;";
        // Set start
        style = style + "left:" + this.get('viewController.start') + "px;";
        // Set height
        style = style + "height:" + this.get('viewController.height') + "px;";
        // Set width
        style = style + "width:" + this.get('viewController.width') + "px;";
    } else {
        // Set height
        style = style + "top:0px;height:" + this.get('viewController.height') + "px;";
        // Set width
        style = style + "left:0px;width:" + this.get('viewController.width') + "px;";
    }
    // Set color
    style += 'background-color: ' + this.get('viewController.backgroundColor') + ";";
  	return style;
  }.property(
  	'viewController.backgroundColor',
    'viewController.top',
    'viewController.height',
    'viewController.start',
    'viewController.width'
  )

});
