/*
 templates/control_grid_view/index.hbs
 */
App.ControlGridViewIndexController = App.UiPhoneControlController.extend(App.NavigableSaveable, {
    needs: ['scenes'],

    isCreating: false,
    newNameGridViewCell: 'newGridCell',

    navigationArray: function() {
        var array = this.get('controllers.scenes.model').map(function(s) {
            return s.get('referenceName');
        });
        array = array.pushObjects(this.get('model.viewController.scene.viewControllers').without(this.get('model.viewController')).map(function(vc) {
            return vc.get('referenceName');
        }));
        return array;
    }.property(
        'controllers.scenes.model.[]',
        'model.viewController',
        'model.viewController.scene.viewControllers.[]'
    ),

    simpleGrid: function (key, value) {
        return this.gridType(key, value, 'simple');
    }.property('model.gridType'),

    imageGrid: function (key, value) {
        return this.gridType(key, value, 'image');
    }.property('model.gridType'),

    detailedGrid: function (key, value) {
        return this.gridType(key, value, 'detailed');
    }.property('model.gridType'),

    gridType: function (key, value, type) {
        // setter
        if (value !== undefined) {
            this.set('model.gridType', type);
            this.get('model').save();
        }

        // getter
        return this.get('model.gridType') === type;
    },

    actions: {
        abortCreation: function () {
            this.set('isCreating', false);
        },

        setCreating: function (value) {
            this.set('isCreating', value);
        },

        createGridViewCell: function () {
            var name = this.get('newNameGridViewCell').trim();

            if (!name) {
                return;
            }

            var gridViewCell = this.store.createRecord('gridViewCell', {
                name: name.replace(/ /g, ''),
                title: name
            });

            gridViewCell.set('parentGridView', this.get('model'));

            this.set('newNameGridViewCell', 'newGridCell');
            this.set('isCreating', false);

            gridViewCell.save();

            this.set('isCreating', true);
        }
    }

});
