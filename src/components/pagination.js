import {create, getPages, classNames as cx, setContent} from "../lib/utils.js";

function Icon({ name }) {
    return create('i', {
        className: cx('icon', name),
        'aria-hidden': 'true'
    });
}

function Label({ page, isChecked }) {
    return create('label', {
        className: 'pagination-button',
        'aria-label': `Goto page ${page}`
    }, create('input', {
        type: 'radio',
        name: 'page',
        value: page,
        checked: isChecked ? 'checked' : undefined,
    }), create('span', {}, page));
}

function Button({ name, content }) {
    return create('button', {
        className: 'pagination-button',
        type: 'submit',
        name
    }, content);
}

function Status({ fromRow, toRow, totalRows }) {
    return create('div', {
        className: 'pagination-status'
    },
        "Showing ", create('span', {}, fromRow),
        " to ", create('span', {}, toRow),
        " of ", create('span', {}, totalRows),
        " entries"
    )
}

function LimitSelector({ options, defaultLimit }) {
    return create('div', {
        className: 'dropdown-select rows-per-page'
    }, create('select', {
        name: 'rowsPerPage'
    },
        ...options.map(option => create('option', {
            value: option,
            selected: (option === defaultLimit) ? 'selected' : undefined,
        }, option))
    ))
}


export const initPagination = (redraw, {
    defaultLimit = 10,
    options = [10, 20, 50, 100] } = {}
) => {
    const pagesContainer = create('div', {
        className: 'pagination-pages'
    })
    let statusContainer = Status({
        fromRow: 0,
        toRow: 0,
        totalRows: 0
    })

    const container = create('form', {
        name: 'pagination',
        className: 'pagination-container',
    },
        create('div', {
            className: 'pagination-controls'
        },
            Button({
                name: 'first',
                content: Icon({ name: 'chevrons-left' })
            }),
            Button({
                name: 'prev',
                content: Icon({ name: 'left' })
            }),
            pagesContainer,
            Button({
                name: 'next',
                content: Icon({ name: 'right' })
            }),
            Button({
                name: 'last',
                content: Icon({ name: 'chevrons-right' })
            })
        ),
        create('div', {
            className: 'pagination-settings'
        },
            statusContainer,
            LimitSelector({
                options,
                defaultLimit
            })
        )
    );

    let pageCount;
    let limit = defaultLimit;
    let page = 1;

    const onChange = () => {
        const nextLimit = parseInt(container.elements['rowsPerPage'].value);
        if (nextLimit !== limit) {
            limit = nextLimit;
            page = 1;
        } else {
            page = parseInt(container.elements['page'].value);
        }

        redraw();
    }

    const apply = (query) => {
        return Object.assign({}, query, {
            limit,
            page
        });
    };

    const update = (total) => {
        pageCount = Math.ceil(total / limit);

        const visiblePages = getPages(page, pageCount, 5);
        setContent(pagesContainer, visiblePages.map(pageNumber => Label({
            page: pageNumber,
            isChecked: pageNumber === page
        })));

        const nextStatus = Status({
            fromRow: (page - 1) * limit + 1,
            toRow: page * limit,
            totalRows: total
        });
        statusContainer.replaceWith(nextStatus);
        statusContainer = nextStatus;
    }

    const plugin = () => {
        return { type: 'after', element: container }
    }

    container.addEventListener('change', onChange);
    container.addEventListener('submit', (event) => {
        event.preventDefault();
        switch (event.submitter.name) {
            case 'prev': page = Math.max(1, page - 1); break;
            case 'next': page = Math.min(pageCount, page + 1); break;
            case 'first': page = 1; break;
            case 'last': page = pageCount; break;
        }
        redraw();
    });

    return {plugin, apply, update};
}