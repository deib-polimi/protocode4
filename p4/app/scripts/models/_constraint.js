App.Constraint = DS.Model.extend({
    layoutEdges: ['top', 'bottom', 'start', 'end', 'centerX', 'centerY'],

    uiPhoneControl: DS.belongsTo('uiPhoneControl', {polymorphic: true, inverse: 'constraints'}),

    name: DS.attr('string'),
    layoutEdge: DS.attr('string'),
    withParent: DS.attr('boolean'),
    referenceElement: DS.belongsTo('uiPhoneControl', {polymorphic: true, inverse: null}),
    referenceLayoutEdge: DS.attr('string'),
    value: DS.attr('number'),
    valid: DS.attr('boolean'),

    xmlName: 'constraint',

    filteredLayoutEdges: function() {
        var wp = this.get('withParent');
        var edges = this.get('layoutEdges');
        if(wp) {
            return edges;
        } else {
            return edges.without('centerX').without('centerY');
        }
    }.property('withParent', 'layoutEdges'),

    filteredReferenceLayoutEdges: function() {
        var wp = this.get('withParent');
        var firstEdge = this.get('layoutEdge');
        if(firstEdge === 'top' || firstEdge === 'bottom') {
            if(wp) {
                return [firstEdge];
            } else {
                return ['top', 'bottom'];
            }
        } else if(firstEdge === 'start' || firstEdge === 'end') {
            if(wp) {
                return [firstEdge];
            } else {
                return ['start', 'end'];
            }
        } else if(firstEdge === 'centerX') {
            return ['centerX'];
        } else if(firstEdge === 'centerY') {
            return ['centerY'];
        } else {
            return [];
        }
    }.property('withParent', 'layoutEdge', 'referenceLayoutEdge'),

    firstEdgeChanged: function() {
        this.set('referenceLayoutEdge', null);
    }.observes('layoutEdge'),

    didCreate: function () {
        this._super();

        this.get('uiPhoneControl').save();
    },

    toXml: function (xmlDoc) {
        var constraint = xmlDoc.createElement(this.get('xmlName'));
        constraint.setAttribute('name', this.get('name'));
        constraint.setAttribute('layoutEdge', this.get('layoutEdge'));
        if(this.get('withParent') === true) {
            if(this.get('uiPhoneControl.parentContainer') !== null) {
                constraint.setAttribute('referenceElement', this.get('uiPhoneControl.parentContainer').getRefPath(''));
            } else {
                constraint.setAttribute('referenceElement', 'parentView');
            }
        } else if(this.get('referenceElement') !== null){
            constraint.setAttribute('referenceElement', this.get('referenceElement').getRefPath(''));
        }
        constraint.setAttribute('referenceLayoutEdge', this.get('referenceLayoutEdge'));
        constraint.setAttribute('value', this.get('value'));

        return constraint;
    }

});
