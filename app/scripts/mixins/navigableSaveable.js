App.NavigableSaveable = Ember.Mixin.create({
    dirty: false,

    isDirtyOverride: function() {
        if(this.get('model.isDirty') || this.get('dirty')) {
            return true;
        }
        return false;
    }.property('model.isDirty', 'dirty'),

    dirtyObserver: function() {
        if(this.get('model')) {
            this.set('dirty', true);
        }
    }.observes('model.navigation.destinationScene.id'),

    actions: {
        acceptChanges: function() {
            this.get('model').save();
            this.get('model.navigation').save();
            this.set('dirty', false);
        },
    }
});
