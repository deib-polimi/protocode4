App.Spinner = App.UiPhoneControl.extend({
    name: DS.attr('string', {defaultValue: 'Spinner'}),
    minWidth: 150,
    minHeight: 48,
    defaultWidth: 180,
    defaultHeight: 48,

    widthFixed: DS.attr('number', {defaultValue: 180}),
    heightFixed: DS.attr('number', {defaultValue: 48}),

    xmlName: 'spinner',

    toXml: function (xmlDoc) {
        var spinner = xmlDoc.createElement(this.get('xmlName'));
        this.decorateXml(xmlDoc, spinner);
        return spinner;
    }

});
