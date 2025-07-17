import {classNames as cx, create, deepClone, setContent} from "../lib/utils.js";


export function Column({ name, value, role = 'cell' }) {
    return create('div', {
        class: 'table-column',
        role,
        data: { name }
    }, value);
}

export function Row({ columns, className = '' }) {
    return create('div', {
        class: cx('table-row', className),
        role: 'row'
    }, ...columns);
}

export function Cell({ column, data, name, value }) {
    return column.tag ? create(column.tag, { column, data, name, value }) : value;
}

function RowGroup({ rows = [] }) {
    return create('div', {
        class: 'table-content',
        data: { name: 'rows' },
        role: 'rowgroup'
    }, ...rows);
}

function Table({ schema, className = '', sections = [] }) {
    return create('div', {
        name,
        class: cx('table', className),
        style: { '--columns': schema.map(({ size }) => size ?? '1fr').join(' ') },
        role: 'table'
    }, ...sections);
}

export function initTable({ schema, options = {}, plugins = [] }) {
    const content = RowGroup({});
    const internalSchema = deepClone(schema);
    const before = [];
    const after = [];

    plugins.forEach(plugin => {
        const insert = plugin(internalSchema);
        switch(insert.type) {
            case 'before': before.push(insert.element); break;
            case 'after': after.push(insert.element); break;
            default: break;
        }
    });

    const table = Table({
        name: options.name,
        className: options.className,
        schema: internalSchema,
        sections: [...before, content, ...after]
    });

    const render = (data) => {
        const rows = data.map(row => create(Row, {
            columns: internalSchema.map(column => create(Column, {
                ...column,
                value: Cell({ column, data: row, name: column.name, value: row[column.name]})
            }))
        }));

        setContent(content, rows);
    }

    return { container: table, render }
}