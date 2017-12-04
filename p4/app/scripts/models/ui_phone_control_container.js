App.Container = App.UiPhoneControl.extend({
    name: DS.attr('string', {defaultValue: 'DummyContainer'}),
    title: DS.attr('string', {defaultValue: 'Dummy Container'}),
    widthFixed: DS.attr('number', {defaultValue: 200}),
    heightFixed: DS.attr('number', {defaultValue: 100}),

    uiPhoneControls: DS.hasMany('uiPhoneControl', {polymorphic: true, inverse: 'parentContainer'}),

    centerX: function() {
        return this.get('posX') + (this.get('width') / 2);
    }.property(
        'posX',
        'width'
    ),

    centerY: function() {
        return this.get('posY') + (this.get('height') / 2);
    }.property(
        'posY',
        'height'
    ),

    getWidthFromPercent: function(widthPercent) {
        return widthPercent * this.get('width');
    },

    getHeightFromPercent: function(heightPercent) {
        return heightPercent * this.get('height');
    },

    toXml: function (xmlDoc) {
        var elem = xmlDoc.createElement('container');
        this.decorateXml(xmlDoc, elem);

        elem.setAttribute('title', this.get('title'));

        var uiPhoneControls = this.get('uiPhoneControls');

        uiPhoneControls.map(function (item) {
            elem.appendChild(item.toXml(xmlDoc));
        });

        return elem;
    }
});
