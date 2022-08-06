import "source-map-support/register";

import type { AWS } from "@serverless/typescript";
import createList from "./list/create";
import getList from "./list/get";

export default {
    createList,
    getList
} as AWS["functions"];
