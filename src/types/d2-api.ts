import { getMockApiFromClass } from "@eyeseetea/d2-api";
import { D2Api } from "@eyeseetea/d2-api/2.34";

export * from "@eyeseetea/d2-api/2.34";
export const getMockApi = getMockApiFromClass(D2Api);
