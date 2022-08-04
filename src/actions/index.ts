import "source-map-support/register";

import type { AWS } from "@serverless/typescript";
import createList from "./list/create";

export default {
    createList
} as AWS["functions"];
