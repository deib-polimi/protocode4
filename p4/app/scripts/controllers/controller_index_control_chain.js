/*
 templates/control_chain/index.hbs
 */
App.ControlChainIndexController = Ember.ObjectController.extend(App.Saveable, {
    needs: ['scenes'],
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
        'photocameraController',
        'videocameraController',
        'audioRecorder',
        'map',
        'datepicker',
        'timepicker'/*,
        'listView',
        'gridView',
        'card'*/
    ],
    newControlType: null,

    // USED by partial _invalid_report.hbs
    invalidReport: function() {
        if(!this.get('model.valid')) {
            return 'Chain is invalid due to the number of phone controls:\nit contains only '
                + this.get('model.uiPhoneControls.length') +
                ' controls (control chains must have at least 2 phone controls).';
        }
        return null;
    }.property(
        'model.valid',
        'model.uiPhoneControls.length'
    ),
    // END partial _invalid_report.hbs

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
                Ember.run.once(this, function () {
                    uiPhoneControls.removeObject(c);
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
