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

    currentRouteIsViewController: function() {
        var path = this.get('target.location.lastSetURL');
        if(!path) {
            path = this.get('target.url');
        }
        if(path) {
            var splittedPath = path.split('/');
            return splittedPath[3] === 'viewController';
        }
        return false;
    }.property(
        'target.location.lastSetURL'
    ),

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
        }
    }
});
