App.ReportViewComponent = Ember.Component.extend({
    tagName: 'div',
    classNames: ['report-text-area'],
    sceneBinding: 'controller.scene',
    routerBinding: 'controller.target',

    updateReportObserver: function() {
        this.updateReport();
    }.observes('scene', 'router.location.lastSetURL'),

    updateReport: function() {
        var self = this;
        if(this.get('element')) {
            this.get('vcController').getReportText().then(function(report) {
                self.get('element').childNodes[4].innerHTML = report;
            });
        }
    },

    actions: {
        updateReportAction: function() {
            this.updateReport();
        }
    }
});
