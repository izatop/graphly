import * as util from "util";

export const inspect = (data: any) => util.inspect(data, false, Infinity);
