import {create} from "../lib/utils.js";

function SearchRow() {
    return create("form", {class: "search-bar", name: "search"},
        create("label", {class: "search-wrapper"},
            create("i", {class: "icon search-icon", "aria-hidden": "true"}),
            create("input", {
                type: "text",
                name: "search",
                class: "input",
                placeholder: "Search"
            })
        ),
        create("button", {
            type: "reset",
            class: "button reset-wrapper",
        },
            "Reset all filters",
            create("i", {class: "icon reset-icon", "aria-hidden": "true"})
        )
    );
}


export function initSearching(redraw) {
    const searchContainer = SearchRow();

    const apply = (query) => {
        if (searchContainer.elements['search'].value) {
            return Object.assign({}, query, {
                search: searchContainer.elements['search'].value,
            })
        } else {
            return query;
        }
    }

    const plugin = () => {
        return { type: "before", element: searchContainer }
    }

    searchContainer.addEventListener("submit", (event) => {
        event.preventDefault();
        redraw();
    });
    searchContainer.addEventListener("change", redraw);
    searchContainer.addEventListener("reset", () => {
        setTimeout(redraw);
    });

    return { plugin, apply };
}