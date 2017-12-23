App.Container = App.UiPhoneControl.extend({
    minWidth: 0,
    minHeight: 0,
    defaultWidth: 300,
    defaultHeight: 400,
    widthFixed: DS.attr('number', {defaultValue: 300}),
    heightFixed: DS.attr('number', {defaultValue: 400}),

    childViewController: DS.belongsTo('viewController'),

    xmlName: "containerView",

    didCreate: function() {
        this.set('name', 'Container-' + this.get('id'));
        this.save();
    },

    getWidthFromPercent: function(widthPercent) {
        return widthPercent * this.get('width');
    },

    getHeightFromPercent: function(heightPercent) {
        return heightPercent * this.get('height');
    },

    toXml: function (xmlDoc) {
        var elem = xmlDoc.createElement('container');
        elem.setAttribute('childViewController', this.get('childViewController').getRefPath(''));
        this.decorateXml(xmlDoc, elem);

        return elem;
    },

    getRefPath: function (path) {
        return '//@' + this.get('xmlName') + '[id=\'' + this.get('id') + '\']' + path;
    }
});
