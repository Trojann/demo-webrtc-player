function parse_query_string() {
    var obj = {};

    // add the uri object.
    // parse the host(hostname:http_port), pathname(dir/filename)
    obj.host = window.location.host;
    obj.hostname = window.location.hostname;
    obj.http_port =
        window.location.port == "" ? 80 : window.location.port;
    obj.pathname = window.location.pathname;
    if (obj.pathname.lastIndexOf("/") <= 0) {
        obj.dir = "/";
        obj.filename = "";
    } else {
        obj.dir = obj.pathname.substr(
            0,
            obj.pathname.lastIndexOf("/")
        );
        obj.filename = obj.pathname.substr(
            obj.pathname.lastIndexOf("/")
        );
    }

    // pure user query object.
    obj.user_query = {};

    // parse the query string.
    var query_string = String(window.location.search)
        .replace(" ", "")
        .split("?")[1];
    if (query_string === undefined) {
        query_string = String(window.location.hash)
            .replace(" ", "")
            .split("#")[1];
        if (query_string === undefined) {
            return obj;
        }
    }

    __fill_query(query_string, obj);

    return obj;
}

function __fill_query(query_string, obj) {
    // pure user query object.
    obj.user_query = {};

    if (query_string.length === 0) {
        return;
    }

    // split again for angularjs.
    if (query_string.indexOf("?") >= 0) {
        query_string = query_string.split("?")[1];
    }

    var queries = query_string.split("&");
    for (var i = 0; i < queries.length; i++) {
        var elem = queries[i];

        var query = elem.split("=");
        obj[query[0]] = query[1];
        obj.user_query[query[0]] = query[1];
    }

    // alias domain for vhost.
    if (obj.domain) {
        obj.vhost = obj.domain;
    }
}

function srs_init_rtc(id, query) {
    update_nav();
    $(id).val(build_default_rtc_url(query));
}

/**
* update the navigator, add same query string.
*/
function update_nav() {
    $("#srs_index").attr("href", "index.html" + window.location.search);
    $("#nav_srs_player").attr("href", "srs_player.html" + window.location.search);
    $("#nav_rtc_player").attr("href", "rtc_player.html" + window.location.search);
    $("#nav_rtc_publisher").attr("href", "rtc_publisher.html" + window.location.search);
    $("#nav_srs_publisher").attr("href", "srs_publisher.html" + window.location.search);
    $("#nav_srs_chat").attr("href", "srs_chat.html" + window.location.search);
    $("#nav_srs_bwt").attr("href", "srs_bwt.html" + window.location.search);
    $("#nav_vlc").attr("href", "vlc.html" + window.location.search);
}

// Special extra params, such as auth_key.
function user_extra_params(query, params) {
    var queries = params || [];

    for (var key in query.user_query) {
        if (key === 'app' || key === 'autostart' || key === 'dir'
            || key === 'filename' || key === 'host' || key === 'hostname'
            || key === 'http_port' || key === 'pathname' || key === 'port'
            || key === 'server' || key === 'stream' || key === 'buffer'
            || key === 'schema' || key === 'vhost' || key === 'api'
        ) {
            continue;
        }

        if (query[key]) {
            queries.push(key + '=' + query[key]);
        }
    }

    return queries;
}

function build_default_rtc_url(query) {
    // Use target to overwrite server, vhost and eip.
    console.log('?target=x.x.x.x to overwrite server, vhost and eip.');
    if (query.target) {
        query.server = query.vhost = query.eip = query.target;
        query.user_query.eip = query.target;
        delete query.target;
    }

    var server = (!query.server)? window.location.hostname:query.server;
    var vhost = (!query.vhost)? window.location.hostname:query.vhost;
    var app = (!query.app)? "live":query.app;
    var stream = (!query.stream)? "livestream":query.stream;
    var api = query.api? ':'+query.api : '';

    var queries = [];
    if (server !== vhost && vhost !== "__defaultVhost__") {
        queries.push("vhost=" + vhost);
    }
    if (query.schema && window.location.protocol !== query.schema + ':') {
        queries.push('schema=' + query.schema);
    }
    queries = user_extra_params(query, queries);

    var uri = "webrtc://" + server + api + "/" + app + "/" + stream + "?" + queries.join('&');
    while (uri.lastIndexOf("?") === uri.length - 1) {
        uri = uri.substr(0, uri.length - 1);
    }

    return uri;
};