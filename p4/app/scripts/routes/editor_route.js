/*
 templates/editor.hbs
 */
App.EditorRoute = Ember.Route.extend({

    setupController: function (controller, model) {
        this._super(controller, model);
        controller.set('model', model.application);
        var devices = (model.smartphones).addObjects(model.tablets);
        controller.set('devices', devices);
        /*controller.set('smartphones', model.smartphones);
        controller.set('tablets', model.tablets);*/
        controller.set('smartwatches', model.smartwatches);
        controller.set('smartphoneModel', model.smartphones.findBy('id', this.get('smartphoneId')));
        controller.set('tabletModel', model.tablets.findBy('id', this.get('tabletId')));
        controller.set('smartwatchModel', model.smartwatches.findBy('id', this.get('smartwatchId')));
    },

    model: function () {
        return Ember.RSVP.hash({
            application: this.store.find('application').then(function (dataArray) {
                return dataArray.objectAt(0);
            }),

            /*viewControllers: this.store.find('viewController'),
             watchControllers: this.store.find('watchController'),
             */
            smartphones: this.store.find('smartphone'),
            tablets: this.store.find('tablet'),
            smartwatches: this.store.find('smartwatch'),
            /*
             menu: this.store.find('menu'),
             menuItems: this.store.find('menuItem'),

             listViewCells: this.store.find('listViewCell'),
             gridViewCells: this.store.find('gridViewCell'),

             asyncTasks: this.store.find('asyncTask'),
             alertDialogs: this.store.find('alertDialog'),
             progressDialogs: this.store.find('progressDialog'),

             clickListeners: this.store.find('clickListener'),
             watchClickListeners: this.store.find('watchClickListener'),
             navigations: this.store.find('navigation'),
             watchNavigations: this.store.find('watchNavigation'),
             sourceTypes: this.store.find('sourceType'),

             // UiPhoneControls
             audioPlayers: this.store.find('audioPlayer'),
             audioRecorders: this.store.find('audioRecorder'),
             buttons: this.store.find('button'),
             cards: this.store.find('card'),
             editTexts: this.store.find('editText'),
             gridViews: this.store.find('gridView'),
             imageViews: this.store.find('imageView'),
             labels: this.store.find('label'),
             listViews: this.store.find('listView'),
             maps: this.store.find('map'),
             datepickers: this.store.find('datepicker'),
             timepickers: this.store.find('timepicker'),
             photocameraControllers: this.store.find('photocameraController'),
             sliders: this.store.find('slider'),
             spinners: this.store.find('spinner'),
             switches: this.store.find('switch'),
             videoViews: this.store.find('videoView'),
             videocameraControllers: this.store.find('videocameraController'),
             webViews: this.store.find('webView'),

             // UiWatchControls
             watchButtons: this.store.find('watchButton'),
             watchLabels: this.store.find('watchLabel'),
             watchSliders: this.store.find('watchSlider'),
             watchSwitches: this.store.find('watchSwitch'),
             watchVoiceMessages: this.store.find('watchVoiceMessage'),
             */
        });
    }
});
