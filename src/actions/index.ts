import "source-map-support/register";

import type { AWS } from "@serverless/typescript";
import createList from "./list/create";
import getList from "./list/get";
import deleteList from "./list/delete";

export default {
    createList,
    getList,
    deleteList,
} as AWS["functions"];
