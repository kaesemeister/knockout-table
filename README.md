# knockout-table

## Note

very early state, suggestions are welcome :)

This is possible so far

- abitrary dataprovider function. async or static.
- paging and filtering (has to be done by dataprovider function) but the viewmodel manages state
- knockoutbindings (e.g. click events) for cells
- html cells
- ...

## Motivation

I've searched the web for a whole day to find a datagrid implementation which fits my needs
I had the following requirements

- **good knockout integration**
- custom data provider
- sorting, filtering, paging or infinite scroll
- fixed height with fixed header
- possibility to bind knockout-handlers to rows
- when possible no large lib / style dependency
- simplicity

There are some good solutions but there were always at least one detail which was not satisfying.

My aim is not to define the perfect datatable which beats all other implementations.
I want to provide a good foundation which is made for knockout and can be customized easily.

## Dependencies

- Knockout
- jQuery

## Usage

Define your templates

```html
<script type="text/html" id="tpl-example-cell-username">
    <a data-bind="click: onUsernameClick, text: username"></a>
</script>

<script type="text/html" id="tpl-knockout-table">
    <input type="text" placeholder="Filter" data-bind="value: filterString"/>
    <table>
        <thead>
            <tr data-bind="foreach: columns">
                <th data-bind="text: label"></th>
            </tr>
        </thead>
        <tbody data-bind="foreach: rows">
            <tr data-bind="foreach: $parent.columns">
                <td data-bind="template: {name: template, data: valueFn($parent)}"></td>
            </tr>
        </tbody>
    </table>
    <div>
        <a data-bind="click: onPreviousPageClick">&laquo;</a>
        <!-- ko text: activePage() + 1 --><!-- /ko --> /
        <!-- ko text: pageCount() --><!-- /ko -->
        <a data-bind="click: onNextPageClick">&raquo;</a>
    </div>
</script>

<script type="text/html" id="tpl-knockout-table-cell-text">
    <!-- ko text: $data --><!-- /ko -->
</script>

<script type="text/html" id="tpl-knockout-table-cell-html">
    <span data-bind="html: $data"></span>
</script>
```

Use the knockout binding

```html
<!-- ko table: table --><!-- /ko -->
```

ViewModel

```javascript
function Example()
{
    var self = this;
    this.table = new ko.table.TableViewModel({
        columns: [{
            label: 'Username',
            template: 'tpl-example-cell-username',
            // use this if you need the complete view model in order to
            // bind event handlers inside tpl-example-cell-username
            // default valueFn returns row[column.field]
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

            // query your data and return a Deferred object
            return $.get('./your/url', {....}).then(function(result) {
                // transform your result here (e.g. wrap it with a ViewModel)
                return result;
            });
        }
    });
}
```
