/**
 * Клонирует шаблон и собирает все элементы с атрибутом data-name
 *
 * @param {string} templateId - ID элемента шаблона, существующего в документе (не безопасно!)
 * @returns {{container: Node, elements: unknown}} - Объект, содержащий контейнер и именованные элементы
 *
 * Подробнее: Эта функция использует HTML-шаблоны (<template>) для создания
 * переиспользуемых фрагментов DOM. Функция находит шаблон по ID, клонирует его
 * и собирает все вложенные элементы, у которых есть атрибут data-name,
 * в удобный объект для дальнейшего доступа к этим элементам.
 */
export function cloneTemplate(templateId) {
    // Находим шаблон в документе по его ID
    const template = document.getElementById(templateId);

    // Клонируем первый дочерний элемент шаблона вместе со всеми его потомками
    const clone = template.content.firstElementChild.cloneNode(true);

    // Находим все элементы с атрибутом data-name и создаем объект,
    // где ключами являются значения data-name, а значениями - сами элементы
    const elements = Array.from(clone.querySelectorAll('[data-name]')).reduce((acc, el) => {
        acc[el.dataset.name] = el;
        return acc;
    }, {});

    // Возвращаем объект с контейнером (клоном шаблона) и именованными элементами
    return {
        container: clone,
        elements: elements
    };
}

/**
 * Преобразует объект FormData в обычный JavaScript-объект (только одиночные значения)
 *
 * @param {FormData} formData - Объект FormData для преобразования
 * @returns {Object} - Обычный объект со значениями формы
 *
 * Подробнее: FormData — это специальный интерфейс для работы с данными форм,
 * но часто удобнее работать с обычными JavaScript-объектами. Эта функция
 * преобразует FormData в простой объект, где ключи соответствуют именам полей формы,
 * а значения - введенным данным. Обратите внимание, что эта функция обрабатывает
 * только одиночные значения и не поддерживает множественные значения для одного ключа
 * (как в случае с multiple select или checkbox).
 */
export function processFormData(formData) {
    // Преобразуем entries() в массив пар [ключ, значение] и создаем объект
    return Array.from(formData.entries()).reduce((result, [key, value]) => {
        result[key] = value;
        return result;
    }, {});
}

/**
 * Преобразует коллекцию в объект-индекс по уникальному полю
 *
 * @param {Array} arr - Исходная коллекция объектов
 * @param {string} field - Должно быть уникальным!
 * @param {(Object) => any} val - Функция преобразования значений
 * @returns {Object} - Объект, индексированный по указанному полю
 *
 * Подробнее: Эта функция полезна для создания справочников или поисковых индексов.
 * Она преобразует массив объектов в объект, где ключами выступают значения
 * указанного поля каждого объекта, а значениями — результат применения
 * функции-преобразователя к исходному объекту. Это позволяет быстро находить
 * объекты по их уникальному идентификатору с вычислительной сложностью O(1)
 * вместо O(n) при переборе массива.
 */
export const makeIndex = (arr, field, val) => arr.reduce((acc, cur) => ({
    ...acc,  // Копируем все уже накопленные значения
    [cur[field]]: val(cur)  // Добавляем новое поле с именем из cur[field] и значением из val(cur)
}), {});

/**
 * Возвращает массив номеров страниц, центрированный вокруг текущей страницы
 *
 * @param {number} currentPage - Текущая активная страница
 * @param {number} maxPage - Максимальный доступный номер страницы
 * @param {number} limit - Максимальное количество отображаемых страниц
 * @returns {number[]} Массив номеров страниц
 *
 * Подробнее: Эта функция создает массив номеров страниц для пагинации,
 * центрированный вокруг текущей страницы. Она особенно полезна для
 * пользовательских интерфейсов, где нужно отображать ограниченное количество
 * номеров страниц (например, "1 2 3 ... 10" вместо "1 2 3 4 5 6 7 8 9 10").
 *
 * Алгоритм гарантирует, что:
 * 1. Текущая страница находится примерно в центре отображаемого диапазона
 * 2. Количество отображаемых страниц не превышает указанный лимит
 * 3. Диапазон корректируется у краев (начало и конец списка страниц)
 */
export function getPages(currentPage, maxPage, limit) {
    // Проверяем, что входные данные являются корректными числами
    currentPage = Math.max(1, Math.min(maxPage, currentPage));  // currentPage должен быть от 1 до maxPage
    limit = Math.min(maxPage, limit);  // limit не должен превышать maxPage

    // Вычисляем диапазон страниц для отображения
    let start = Math.max(1, currentPage - Math.floor(limit / 2));  // Начинаем с currentPage минус половина лимита
    let end = start + limit - 1;  // Заканчиваем через limit страниц после start

    // Корректируем, если мы близко к концу
    if (end > maxPage) {
        end = maxPage;  // Не выходим за пределы максимальной страницы
        start = Math.max(1, end - limit + 1);  // Пересчитываем начало
    }

    // Создаем массив номеров страниц
    const pages = [];
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return pages;
}

/**
 * Объединяет несколько имен классов или объектов с именами классов в одну строку, удаляя дубликаты.
 *
 * @param {...(string|Object<string, boolean>)} names - Список имен классов в виде строк или объектов, где ключи — имена классов, а значения определяют их включение.
 * @return {string} Одна строка, содержащая все уникальные имена классов, разделенные пробелами.
 */
export function classNames(...names) {
    const classes = new Set();

    names.forEach(name => {
        if (typeof name === 'string') {
            if (name) classes.add(name);
        } else {
            Object.keys(name).forEach(key => {
                if (name[key]) {
                    classes.add(key);
                }
            });
        }
    });

    return Array.from(classes).join(' ');
}

