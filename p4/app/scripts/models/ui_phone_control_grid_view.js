App.GridView = App.UiPhoneControl.extend({
    gridViewCells: DS.hasMany('gridViewCell', {inverse: 'parentGridView'}),
    navigation: DS.belongsTo('navigation', {inverse: null}),

    minHeight: 408,
    defaultHeight: 408,
    heightFixed: DS.attr('number', {defaultValue: 408}),

    gridType: DS.attr('string', {defaultValue: 'simple'}),

    xmlName: 'gridViews',

    defaultWidth: function() {
        return this.get('viewController.scene.application.device.screenWidth');
    }.property('viewController.scene.application.device.screenWidth'),

    minWidth: function() {
        return this.get('defaultWidth');
    }.property('defaultWidth'),

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
        var gridViewCells = this.get('gridViewCells');

        gridViewCells.forEach(function (gridViewCell) {
            Ember.run.once(this, function () {
                gridViewCell.deleteRecord();
                gridViewCell.save();
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

        elem.setAttribute('gridType', this.get('gridType'));

        var navigation = self.get('navigation');

        if (navigation !== null) {
            elem.appendChild(navigation.toXml(xmlDoc));
        }

        self.get('gridViewCells').map(function (item) {
            elem.appendChild(item.toXml(xmlDoc));
        });

        return elem;
    }
});
/*
 App.GridView.FIXTURES = [
 {
 id: 9,
 name: 'GridView1',
 gridViewCells: [1],
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
 alignParentTop: false,
 alignParentBottom: true,
 alignParentStart: true,
 alignParentEnd: true,
 width: 300,
 height: 200,
 viewController: 2,
 parentContainer: null
 }
 ];*/
