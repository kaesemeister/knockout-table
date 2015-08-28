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
        this.pageSize = ko.observable(config.pageSize || 20);
        this.activePage = ko.observable(0);
        this.loading = ko.observable(false);
        this.rows = ko.observable();
        this.totalRowCount = ko.observable();
        this.filteredRowCount = ko.observable();
        this.pageCount = ko.computed(function() {
            return Math.ceil(self.filteredRowCount() / self.pageSize());
        });

        this.pages = ko.computed(function(){
            var p = [];
            for (var i = 1; i <= self.pageCount(); i++) {
                p.push(i);
            }
            return p;
        });

        this.isNotFirstPage = ko.computed(function () {
            return self.checkFirst();
        });
        this.isNotLastPage = ko.computed(function () {
            return self.checkLast();
        });

        
        this.filterString = ko.observable('');
        this.filterString.subscribe(function() {
            self.activePage(0);
            self.load();
        });

        this.onPreviousPageClick = function() {
            self.loadPreviousPage();
        };

        this.onNextPageClick = function() {
            self.loadNextPage();
        };

        this.onPageClick = function(page) {
            self.loadPage(page - 1);
        };

        this.onReloadClick = function() {
            self.load();
        };
    }

    Table.prototype.load = function()
    {
        var self = this;
        this.loading(true);

        var order = [];
        this.columns.forEach(function(column) {
            if (column.sortable) {
                var ss = column.sortState();
                if (ss != 'none') {
                    order.push({
                        column: column.config,
                        direction: ss,
                    });
                }
            }
        });

        var res = this.dataFn({
            page: this.activePage(),
            pageSize: this.pageSize(),
            filterString: this.filterString(),
            order: order,
        });
        $.when(res).done(function(res) {
            self.rows(res.rows);
            self.totalRowCount(res.totalRowCount);
            self.filteredRowCount(res.filteredRowCount);
            if (res.pageSize) {
                self.pageSize(res.pageSize);
            }
        }).always(function() {
            self.loading(false);
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

    Table.prototype.loadPage = function(page)
    {
        var activePage = this.activePage();
        this.activePage(page);
        this.load();
        
    };

    Table.prototype.loadNextPage = function()
    {
        var activePage = this.activePage();
        if (activePage + 1 < this.pageCount()) {
            this.activePage(activePage + 1);
            this.load();
        }
    };

    Table.prototype.checkFirst = function()
    {
        var activePage = this.activePage();
        if(activePage === 0)
            return false;
        else
            return true;
    };

    Table.prototype.checkLast = function()
    {
        var activePage = this.activePage();
        if((this.pageCount() - 1) === activePage)
            return false;
        else
            return true;
    };

    Table.prototype.toggleSortState = function(column)
    {
        // disable sort state for all other columns
        this.columns.forEach(function(otherColumn) {
            if (otherColumn != column) {
                otherColumn.sortState('none');
            }
        });

        // toggle columns state
        column.toggleSortState();
        this.load();
    };

    // TableColumnViewModel ===================================================

    function TableColumn(table, config)
    {
        var self = $.extend(this, config);
        this.config = config;
        this.table = table;
        this.template = this.template || 'tpl-knockout-table-cell-text';
        this.sortable = this.sortable ? true : false;
        this.sortState = ko.observable(this.sortState || 'none');

        if (!this.valueFn) {
            if (this.field) {
                this.valueFn = function(row) {
                    return row[self.field];
                };
            } else {
                this.valueFn = function(row) {
                    return row;
                };
            }
        }

        this.onClick = function()
        {
            if (self.sortable) {
                table.toggleSortState(self);
            }
        };
    }

    TableColumn.sortToggleMap = {
        'none': 'asc',
        'asc': 'desc',
        'desc': 'asc',
    };

    TableColumn.prototype.toggleSortState = function()
    {
        this.sortState(TableColumn.sortToggleMap[this.sortState()]);
    };

});
