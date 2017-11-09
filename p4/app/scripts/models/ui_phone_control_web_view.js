App.WebView = App.UiPhoneControl.extend({
    htmlFileName: DS.attr('string', {defaultValue: ""}),
    minWidth: 0,
    minHeight: 0,
    defaultWidth: 240,
    defaultHeight: 128,

    width: DS.attr('number', {defaultValue: 240}),
    height: DS.attr('number', {defaultValue: 128}),

    xmlName: 'webViews',

    toXml: function (xmlDoc) {
        var elem = xmlDoc.createElement(this.get('xmlName'));
        this.decorateXml(xmlDoc, elem);

        elem.setAttribute('HTMLFileName', this.get('htmlFileName'));

        return elem;
    }
});
