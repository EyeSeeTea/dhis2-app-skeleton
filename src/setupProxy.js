// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require("http-proxy-middleware");
require("isomorphic-fetch");

/* react-script automatically executes src/setupProxy.js on init. Tasks:

    - Proxy requests from /dhis2/xyz to $REACT_APP_DHIS2_BASE_URL/xyz. Reason: Avoid problems with
      CORS and cross-domain cookies, as the app connects only to the local development server.

    - We perform a initial fetch to DHIS2 to retrieve a session cookie. API endpoints
      only need the Basic Auth header, but other endpoints work only with a session cookie.
*/

const dhis2UrlVar = "REACT_APP_DHIS2_BASE_URL";
const dhis2AuthVar = "REACT_APP_DHIS2_AUTH";
const proxyLogLevel = "REACT_APP_PROXY_LOG_LEVEL";

module.exports = function (app) {
    const targetUrl = process.env[dhis2UrlVar];
    const auth = process.env[dhis2AuthVar];
    const logLevel = process.env[proxyLogLevel] || "warn";

    if (!targetUrl) {
        console.error(`Set ${dhis2UrlVar} to base DHIS2 URL`);
        process.exit(1);
    }

    let cookieHeader = undefined;

    getD2Cookie(targetUrl, auth).then(cookie => {
        cookieHeader = cookie;
    });

    const proxy = createProxyMiddleware({
        target: targetUrl,
        auth,
        logLevel,
        changeOrigin: true,
        pathRewrite: { "^/dhis2/": "/" },
        onProxyReq: function (proxyReq, _req, _res) {
            if (cookieHeader) proxyReq.setHeader("cookie", cookieHeader);
        },
    });

    app.use(["/dhis2"], proxy);
};

async function getD2Cookie(targetUrl, auth) {
    if (!targetUrl || !auth) return;

    const authBase64 = new Buffer(auth).toString("base64");

    return fetch(targetUrl + "/api/me.json", {
        headers: new Headers({
            Authorization: "Basic " + authBase64,
            "Content-Type": "application/json",
        }),
    }).then(res => res.headers.get("set-cookie"));
}
