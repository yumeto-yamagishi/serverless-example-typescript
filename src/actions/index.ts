import "source-map-support/register";

import createList from "./list/create";
import getList from "./list/get";
import deleteList from "./list/delete";
import updateList from "./list/update";
import createTask from "./task/create";
import getTask from "./task/get";
import deleteTask from "./task/delete";
import updateTask from "./task/update";

export default {
    createList,
    getList,
    deleteList,
    updateList,
    createTask,
    getTask,
    deleteTask,
    updateTask,
};
