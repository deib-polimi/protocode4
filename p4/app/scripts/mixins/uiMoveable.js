App.UiMoveable = Ember.Mixin.create({
  isMoving: false,
  classNameBindings: ['isMoving'],

  offsetMouseX: 0,
  offsetMouseY: 0,

  mouseDown: function(event) {
    event.preventDefault();
    this.set('isMoving', true);

    var elementOffset = $(this.get('element')).offset();
    this.set('offsetMouseX', (event.pageX - elementOffset.left));
    this.set('offsetMouseY', (event.pageY - elementOffset.top));

    var self = this;

    // For smartphone's view
    $('.smartphone-screen-view').on('mousemove', function(event) {
      var element = self.get('element');
      var parentOffset = $(self.get('parentView.element')).offset();
      var posX = (((event.pageX - parentOffset.left - self.get('offsetMouseX')) / self.get('controller.zoomLevel')) - self.get('context.marginStart')) * self.get('device.screenWidth') / self.get('device.cssWidth');
      var posY = (((event.pageY - parentOffset.top - self.get('offsetMouseY')) / self.get('controller.zoomLevel')) - self.get('context.marginTop')) * self.get('device.screenHeight') / self.get('device.cssHeight');

      if (self.get('context.parentContainer') === null) {
        posY -= self.get('device.viewTop');
      }

      var menuTop = 0;
      var menuBottom = 0;
      if(self.get('context.viewController.scene.mustShowTabMenu')) {
          if(self.get('device.platform') === 'android') {
              menuTop = 48;
          } else {
              menuBottom = 48;
          }
      }
      if(posY < menuTop) {
        posY = menuTop;
      }
      if(posX < 0) {
        posX = 0;
      }
      if((posX + self.get('context.outerWidth')) > self.get('device.screenWidth')) {
          posX = self.get('device.screenWidth') - self.get('context.outerWidth');
      }
      if((posY + self.get('context.outerHeight')) > (self.get('device.viewBottom') - self.get('device.viewTop') - menuBottom)) {
          posY = self.get('device.viewBottom') - self.get('device.viewTop') - self.get('context.outerHeight') - menuBottom;
      }

      self.set('context.posX', posX);
      self.set('context.posY', posY);
    });

    // For tablet's view
    $('.tablet-screen-view').on('mousemove', function(event) {
      var element = self.get('element');
      var parentOffset = $(self.get('parentView.element')).offset();
      var posX = (((event.pageX - parentOffset.left - self.get('offsetMouseX')) / self.get('controller.zoomLevel')) - self.get('context.marginStart') - self.get('vcStart')) * self.get('device.screenWidth') / self.get('device.cssWidth');
      var posY = (((event.pageY - parentOffset.top - self.get('offsetMouseY')) / self.get('controller.zoomLevel')) - self.get('context.marginTop')) * self.get('device.screenHeight') / self.get('device.cssHeight');

      if (self.get('context.parentContainer') === null) {
        posY -= self.get('device.viewTop');
      }

      var menuTop = 0;
      var menuBottom = 0;
      if(self.get('context.viewController.scene.mustShowTabMenu')) {
          if(self.get('device.platform') === 'android') {
              menuTop = 48;
          } else {
              menuBottom = 48;
          }
      }
      if(posY < menuTop) {
        posY = menuTop;
      }
      if(posX < 0) {
        posX = 0;
      }
      if((posX + self.get('context.outerWidth')) > self.get('vcWidth')) {
          posX = self.get('vcWidth') - self.get('context.outerWidth');
      }
      if((posY + self.get('context.outerHeight')) > (self.get('device.viewBottom') - self.get('device.viewTop') - menuBottom)) {
          posY = self.get('device.viewBottom') - self.get('device.viewTop') - self.get('context.outerHeight') - menuBottom;
      }

      self.set('context.posX', posX);
      self.set('context.posY', posY);
    });

    return false;
  },

  mouseUp: function(event) {
    event.preventDefault();
    this.set('isMoving', false);
    this.get('context').save();
    // For smartphone's view
    $('.smartphone-screen-view').off('mousemove');
    // For tablet's view
    $('.tablet-screen-view').off('mousemove');
  }
});
