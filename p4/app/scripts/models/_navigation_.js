App.Navigation = DS.Model.extend({
    contextId: DS.attr('string'),
    destination: DS.attr('string', {default: '/null'}),

    toXml: function (xmlDoc) {
        var elem = xmlDoc.createElement('navigation');

        elem.setAttribute('destination', this.get('destination'));

        return elem;
    }
});
