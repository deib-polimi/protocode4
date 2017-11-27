/*
 templates/view_scenes.hbs
 */
App.ScenesController = Ember.ArrayController.extend({

    isCreating: false,
    newNameScene: Ember.computed('scenesCount', function () {
        if (this.get('scenesCount') !== 0) {
            return 'newScene' + this.get('scenesCount');
        } else {
            return 'newScene';
        }
    }),
    scenesCount: Ember.computed.alias('content.length'),
    needs: ['editor'],

    actions: {
        setCreating: function (value) {
            if (this.get('scenesCount') !== 0) {
                this.set('newNameScene', 'newScene' + this.get('scenesCount'));
            } else {
                this.set('newNameScene', 'newScene');
            }
            this.set('isCreating', value);
        },

        createScene: function () {
            var name = this.get('newNameScene');
            var app = this.get('controllers.editor.model');

            if (!name.trim()) {
                return;
            }

            // Application model is in editor.model
            this.store.createRecord('scene', {
                name: name,
                application: app
            }).save().then(function (scene) {
                app.get('scenes').addObject(scene);
                app.save();
            });

            if (this.get('scenesCount') !== 0) {
                this.set('newNameScene', 'newScene' + this.get('scenesCount'));
            } else {
                this.set('newNameScene', 'newScene');
            }
            this.set('isCreating', false);
            this.send('refreshModel');
        }
    }
});
