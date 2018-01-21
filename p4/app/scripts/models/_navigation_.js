App.Navigation = DS.Model.extend({
    contextId: DS.attr('string'),
    destinationViewController: DS.belongsTo('viewController', {default: null}),
    destinationScene: DS.belongsTo('scene', {default: null}),

    toXml: function (xmlDoc) {
        var elem = xmlDoc.createElement('navigation');

        if(this.get('destinationViewController')) {
            elem.setAttribute('destination', this.get('destinationViewController').getRefPath(''));
        } else if(this.get('destinationScene')) {
            elem.setAttribute('destination', this.get('destinationScene').getRefPath(''));
        }

        return elem;
    }
});
