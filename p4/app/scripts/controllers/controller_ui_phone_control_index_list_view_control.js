/*
 templates/control_list_view/index.hbs
 */
App.ControlListViewIndexController = App.UiPhoneControlController.extend(App.NavigableSaveable, {
    needs: ['scenes'],

    isCreating: false,
    newNameListViewCell: 'newListItem',

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

    simpleList: function (key, value) {
        return this.listType(key, value, 'simple');
    }.property('model.listType'),

    imageList: function (key, value) {
        return this.listType(key, value, 'image');
    }.property('model.listType'),

    detailedList: function (key, value) {
        return this.listType(key, value, 'detailed');
    }.property('model.listType'),

    listType: function (key, value, type) {
        // setter
        if (value !== undefined) {
            this.set('model.listType', type);
            this.get('model').save();
        }

        // getter
        return this.get('model.listType') === type;
    },

    actions: {
        abortCreation: function () {
            this.set('isCreating', false);
        },

        setCreating: function (value) {
            this.set('isCreating', value);
        },

        createListViewCell: function () {
            var name = this.get('newNameListViewCell').trim();

            if (!name) {
                return;
            }

            var listViewCell = this.store.createRecord('listViewCell', {
                name: name.replace(/ /g, ''),
                title: name
            });

            listViewCell.set('parentListView', this.get('model'));

            this.set('newNameListViewCell', 'newListItem');
            this.set('isCreating', false);

            listViewCell.save();

            this.set('isCreating', true);
        }
    }

});
