App.Constraint = DS.Model.extend({

    uiPhoneControl: DS.belongsTo('uiPhoneControl', {inverse: 'constraints'}),

    id: DS.attr('string'),
    layoutEdge: DS.attr('string'),
    withParent: DS.attr('boolean'),
    referenceElement: DS.belongsTo('uiPhoneControl', {polymorphic: true, inverse: null}),
    referenceLayoutEdge: DS.attr('string'),
    value: DS.attr('number'),

    xmlName: 'constraint',

    toXml: function (xmlDoc) {
        var constraint = xmlDoc.createElement(this.get('xmlName'));
        constraint.setAttribute('id', this.get('id'));
        constraint.setAttribute('layoutEdge', this.get('layoutEdge'));
        if(this.get('withParent') === true) {
            if(this.get('uiPhoneControl.parentContainer') !== null) {
                constraint.setAttribute('referenceElement', this.get('uiPhoneControl.parentContainer').getRefPath(''));
            } else {
                constraint.setAttribute('referenceElement', this.get('uiPhoneControl.viewController').getRefPath(''));
            }
        } else {
            constraint.setAttribute('referenceElement', this.get('referenceElement').getRefPath(''));
        }
        constraint.setAttribute('referenceLayoutEdge', this.get('referenceLayoutEdge'));
        constraint.setAttribute('value', this.get('value'));

        return constraint;
    }

});
