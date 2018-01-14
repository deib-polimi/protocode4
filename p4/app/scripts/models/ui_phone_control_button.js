App.Button = App.UiPhoneControl.extend({
    title: DS.attr('string', {defaultValue: 'Button'}),
    navigation: DS.belongsTo('navigation', {inverse: null}),
    minWidth: 64,
    minHeight: 40,
    defaultWidth: 88,
    defaultHeight: 40,
    widthFixed: DS.attr('number', {defaultValue: 88}),
    heightFixed: DS.attr('number', {defaultValue: 40}),

    textColor: DS.attr('string', {defaultValue: ''}),
    backgroundColor: DS.attr('string', {defaultValue: ''}),
    clickColor: DS.attr('string', {defaultValue: ''}),
    borderRadius: DS.attr('number', {defaultValue: 2}),

    xmlName: 'buttons',

    didCreate: function () {
        var self = this;
        this._super();
        this.store.createRecord('navigation', {
            //contextId: self.get('id'),
            destination: null
        }).save().then(function(nav) {
            self.set('navigation', nav);
            self.save();
        });
    },

    deleteRecord: function () {
        var navigation = this.get('navigation');

        if (navigation) {
            navigation.deleteRecord();
            navigation.save();
        }

        this._super();
    },

    toXml: function (xmlDoc) {
        var button = xmlDoc.createElement(this.get('xmlName'));
        this.decorateXml(xmlDoc, button);
        button.setAttribute('title', this.get('title'));

        button.setAttribute('textColor', this.get('textColor'));
        button.setAttribute('backgroundColor', this.get('backgroundColor'));
        button.setAttribute('borderRadius', this.get('borderRadius'));
        button.setAttribute('clickColor', this.get('clickColor'));

        var navigation = this.get('navigation');

        if (navigation !== null) {
            button.appendChild(navigation.toXml(xmlDoc));
        }

        return button;
    }
});
