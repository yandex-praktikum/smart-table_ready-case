import {create} from "../lib/utils.js";
import {Column} from "./table.js";


function TextFilter({ name }) {
    return create('label', {
        className: 'filter-wrapper'
    },
        create('input', {
            type: 'text',
            value: '',
            className: 'input',
            placeholder: 'Search',
            name
        }),
        create('button', {
            type: 'submit',
            name: 'clear',
            dataset: { name },
            className: 'icon',
        })
    )
}

function SelectFilter({ name, options }) {
    return create('label', {
        className: 'dropdown-select',
        dataset: { name }
    },
        create('select', {
            name
        },
            create('option', {
                value: '',
                selected: 'selected'
            }),
            ...options.map(option => create('option', {
                value: option
            }, option))
        )
    )
}

function RangeFilter({ name }) {
    return create('div', {
        className: 'range-inputs'
    },
        create('input', {
            type: 'text',
            className: 'input',
            placeholder: 'from',
            name: `${name}From`
        }),
        create('input', {
            type: 'text',
            className: 'input',
            placeholder: 'to',
            name: `${name}To`,
        })
    )
}

export function initFiltering(redraw) {
    const selectFilters = {};
    const filterFields = [];
    let filterContainer;

    const update = (indexes) => {
        Object.keys(indexes).forEach(indexName => {
            if (!selectFilters[indexName]) return;
            selectFilters[indexName].forEach(select => {
                select.replaceWith(SelectFilter({
                    name: select.dataset.name,
                    options: Object.values(indexes[indexName])
                }))
            })
        })
    }

    const apply = (query) => {
        const filter = {};
        filterFields.forEach(field => {
            if (filterContainer.elements[field].value) {
                filter[`filter[${field}]`] = filterContainer.elements[field].value;
            }
        });
        console.log(filter);
        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    }

    const plugin = (schema) => {
        const columns = [];
        schema.forEach(column => {
            if (column.filter) switch (column.filter) {
                case 'text':
                    columns.push(Column({
                        name: column.name,
                        value: TextFilter({ name: column.name })
                    }));
                    filterFields.push(column.name);
                    break;
                case 'select':
                    const select = SelectFilter({ name: column.name, options: [] });
                    if (!selectFilters[column.options]) {
                        selectFilters[column.options] = [];
                    }
                    selectFilters[column.options].push(select);
                    columns.push(Column({
                        name: column.name,
                        value: select
                    }));
                    filterFields.push(column.name);
                    break;
                case 'range':
                    columns.push(Column({
                        name: column.name,
                        value: RangeFilter({ name: column.name })
                    }))
                    filterFields.push(`${column.name}From`, `${column.name}To`);
                    break;
            } else {
                columns.push(Column({
                    name: column.name,
                    value: ""
                }));
            }
        });
        filterContainer = create('form', {
            name: 'filter',
            className: 'table-row filter-row',
        }, ...columns);

        filterContainer.addEventListener('submit', (event) => {
            event.preventDefault();
            if (event.submitter.name === 'clear') {
                const input = event.submitter.parentElement.querySelector('input');
                input.value = '';
            }
            redraw();
        });

        filterContainer.addEventListener('change', redraw);

        return { type: 'before', element: filterContainer };
    };

    return { plugin, apply, update }
}