/**
 * Устанавливает множество атрибутов на элемент DOM, включая обработку специальных атрибутов, таких как события, стили, классы и свойства dataset.
 *
 * @param {HTMLElement} element - Элемент DOM, к которому будут применены атрибуты.
 * @param {Object} attributes - Пары ключ-значение, представляющие атрибуты для установки.
 * - "children": Заменяет содержимое элемента предоставленными дочерними элементами или строками.
 * - "style": Может быть строкой для инлайн-CSS или объектом с парами ключ-значение для отдельных стилевых свойств.
 * - "class" или "className": Принимает строку из имен классов, разделенных пробелами, или массив имен классов.
 * - "data" или "dataset": Применяет значения к свойствам dataset элемента.
 * - Атрибуты обработчиков событий (например, onClick, onMouseOver): Добавляет слушатели событий для указанных событий.
 *
 * @return {HTMLElement} Элемент DOM после применения атрибутов.
 */
export function setAttributes(element, attributes) {
    Object.keys(attributes).forEach(key => {
        // если значение пустое ничего не делаем
        if (!attributes[key]) {
            return;
        }
        // если выглядит как onClick, то ставим событие
        if (/^on.+/.test(key)) {
            element.addEventListener(key.slice(2).toLowerCase(), attributes[key]);
            return;
        }

        // перебираем остальные варианты
        switch (key) {
            case 'children': // контент
                setContent(element, attributes[key]);
                break;
            case 'style': // стили и переменные CSS
                if (typeof attributes[key] === 'string') {
                    element.style.cssText = attributes[key];
                } else {
                    Object.keys(attributes[key]).forEach(subKey => {
                        if (/^--/.test(subKey)) {
                            element.style.setProperty(subKey, attributes[key][subKey]);
                        } else {
                            element.style[subKey] = String(attributes[key][subKey]);
                        }
                    });
                }
                break;
            case 'class': // имена классов, поддерживаем 2 варианта наименования для удобства
            case 'className':
                if (Array.isArray(attributes[key])) {
                    element.className = classNames(...attributes[key]);
                } else {
                    element.classList.add(...attributes[key].split(' '));
                }
                break;
            case 'data': // дата-сеты, поддерживаем 2 варианта наименования для удобства
            case 'dataset':
                Object.keys(attributes[key]).forEach(subKey => {
                    element.dataset[subKey] = String(attributes[key][subKey]);
                })
                break;
            default: // любой другой атрибут
                element.setAttribute(key, String(attributes[key]));
        }
    });

    return element;
}

/**
 * Устанавливает содержимое указанного элемента DOM. Содержимое может быть строкой, единственным узлом DOM,
 * массивом узлов или null. Если передано null или недопустимое значение, дочерние элементы элемента будут удалены.
 *
 * @param {Element} element Элемент DOM, содержимое которого будет установлено.
 * @param {string|Node|Node[]|null} [content=null] Содержимое для установки. Это может быть строка, единственный узел DOM, массив узлов или null.
 * @return {Element} Элемент DOM с обновленным содержимым.
 */
export function setContent(element, content = null) {
    if (typeof content === 'string') {
        element.textContent = content;
    } else if (content instanceof Node) {
        element.replaceChildren(content);
    } else if (Array.isArray(content)) {
        element.replaceChildren(...content);
    } else {
        element.replaceChildren();
    }

    return element;
}

/**
 * Единая функция создания HTML-элементов с атрибутами и контентом
 *
 * @param tag Имя тега или имя функции с заранее подготовленной реализацией более сложной структуры
 * @param props Объект атрибутов или параметров функции
 * @param children Контент который нужно установить
 * @returns {HTMLElement}
 *
 * @example
 * // такой вызов
 * create("div", { className: "container" },
 *      create("h1", { className: "title" }, "Hello"),
 *      create("p", { className: "subtitle", "world" })
 * )
 * // вернет нам элемент со следующей разметкой
 * <div className="container">
 *      <h1 className="title">Hello</h1>
 *      <p className="subtitle">world</p>
 * </div>
 */
export function create(tag, props, ...children) {
    if (typeof tag === 'function') {
        return tag({ ...props, children });
    }

    const element = document.createElement(tag);
    setAttributes(element, props);
    setContent(element, children);

    return element;
}

/**
 * Creates a deep clone of a given object, ensuring that nested objects, arrays, dates, maps, and sets
 * are also cloned properly. Primitives and functions are returned as-is.
 *
 * @param {any} obj The object to be deeply cloned. Can be of any type, including objects, arrays, dates, maps, or sets.
 * @return {any} A new object that is a deep clone of the input, or the input itself if it's a primitive or function.
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj; // Return primitives and functions as is
    }

    if (Array.isArray(obj)) {
        return obj.map(deepClone); // Handle arrays recursively
    }

    if (obj instanceof Date) {
        return new Date(obj); // Clone date objects
    }

    if (obj instanceof Map) {
        return new Map(Array.from(obj.entries()).map(([key, value]) => [deepClone(key), deepClone(value)])); // Clone maps
    }

    if (obj instanceof Set) {
        return new Set(Array.from(obj).map(deepClone)); // Clone sets
    }

    const clonedObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            clonedObj[key] = deepClone(obj[key]); // Clone properties recursively
        }
    }

    return clonedObj;
}

/**
 * Capitalizes the first character of the given string.
 *
 * @param {string} str - The string to capitalize. Must be a valid string.
 * @return {string} The input string with its first character converted to uppercase.
 * @throws {TypeError} If the input is not a string.
 */
export function capitalize(str) {
    if (typeof str !== 'string') {
        throw new TypeError('Input must be a string');
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}