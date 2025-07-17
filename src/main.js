import './fonts/ys-display/fonts.css'
import './style.css'

// Работа с данными
import {ServerApi} from "./components/server.js";
import {initData} from "./components/data.js";

// Плагины к таблице
import {initSorting} from "./components/sorting.js";
import {initPagination} from "./components/pagination.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";
import {initEditing} from "./components/editing.js";

// Реализация базовой таблицы
import {initTable} from "./components/table.js";

// Основные константы это адрес сервера, схема данных и корневой элемент интерфейса
//const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';
const BASE_URL = 'http://localhost:3002/api';
const schema = [
    { name: 'date', label: 'Date', sort: true, filter: "text", edit: "date" },
    { name: 'customer', label: 'Customer', filter: "text", edit: "select", options: "customers" },
    { name: 'seller', label: 'Seller', filter: "select", options: "sellers", edit: "select" },
    { name: 'total', label: 'Total', sort: true, filter: "range", edit: "number" },
];
const app = document.getElementById('app');

// Инициализируем слой данных с серверной реализацией АПИ
// Но придерживаясь того же набора функций мы можем передать сюда и другую реализацию
// Например для работы локально в браузере без запросов к серверу
const api = initData( ServerApi(BASE_URL) );

// Инициализируем плагины, чтобы связать их с функцией перерисовки и нашим api
const sorting = initSorting(redraw);
const pagination = initPagination(redraw);
const filtering = initFiltering(redraw);
const searching = initSearching(redraw);
const editing = initEditing(redraw, api);

// Инициализируем таблицу
const { container, render } = initTable({
    schema,
    plugins: [ // Порядок применения плагинов важен так как они могут менять схему
        editing.plugin,
        searching.plugin,
        filtering.plugin,
        sorting.plugin,
        pagination.plugin,
    ]
});

// Выводим пустую таблицу на страницу
app.replaceChildren( container );

// Основная функция перерисовки так как объявлена через function доступна нам ранее для связывания
async function redraw() {
    // Формируем запрос к серверу
    let query = {};
    query = sorting.apply(query);
    query = pagination.apply(query);
    query = filtering.apply(query);
    query = searching.apply(query);

    // Получаем данные
    const { items, total } = await api.getRecords(query);

    // Отрисовываем таблицу
    render(items);
    // И обновляем плагины, которые требуют перерисовки после получения данных
    // в нашем случае это только пагинация
    pagination.update(total);
}

// Получаем индексы прежде всего (для работы select)
api.getIndexes().then(indexes => {
    // Передаем нужным плагинам
    filtering.update(indexes);
    editing.update(indexes);

    // вызываем основной цикл отрисовки
    return redraw();
})