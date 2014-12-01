function Example()
{
    var self = this;
    this.table = new ko.table.TableViewModel({
        columns: [{
            label: 'Username',
            template: 'tpl-example-cell-username',
            valueFn: function(row) {
                return row;
            }
        }, {
            label: 'Firstname',
            field: 'first_name',
        }, {
            label: 'Lastname',
            field: 'last_name',
        }, {
            label: 'E-Mail',
            field: 'emailLink',
            template: 'tpl-knockout-table-cell-html',
        }, {
            label: 'Login',
            field: 'last_login',
        }],
        dataFn: function(config) {
            var page = config.page;
            var pageSize = config.pageSize;
            var filterString = config.filterString;
            return $.get('./mockdata.json').then(function(rows) {

                // simulate filtering and paging
                var filteredRows = rows.filter(function(row) {
                    return row.username.indexOf(filterString) !== -1
                        || row.email.indexOf(filterString) !== -1
                        || row.first_name.indexOf(filterString) !== -1
                        || row.last_name.indexOf(filterString) !== -1;
                });
                var pagedRows = filteredRows.slice(page * pageSize, page * pageSize + pageSize);

                // prepare rows for display
                var finalRows = pagedRows.map(function(row) {
                    return new ExampleRow(self, row);
                });

                return {
                    rows: finalRows,
                    filteredRowCount: filteredRows.length,
                    totalRowCount: rows.length,
                };
            });
        }
    });
    this.table.load();
}

function ExampleRow(example, config)
{
    var self = this;
    $.extend(this, config);
    this.emailLink = $('<a>', {href: 'mailto:' + this.email}).text(this.email)[0].outerHTML;

    this.onUsernameClick = function() {
        // do whatever you want..
        console.log(self);
    };
}

$(function() {
    var example = new Example();
    ko.applyBindings(example);
});
