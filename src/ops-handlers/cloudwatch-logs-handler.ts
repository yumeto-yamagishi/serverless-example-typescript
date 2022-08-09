import "source-map-support/register";
import {
  CloudWatchLogsDecodedData,
  CloudWatchLogsHandler,
} from "aws-lambda";
import { gunzip } from "zlib";
import { promisify } from "util"

const gunzipAsync = promisify(gunzip);

// triggered by subscription filter
export const main: CloudWatchLogsHandler = async (event) => {
  const decoded = Buffer.from(event.awslogs.data, "base64");
  const result = await gunzipAsync(decoded);
  const json: CloudWatchLogsDecodedData = JSON.parse(
    result.toString("ascii")
  );

  json.logEvents.forEach((event) => {
    console.log("detail info", JSON.parse(event.message));
  });
};
