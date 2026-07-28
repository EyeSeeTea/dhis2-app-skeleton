import { D2Api } from "@eyeseetea/d2-api/2.41";
import { getMockApiFromClass } from "@eyeseetea/d2-api";

export type { MetadataPick } from "@eyeseetea/d2-api/2.41";

export { D2Api } from "@eyeseetea/d2-api/2.41";
export { CancelableResponse } from "@eyeseetea/d2-api";

export const getMockApi = getMockApiFromClass(D2Api);
