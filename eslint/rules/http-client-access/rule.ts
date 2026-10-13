import { createArchitectureRule } from "../architecture/shared.ts";

export default createArchitectureRule(
    "http-client-access",
    "Check platform APIs, HTTP access, and DHIS2 client import boundaries.",
    "httpClientAccess"
);
