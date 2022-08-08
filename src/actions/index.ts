import "source-map-support/register";

import type { AWS } from "@serverless/typescript";
import createList from "./list/create";
import getList from "./list/get";
import deleteList from "./list/delete";
import updateList from "./list/update";
import createTask from "./task/create";
import getTask from "./task/get";
import deleteTask from "./task/delete";

export default {
    createList,
    getList,
    deleteList,
    updateList,
    createTask,
    getTask,
    deleteTask,
} as AWS["functions"];
