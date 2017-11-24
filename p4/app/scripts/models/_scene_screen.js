App.SceneScreen = DS.Model.extend({
    scene: DS.belongsTo('scene', {inverse: 'sceneScreens'}),
    viewControllers: DS.hasMany('viewController', {inverse: 'sceneScreen'}),

    name: DS.attr('string'),

    xmlName: 'screen',

    valid: function() {
        return this.get('viewControllers.length') > 0;
    }.property('viewControllers.length'),

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
        var sceneScreen = xmlDoc.createElement(this.get('screen'));
        sceneScreen.setAttribute('name', this.get('name'));
        sceneScreen.setAttribute('number', this.get('viewControllers.length'));

        this.get('viewControllers').map(function (vc) {
            sceneScreen.setAttribute('dimension', vc.get('widthPercentInScreen'));
        });

        return sceneScreen;
    }
});
