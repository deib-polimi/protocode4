App.SceneScreen = DS.Model.extend({
    scene: DS.belongsTo('scene', {inverse: 'sceneScreens'}),
    viewControllers: DS.hasMany('viewController', {inverse: 'sceneScreen'}),

    name: DS.attr('string'),

    xmlName: 'screen',

    valid: function() {
        return this.get('viewControllers.length') > 0;
    }.property('viewControllers.length'),

    /* NAVIGATION for tablet WITH variation
        Scene has:
            Case 1: menu YES, tab menu YES
            all SCs have menu button

            Case 2: menu YES, tab menu NO
            - first SC has menu button
            - other SCs have back button (to the first SC)

            Case 3: menu NO, tab menu YES
            all SCs have back button to the precedent scene

            Case 4: menu NO, tab menu NO
            all SCs have back button but:
            - first SC go back to precedent scene
            - others SCs go back to first SC
    */
    hasBackButton: function() {
        if(this.get('scene.hasMenu')) {
            if(this.get('scene.hasTabMenu')) {
                // Case 1
                return false;
            } else {
                // Case 2
                if(this.get('scene.sceneScreens').indexOf(this) === 0) {
                    return false;
                } else {
                    return true;
                }
            }
        } else {
            // Cases 3 and 4
            return true;
        }
    }.property(
        'scene.hasMenu',
        'scene.hasTabMenu'
    ),

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
        return parseFloat(this.get('viewControllers').objectAt(index - 1).get('end'));
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
        sceneScreen.setAttribute('id', this.get('id'));
        sceneScreen.setAttribute('name', this.get('name'));
        sceneScreen.setAttribute('number', this.get('viewControllers.length'));
        if(this.get('hasBackButton')) {
            sceneScreen.setAttribute('hasMenuButton', false);
            sceneScreen.setAttribute('hasBackButton', true);
        } else {
            sceneScreen.setAttribute('hasMenuButton', true);
            sceneScreen.setAttribute('hasBackButton', false);
        }

        this.get('viewControllers').forEach(function (vc, index) {
            sceneScreen.setAttribute('viewController' + (index + 1), vc.getRefPath(''));
            sceneScreen.setAttribute('dimension' + (index + 1), vc.get('widthPercentInScreen'));
        });

        return sceneScreen;
    }
});
