import "source-map-support/register";

import type { AWS } from "@serverless/typescript";
import createList from "./list/create";
import getList from "./list/get";
import deleteList from "./list/delete";
import updateList from "./list/update";

export default {
    createList,
    getList,
    deleteList,
    updateList,
} as AWS["functions"];
