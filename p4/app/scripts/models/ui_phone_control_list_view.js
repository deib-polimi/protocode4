App.ListView = App.UiPhoneControl.extend({
    listViewCells: DS.hasMany('listViewCell', {inverse: 'parentListView'}),
    navigation: DS.belongsTo('navigation', {inverse: null}),
    minWidth: 270,
    minHeight: 60,
    defaultWidth: 270,
    defaultHeight: 270,
    widthFixed: DS.attr('number', {defaultValue: 270}),
    heightFixed: DS.attr('number', {defaultValue: 270}),

    backgroundColor: DS.attr('string', {defaultValue: ''}),
    listType: DS.attr('string', {defaultValue: 'simple'}),

    xmlName: 'listViews',

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
        var listViewCells = this.get('listViewCells');

        listViewCells.forEach(function (listViewCell) {
            Ember.run.once(this, function () {
                listViewCell.deleteRecord();
                listViewCell.save();
            });
        });

        var navigation = this.get('navigation');

        if (navigation) {
            navigation.deleteRecord();
            navigation.save();
        }

        this._super();
    },

    toXml: function (xmlDoc) {
        var self = this;

        var elem = xmlDoc.createElement(self.get('xmlName'));
        self.decorateXml(xmlDoc, elem);

        elem.setAttribute('backgroundColor', this.get('backgroundColor'));
        elem.setAttribute('listType', this.get('listType'));

        var navigation = self.get('navigation');

        if (navigation !== null) {
            elem.appendChild(navigation.toXml(xmlDoc));
        }

        self.get('listViewCells').map(function (item) {
            elem.appendChild(item.toXml(xmlDoc));
        });

        return elem;
    }
});
/*
 App.ListView.FIXTURES = [
 {
 id: 8,
 name: 'ListView',
 listViewCells: [1],
 posX: 10,
 posY: 10,
 paddingTop: 0,
 paddingBottom: 0,
 paddingStart: 0,
 paddingEnd: 0,
 marginTop: 0,
 marginBottom: 0,
 marginStart: 0,
 marginEnd: 0,
 alignParentTop: true,
 alignParentBottom: false,
 alignParentStart: true,
 alignParentEnd: true,
 width: 300,
 height: 300,
 viewController: 2,
 parentContainer: null
 }
 ];*/
