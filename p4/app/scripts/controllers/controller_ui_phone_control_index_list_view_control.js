/*
 templates/control_list_view/index.hbs
 */
App.ControlListViewIndexController = App.UiPhoneControlController.extend(App.Saveable, {
    needs: ['scenes'],

    isCreating: false,
    newNameListViewCell: 'newListItem',
    destinationSelected: null,

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

    // NAVIGATION METHODS

    modelObserver: function() {
        this.get('currentNavigation');
    }.observes('model', 'target.location.lastSetURL'),

    currentScene: function() {
        if(this.get('model')) {
            return this.get('model.viewController.activeScene');
        }
        return null;
    }.property('model.viewController.activeScene'),

    /*currentSceneId: function() {
        var path = this.get('target.location.lastSetURL');
        if(!path) {
            path = this.get('target.url');
        }
        if(path) {
            var splittedPath = path.split('/');
            return splittedPath[splittedPath.get('length') - 3];
        }
        return null;
    }.property('target.location.lastSetURL', 'target.url'),*/

    currentNavigation: function() {
        if(this.get('currentScene') && this.get('model')) {
            var sceneId = this.get('currentScene.id');
            var dest = this.get('model.navigations').find(function(nav) { return nav.get('contextId') === sceneId });
            if(dest) {
                if(dest.get('destinationScene')) {
                    this.set('destinationSelected', dest.get('destinationScene'));
                } else if(dest.get('destinationViewController')) {
                    this.set('destinationSelected', dest.get('destinationViewController'));
                } else {
                    this.set('destinationSelected', null);
                }
                return dest;
            } else {
                return null;
            }
        }
        return null;
    }.property('currentScene'),

    navigationArray: function() {
        if(this.get('model') && this.get('model.viewController') && this.get('model.viewController.application.scenes') && this.get('currentScene')) {
            var self = this;
            return DS.PromiseArray.create({
                promise: self.get('model.viewController.application.scenes').then(function(scenes) {
                    var array = [].addObjects(scenes.without(self.get('currentScene')));
                    array = array.addObjects(self.get('currentScene.viewControllers').without(self.get('model.viewController')));
                    return array;
                })
            });
        }
        return [];
    }.property(
        'model.viewController',
        'model.viewController.application.scenes.@each',
        'currentScene.viewControllers.@each'
    ),

    destinationObserver: function() {
        if(this.get('destinationSelected') && this.get('currentNavigation')) {
            var destination = this.get('destinationSelected');
            if(destination.constructor.toString() === 'App.Scene') {
                this.set('currentNavigation.destinationScene', this.get('destinationSelected'));
            } else {
                this.set('currentNavigation.destinationViewController', this.get('destinationSelected'));
            }
            this.get('currentNavigation').save();
        }
    }.observes('destinationSelected'),

    // END NAVIGATION METHODS

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
