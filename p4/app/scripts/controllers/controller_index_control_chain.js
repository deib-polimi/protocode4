/*
 templates/control_chain/index.hbs
 */
App.ControlChainIndexController = Ember.ObjectController.extend(App.Saveable, {
    needs: ['viewControllers'],
    axises: ['horizontal', 'vertical'],
    types: ['spread', 'spread_inside', 'packed', 'weighted'],
    uiControlTypes: [
        'button',
        'label',
        'editText',
        'spinner',
        'switch',
        'slider',
        'webView',
        'imageView',
        'videoView',
        'audioPlayer',
        'listView',
        'gridView',
        'photocameraController',
        'videocameraController',
        'audioRecorder',
        'map',
        'datepicker',
        'timepicker',
        'card'
    ],
    newControlType: null,

    actions: {
        addControl: function() {
            var chain = this.get('model');
            if(this.get('newControlType')) {
                var newControl = this.store.createRecord(this.get('newControlType'), {
                    viewController: chain.get('viewController'),
                    controlChain: chain,
                    valueInChain: 1,
                    ratioWidth: 1,
                    ratioHeight: 1
                });
                chain.get('uiPhoneControls').pushObject(newControl);
                newControl.save();
                chain.get('viewController').save();
                chain.save();
            }
        },

        delete: function () {
            var chainToDelete = this.get('model');
            var viewController = chainToDelete.get('viewController');
            var uiPhoneControls = chainToDelete.get('uiPhoneControls');
            uiPhoneControls.forEach(function(c) {
                Ember.run.once(self, function () {
                    viewController.get('uiPhoneControls').removeObject(c);
                    viewController.save();
                    c.deleteRecord();
                    c.save();
                });
            });
            viewController.get('controlChains').removeObject(chainToDelete);
            viewController.save();
            this.get('model').deleteRecord();
            this.get('model').save();
            this.transitionToRoute('viewController', viewController);
        }
    }
});
