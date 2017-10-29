App.Device = DS.Model.extend({
    name: DS.attr('string'),
    label: DS.attr('string'),
    platform: DS.attr('string'),
    viewTop: DS.attr('number'),
    viewBottom: DS.attr('number'),
    screenWidth: DS.attr('number'),
    screenHeight: DS.attr('number'),
    cssWidth: DS.attr('number'),
    cssHeight: DS.attr('number'),

    centerX: function() {
        return (this.get('posX') + this.get('width')) / 2;
    }.property(
        'posX',
        'width'
    ),

    centerY: function() {
        return (this.get('posY') + this.get('height')) / 2;
    }.property(
        'posY',
        'height'
    )
});
