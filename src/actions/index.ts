import "source-map-support/register";

import type { AWS } from "@serverless/typescript";
import createList from "./list/create";
import getList from "./list/get";
import deleteList from "./list/delete";
import updateList from "./list/update";
import createTask from "./task/create";

export default {
    createList,
    getList,
    deleteList,
    updateList,
    createTask,
} as AWS["functions"];
