App.Navigation = DS.Model.extend({
    destination: DS.belongsTo('scene', {inverse: null}),

    toXml: function (xmlDoc) {
        var elem = xmlDoc.createElement('navigation');

        elem.setAttribute('destination', this.get('destination.name'));

        return elem;
    }
});
