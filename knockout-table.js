;(function(factory) {
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // CommonJS
        factory(require('knockout'), require('jquery'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['knockout', 'jquery'], factory);
    } else {
        // Normal script tag
        factory(window.ko, window.jQuery);
    }
})(function(ko, $) {

    // Knockout Endpoints =====================================================

    ko.table = {};
    ko.table.TableViewModel = Table;
    ko.table.TableColumnViewModel = TableColumn;

    ko.bindingHandlers.table = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext)
        {
            return {
                controlsDescendantBindings: true,
            };
        },

        update: function(element, valueAccessor, allBindings, viewModel, bindingContext)
        {
            var table = ko.unwrap(valueAccessor());
            ko.renderTemplate('tpl-knockout-table', table, null, element);
        },
    };

    ko.virtualElements.allowedBindings.table = true;

    // TableViewModel =========================================================

    function Table(config)
    {
        var self = this;
        this.columns = config.columns.map(function(column) {
            return new TableColumn(self, column);
        });
        this.dataFn = config.dataFn;
        this.pageSize = config.pageSize || 20;

        this.rows = ko.observable();
        this.totalRowCount = ko.observable();
        this.filteredRowCount = ko.observable();
        this.pageCount = ko.computed(function() {
            return Math.ceil(self.filteredRowCount() / self.pageSize);
        });
        this.activePage = ko.observable(0);
        this.filterString = ko.observable('');
        this.filterString.subscribe(function() {
            self.activePage(0);
            self.load();
        });

        this.load();

        this.onPreviousPageClick = function() {
            self.loadPreviousPage();
        };

        this.onNextPageClick = function() {
            self.loadNextPage();
        };
    }

    Table.prototype.load = function()
    {
        var self = this;
        var res = this.dataFn({
            page: this.activePage(),
            pageSize: this.pageSize,
            filterString: this.filterString(),
        });
        $.when(res).done(function(res) {
            self.rows(res.rows);
            self.totalRowCount(res.totalRowCount);
            self.filteredRowCount(res.filteredRowCount);
        });
    };

    Table.prototype.loadPreviousPage = function()
    {
        var activePage = this.activePage();
        if (activePage > 0) {
            this.activePage(activePage - 1);
            this.load();
        }
    };

    Table.prototype.loadNextPage = function()
    {
        var activePage = this.activePage();
        if (activePage + 1 < this.pageCount()) {
            this.activePage(activePage + 1);
            this.load();
        }
    };

    // TableColumnViewModel ===================================================

    function TableColumn(table, config)
    {
        var self = this;
        $.extend(this, config);
        this.table = table;
        this.template = this.template || 'tpl-knockout-table-cell-text';

        this.valueFn = this.valueFn || function(row) {
            return row[self.field];
        };
    }

});
