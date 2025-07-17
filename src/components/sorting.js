import {sortMap} from "../lib/sort.js";
import {Column, Row} from "./table.js";
import {capitalize, create} from "../lib/utils.js";

function Header({ columns }) {
    return create(Row, {
        className: 'header-row',
        columns
    });
}

function HeaderColumn({ value }) {
    return create(Column, {
        role: 'columnheader',
        value
    })
}

function Sortable({ name, onClick }) {
    return create('button', {
        className: 'icon',
        type: 'button',
        name: 'sort',
        dataset: {
            field: 'date',
            value: 'none',
            name: `sortBy${capitalize(name)}`,
            ariaLabel: `Sort by ${name}`
        },
        onClick
    });
}

export function initSorting(onUpdate) {
    let field = null;
    let order = null;
    let buttons = [];

    const onClick = (event) => {
        event.stopPropagation();
        const action = event.target;

        action.dataset.value = sortMap[action.dataset.value];
        field = action.dataset.field;
        order = action.dataset.value;

        buttons.forEach(btn => {
            if (btn.dataset.field !== action.dataset.field) {
                btn.dataset.value = 'none';
            }
        });

        void onUpdate();
    }

    const apply = (query) => {
        const sort = (field && order !== 'none') ? `${field}:${order}` : null;

        return sort ? Object.assign({}, query, { sort }) : query;
    }

    const plugin = (schema) => {
        const header = Header({
            columns: schema.map(column => {
                let hCell = column.label ?? column.name;
                if (column.sort) {
                    const sortButton = Sortable({ name: column.name, onClick });
                    buttons.push(sortButton);

                    hCell = create('div', {
                            class: 'sortable'
                        },
                        hCell,
                        sortButton
                    );
                }

                return HeaderColumn({
                    value: hCell
                });
            })
        });

        return { type: 'before', element: header };
    }

    return { plugin, apply };
}