App.NavigableSaveable = Ember.Mixin.create({

    isDirtyOverride: function() {
        if(this.get('model.isDirty') || this.get('model.navigation.isDirty')) {
            return true;
        }
        return false;
    }.property('model.isDirty', 'model.navigation.isDirty'),

    actions: {
        acceptChanges: function() {
            this.get('model').save();
            this.get('model.navigation').save();
        },
    }
});
