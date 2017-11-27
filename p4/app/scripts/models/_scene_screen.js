App.SceneScreen = DS.Model.extend({
    scene: DS.belongsTo('scene', {inverse: 'sceneScreens'}),
    viewControllers: DS.hasMany('viewController', {inverse: 'sceneScreen'}),

    name: DS.attr('string'),

    xmlName: 'screen',

    valid: function() {
        return this.get('viewControllers.length') > 0;
    }.property('viewControllers.length'),

    viewControllersObserver: function() {
        if(!this.get('isDeleted')) {
            this.save();
        }
    }.observes('viewControllers.[]'),

    getPrecedentEnd: function(vc) {
        var index = this.get('viewControllers').indexOf(vc);
        if(index === 0) {
            return 0;
        }
        return parseFloat(this.get('viewControllers').objectAt(index - 1).get('endInScreen'));
    },

    getMaxWidthPercentInScreen: function(thisVc) {
        var vcs = this.get('viewControllers').without(thisVc);
        var maxOffset = 1;
        vcs.forEach(function(vc) {
            maxOffset = maxOffset - parseFloat(vc.get('widthPercentInScreen'));
        });
        return maxOffset;
    },

    toXml: function (xmlDoc) {
        var sceneScreen = xmlDoc.createElement(this.get('xmlName'));
        sceneScreen.setAttribute('name', this.get('name'));
        sceneScreen.setAttribute('number', this.get('viewControllers.length'));

        this.get('viewControllers').forEach(function (vc, index) {
            sceneScreen.setAttribute('viewController' + (index + 1), vc.getRefPath(''));
            sceneScreen.setAttribute('dimension' + (index + 1), vc.get('widthPercentInScreen'));
        });

        return sceneScreen;
    }
});
