var express = require('express');
var router = express.Router();

var fetch = require('fetch');
//var node_fetch = require('node-fetch');
var axios = require('axios/dist/browser/axios.cjs');
var http = require('http');
//var nlp = require('node-nlp');
var natural_nlp = require('natural');
var refine = require('openrefine');
var os = require("os");
const util = require('util');

/*
* HOSTNAME, IP
* http://stackoverflow.com/questions/20553554/ddg#20554225
* https://www.abstractapi.com/guides/node-js-get-ip-address
*/
var hostname = os.hostname();
//var ip = os.networkInterfaces().address;
//window.location.hostname;
//var ip = req.socket.remoteAddress.split(':')[3];

/* DESARROLLO */
//const user ="0009-0000-8287-135X";
const client_id /* ID de cliente */ = "APP-4JCIPZXOXYNS6WV1";
const client_secret /* Código secreto del cliente */ = "124e8a7f-fdd4-4a8f-8b78-6ec7e17b75b9";
const servidor = "https://sandbox.orcid.org";
const servidor_pub = "https://pub.sandbox.orcid.org";

/* PRODUCCION */
//const user ="0009-0004-3741-8715";
//const client_id /* ID de cliente */ = "APP-GEKGUEO143RB1XGL";
//const client_secret /* Código secreto del cliente */ = "0985ab59-a02e-4ec2-ab41-961aa1668543";
//const servidor = "https://orcid.org";
//const servidor_pub = "https://pub.orcid.org";

const access_token = "9a2eb79b-a278-4702-ba25-b86054c72dc3";

/* GET users listing. */
/*OAuth*/
const get_oauth_code = servidor + "/oauth/authorize?client_id=" + client_id + "&response_type=code&scope=/authenticate&redirect_uri=";
//const get_oauth_code = servidor + "/oauth/authorize?client_id=" + client_id + "&response_type=code&scope=/authenticate&redirect_uri=https://ailanto-dev.intecca.uned.es";
//const get_oauth_code = servidor + "/oauth/authorize?client_id=" + client_id + "&response_type=code&scope=/authenticate&redirect_uri=http://ailanto-dev.intecca.uned.es:9002";
const post_oauth_code_token = servidor + "/oauth/token?client_id=" + client_id + "&client_secret=" + client_secret + "&grant_type=authorization_code&code=";
const get_oauth_userinfo = servidor + "/oauth/userinfo";
const get_api3_pub = servidor_pub + "/v3.0";
const get_pub = servidor_pub;

router.get('/boton/oauth/', function(req, res, next) {
    ip = "10.201.54.31";
    const get_oauth_code_redir = get_oauth_code + 'http://' + ip + ":3000/orcid/redir/";
    res.render('orcid_boton', { title: 'ORCID OAuth 1', subtitle: servidor, message: 'Aprieta el botón!', url: get_oauth_code_redir});
});

router.get('/redir/', function(req, res, next) {
    var response = "Vacío";

    /*
    * COOKIES (node.js ver cookie)
    * https://stackoverflow.com/questions/3393854/get-and-set-a-single-cookie-with-node-js-http-server
    */
    function parseCookies (request) {
        var list = {},
            rc = request.cookies;

        rc && rc.split(';').forEach(function( cookie ) {
            var parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });

        return list;
    }
    // To Read a Cookie
    var cookies = parseCookies(util.inspect(req));

    /*
    * POST (node.js post request)
    * https://stackoverflow.com/questions/6158933/how-is-an-http-post-request-made-in-node-js
    */
    var request = require('request');

    request.post(
        post_oauth_code_token,
        { json: { code: req.query.code } },
        function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log(body);
            }
        }
    );

    // POST OAUth 2 Access_token
    fetch.fetchUrl(post_oauth_code_token + req.query.code, {method: "POST",
        headers: {
            Accept: "*/*",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
            client_id: client_id,
            client_secret: client_secret,
            grant_type: "authorization_code",
            code: req.query.code,
            redirect_uri: "http://127.0.0.1:3000/orcid/redir/"
        }}, function(error, meta, body) {
        //console.log(body.toString());
        response = body.toString();
        console.log(response);
        var access_token = JSON.parse(body);

        // GET OAUth 2 Userinfo
        fetch.fetchUrl(get_oauth_userinfo, {method: "GET",
            headers: {
                Accept: "*/*",
                Authorization: "Bearer " + access_token['access_token']
            }}, function(error, meta, body) {
            //console.log(body.toString());
            response += " " + body.toString();
            console.log(response);
            var userinfo = JSON.parse(body);

            // GET OAUth 3 Email
            fetch.fetchUrl(get_api3_pub + '/' + userinfo['sub'] + '/email', {method: "GET",
                headers: {
                    Accept: "application/orcid+json",
                    //Authorization: "Bearer " + access_token['access_token']
                }}, function(error, meta, body) {
                //console.log(body.toString());
                response += " " + body.toString();
                console.log(response);
                var email = JSON.parse(body);
                res.render('orcid_boton', {
                    title: 'ORCID OAuth 2',
                    subtitle: ' Code: ' + req.query.code + ' & Cookies: ' + util.inspect(cookies) + ' & Access_token: ' + access_token['access_token'] + ' & ORCID userinfo : ' + userinfo['sub'] + ' & ORCID emails: ' + (email['email'].length > 0 ? (email['email'].length > 1 ? (email['email'].length > 2 ? email['email'][0]['email'] + " " + email['email'][1]['email'] + " " + email['email'][2]['email'] : email['email'][0]['email'] + " " + email['email'][1]['email']) : email['email'][0]['email']) : "No email"),
                    message: util.inspect(response),
                    url: ""
                });
            });
        });
    });
});

router.post('/', function(req, res, next) {
    res.send(util.inspect(req.url));
});

/*OpenID*/
/*Impkicit OAuth*/
const get_openid_token = servidor + "/oauth/authorize?response_type=token&redirect_uri=http:%2F%2F127.0.0.1:3000%2Forcid%2F&client_id=" + client_id + "&scope=openid&nonce=whatever";

router.get('/boton/openid/', function(req, res, next) {
    res.render('orcid_boton', { title: 'ORCID OpenID', subtitle: servidor, message: 'Aprieta el botón!', url: get_openid_token });
});

router.get('/', function(req, res, next) {
    /*
        REFINE ORCID SEARCH
    */
    const servidor_refine = "http://127.0.0.1:3333";
    const get_cindetec_5200 = "/command/core/get-rows?project=2105137373812&limit=10";

    const servidor = "https://orcid.org";
    const get_orcid_1 = servidor + "/orcid-search/search?firstName=ANA&lastName=&institution=UNED&keyword=&otherFields=true&orcid=";
    const get_all = servidor + "/orcid-search/search?firstName=AAAAAA&lastName=BBBBBB&institution=CCCCCC&keyword=DDDDD&otherFields=true&orcid=0000-0003-0538-2565";

    //http://127.0.0.1:3000/orcid/#access_token=f1d655c2-aa1b-4a36-85f8-4e6644cf0ead&token_type=bearer&expires_in=599&tokenVersion=1&persistent=true&id_token=eyJraWQiOiJzYW5kYm94LW9yY2lkLW9yZy0zaHBnb3NsM2I2bGFwZW5oMWV3c2dkb2IzZmF3ZXBvaiIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiczByUHpCbHAzajRQV3Vrc2lZc3dYQSIsImF1ZCI6IkFQUC00SkNJUFpYT1hZTlM2V1YxIiwic3ViIjoiMDAwOS0wMDAwLTgyODctMTM1WCIsImF1dGhfdGltZSI6MTcxMTAxMzc1NiwiaXNzIjoiaHR0cHM6XC9cL3NhbmRib3gub3JjaWQub3JnIiwiZXhwIjoxNzExMTAwNzI4LCJnaXZlbl9uYW1lIjoiZmpzYW5jaGV6IiwiaWF0IjoxNzExMDE0MzI4LCJub25jZSI6IndoYXRldmVyIiwiZmFtaWx5X25hbWUiOiJmanNhbmNoZXoiLCJqdGkiOiI5MzFjZjE0MS01OTVmLTRlOGEtYmViOC1kMDBiZDdiN2IxMDAifQ.nTOhe16KSXaR0RPGnIUcQhYzeVzBUY2QbIQ3-l63ErcOeqvOiUgL1TkiQONNo64_lEroHp1xzS7SQm7ih4utAU6cMr10l4Y9LAjPWo7Yy8_7VxhGgYYXYWmQ6xf1ulXPbYLj10CuR08j038nmDLvx8aU1hpYxa3mVF2mFSyWpvwfNJBK4kpQhaf73CZDezXK49TxlpLxJqc_vR8rMNG5YIC_OuqCYWSWq1gIPxUe3pD9697Hwa_k34mcfUGy48l1Af1fN0V_pXDNG8ULQwUzPM4vjJPYNv-lKbCR9XDen7Uo7IExM5GTtkwpwZdmzvpqp2lSqWRBRUaRqCYDJlkjNQ&tokenId=22783971
    var respuesta = "Vacío";
    var response = "Vacío";

    // GET
    fetch.fetchUrl(servidor_refine + get_cindetec_5200, {method: "GET"}, function(error, meta, body) {
        //var json_5200 = JSON.parse(body);
        //console.log(json_719['rows'][0]['cells'][1]['v']);
        //console.log(body.toString());
        response = body.toString();
        respuesta += '<h1>ORCID</h1>' +
            '   <h2>Refine GET Usuarios</h2>' +
            '        <h4>' +
            '        ' + response +
            '        </h4>' +
            '        <div id="demo1"></div>';
        var nombres = "Ana";
        var apellidos ="López";

        // GET
        fetch.fetchUrl(get_orcid_1.replace("AAAA", nombres).replace("BBBB", apellidos), {method: "GET"}, function(error, meta, body) {
            //console.log(body.toString());
            response = body.toString();
            respuesta = respuesta +
                '   <h2>ORCID GET Search</h2>' + get_orcid_1.replace("AAAA", nombres).replace("BBBB", apellidos) +
                '        <h4>' +
                '        ' + response +
                '        </h4>' +
                '        <script>response.toString()\n' +
                '            const servidor = "http://127.0.0.1:3333";\n' +
                '            //const param = JSON.stringify({engine:{"facets":[],"mode":"row-based"}, clusterer:{"type":"knn","function":"levenshtein","column":"surname","params":{"radius":1,"blocking-ngram-size":3}});\n' +
                '            const params = JSON.stringify({table:"customers",limit:20});\n' +
                '            const xmlhttp = new XMLHttpRequest();\n' +
                '            xmlhttp.onload = function() {\n' +
                '                const myObj = JSON.parse(this.responseText);\n' +
                '                var text = "<select id=\\"myselect2\\" onchange=\\"/*parse(this.value.split(\'_\')[0], \'demo2\');*/ parse_html_nivel(\'lists\', this.value.split(\'_\')[1], 4, \'demo2\', [\'pcul:tieneNucleoPoblacion\', this.value.split(\'_\')[1]])\\"><option value=\\"\\">Choose an Ancient Place:</option>";\n' +
                '                for (var x in myObj) {\n' +
                '                    text += "<option value=\\"" + myObj[x][\'o:id\'] + \'_\' + myObj[x][\'o:title\'] + "\\">" + x + " " + myObj[x][\'o:title\'] + "</option>";\n' +
                '                }\n' +
                '                text += "</select>";\n' +
                '                document.getElementById("myselect2").outerHTML = text;\n' +
                '            };\n' +
                '            xmlhttp.open("GET", servidor + "/command/core/get-models?project=2067728589035", true);\n' +
                '            //xmlhttp.open("POST", servidor + "/command/core/compute-clusters?project=2238994161529", true);\n' +
                '            //xmlhttp.open("GET", servidor + "/command/core/compute-clusters/?project=project&sort_by=title&csrf_token=sdwNoJKDwLRkG5JPZmfGxlH5Flszr45M", true);\n' +
                '            xmlhttp.setRequestHeader("X-PINGOTHER", "pingpong");\n' +
                '            xmlhttp.setRequestHeader("Content-Type", "application/xml");\n' +
                '            //xmlhttp.setRequestHeader("Content-Type", "application/json; charset=utf8");\n' +
                '            xmlhttp.withCredentials = true;\n' +
                '            xmlhttp.setRequestHeader("Access-Control-Allow-Origin", "*");\n' +
                '            xmlhttp.send("");\n' +
                '            //xmlhttp.send(params);\n' +
                '        </script>\n' +
                '        <div id="demo2"></div>';
        });
    });

    /*
       ORCID API PUBLICA
    */
    const servidor_api = "https://pub.sandbox.orcid.org";
    const get_public = "/v3.0/0009-0000-8287-135X/";
    const get_solr = "/v3.0/search?q=given-names:*sanchez*";

    // GET
    fetch.fetchUrl(servidor_api + get_public, {method: "GET"}, function(error, meta, body) {
        //var token = JSON.parse(body);
        //console.log(json_719['rows'][0]['cells'][1]['v']);
        //console.log(body.toString());
        response = body.toString();
        respuesta = respuesta + '<h2>ORCID API Public</h2>' +
            '   <h3>ORCID GET User</h3>' +
            '        <h4>' +
            '        ' + response +
            '        </h4>' +
            '        <div id="demo3"></div>';
        // GET
        fetch.fetchUrl(servidor_refine + get_cindetec_5200, {method: "GET"}, function(error, meta, body) {
            var json_5200 = JSON.parse(body);
            json_5200['rows'].forEach(function(item_5200){
                if(item_5200['cells'][1]['v'] !== ''){
                    respuesta = respuesta + item_5200['cells'][0]['v'] + item_5200['cells'][1]['v'];
                    // GET
                    fetch.fetchUrl(servidor_api + get_solr.replace("sanchez", item_5200['cells'][1]['v']), {method: "GET"}, function(error, meta, body) {
                        //console.log(body.toString());
                        response = body.toString();
                        respuesta = respuesta +
                            '   <h3>ORCID GET Search Solr Users</h3>' +
                            '        <h4>' +
                            '        ' + response +
                            '        </h4>' +
                            '        <div id="demo4"></div>';
                    });
                }
            });
        });
    });

    /*
       ORCID API MEMBER
    */
    const servidor_prueba = "https://sandbox.orcid.org";

    /* OAuth */
    const get_oauth_code = "/oauth/authorize?client_id=" + client_id + "&response_type=code&scope=/authenticate&redirect_uri=http://127.0.0.1:3000/orcid/";

    /* RESPUESTA: http://127.0.0.1:3000/orcid/?code=O-k161 */
    const get_oauth_token = "/oauth/token?client_id=" + client_id + "&client_secret=749daee6-c5ec-466a-b86b-b58453e3a01c&grant_type=authorization_code&code=O-k161";
    /*<oauth>
        <error_description>Method GET is not supported for token requests. POST IS supported, but BASIC authentication is the preferred method of authenticating clients.</error_description>
        <error>invalid_request</error>
    </oauth>*/
    const post_oauth_token = "/oauth/token?client_id=" + client_id + "&client_secret=749daee6-c5ec-466a-b86b-b58453e3a01c&grant_type=authorization_code&code=O-k161";

    /* Impkicit OAuth */
    const get_openid_token = "/oauth/authorize?response_type=token&redirect_uri=http:%2F%2F127.0.0.1:3000%2Forcid%2F&client_id=" + client_id + "&scope=openid&nonce=whatever";
    /* RESPUESTA: http://127.0.0.1:3000/orcid/#access_token=0ce67482-4b3e-48c4-8700-464fa1c9b9d2&token_type=bearer&expires_in=599&tokenVersion=1&persistent=true&id_token=eyJraWQiOiJzYW5kYm94LW9yY2lkLW9yZy0zaHBnb3NsM2I2bGFwZW5oMWV3c2dkb2IzZmF3ZXBvaiIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiWkxqa0s4ekNFb01xbE1rZC1SajNhZyIsImF1ZCI6IkFQUC00SkNJUFpYT1hZTlM2V1YxIiwic3ViIjoiMDAwOS0wMDAwLTgyODctMTM1WCIsImF1dGhfdGltZSI6MTcxMDI3MjEyMSwiaXNzIjoiaHR0cHM6XC9cL3NhbmRib3gub3JjaWQub3JnIiwiZXhwIjoxNzEwNzkwNTQ1LCJnaXZlbl9uYW1lIjoiZmpzYW5jaGV6IiwiaWF0IjoxNzEwNzA0MTQ1LCJub25jZSI6IndoYXRldmVyIiwiZmFtaWx5X25hbWUiOiJmanNhbmNoZXoiLCJqdGkiOiJmY2U4MDcxOC01ZDk3LTQ5MjItODA4My0xZWRlMDNmMzU1YzAifQ.VKtsDxBhoZlTBS1JDcKFc_7AqQlyz8i74frGMf54UMvxHH3MEcv1s73ZDeFpeRnF5Q5K5Kbqo1oBINqZ4HrqpvneGScamoleG4kobAijJthWoKKYijGEKm9WGeV4wgYARqQ72L5_mLCj_csxR4nImgsMKt8lhrdNgfSk7jeS7h4k16-N82BhHQ2zo0wZ0Uomgy9LgicdNWz2M1THXKjk9c-WcSxgrO0Dk916Ywy_uTVOKTyjYBfBGz9F9A6x49x_0FMp8d6H_IbjLPpCRoSvAMpBuCd86KZsz1-Ywh7psexVAHj6oLBDG_P8_3iynZsBq5YhLCjVBiwOziUIvpFiHw&tokenId=22763089 */

    /* API read info*/
    //const get_oauth_read_ = "/oauth/authorize?client_id=" + client_id + "&response_type=code&scope=/read-limited&redirect_uri=http://127.0.0.1:3000/orcid/";
    const get_oauth_read_= "/oauth/authorize?client_id=[" + client_id + "]&response_type=code&scope=/read-limited%20/activities/update%20/person/update&redirect_uri=http://127.0.0.1:3000/orcid/";

    //const get_oauth_read  =  "/oauth/token?client_id=" + client_id + "&client_secret=749daee6-c5ec-466a-b86b-b58453e3a01c&scope=/read-limited&grant_type=client_credentials";
    const get_oauth_read  =  "/oauth/token?client_id=" + client_id + "&client_secret=749daee6-c5ec-466a-b86b-b58453e3a01c&data-scopes='/read-limited%20/activities/update%20/person/update'&grant_type=client_credentials";

    const get_token_userinfo = "/oauth/userinfo"; /*curl -i -L -H "Accept: application/json" -H "Authorization: Bearer aa4629f3-b0a2-4edd-b77a-398d7afe3c90" 'https://orcid.org/oauth/userinfo' */
    const get_token_address = "/oauth/"; /**/

    /* OPENID */


    // GET
    fetch.fetchUrl(servidor_prueba + get_openid_token, {method: "GET"}, function(error, meta, body) {
        //var token = JSON.parse(body);
        //console.log(json_719['rows'][0]['cells'][1]['v']);
        //console.log(body.toString());
        response = body.toString();
        respuesta = respuesta + '<h2>ORCID API Memeber</h2>' +
            '   <h3>ORCID GET Auth</h3>' +
            '        <h4>' +
            '        ' + response +
            '        </h4>' +
            '        <div id="demo5"></div>';
        var nombres = "Ana";
        var apellidos ="López";

        // GET Userinfo
        fetch.fetchUrl(servidor_prueba + get_token_userinfo, {method: "GET",
            headers: {
                Accept: "*/*",
                Authorization: "Bearer 2e4cebb8-eebd-4ada-a3a2-dae228c71615"
            }}, function(error, meta, body) {
            //console.log(body.toString());
            response = body.toString();
            respuesta = respuesta +
                '   <h3>ORCID GET userinfo</h3>' +
                '        <h4>' +
                '        ' + response +
                '        </h4>' +
                '        <div id="demo6.1"></div>';

            // POST Userinfo
            fetch.fetchUrl(servidor_prueba + get_oauth_read, {method: "POST",
                headers: {
                    Accept: "*/*",
                    Authorization: "Bearer 2e4cebb8-eebd-4ada-a3a2-dae228c71615"
                }}, function(error, meta, body) {
                //console.log(body.toString());
                response = body.toString();
                res.send(respuesta +
                    '   <h3>ORCID POST read-limited</h3>' +
                    '        <h4>' +
                    '        ' + response +
                    '        </h4>' +
                    '        <script>response.toString()\n' +
                    '            const servidor = "http://127.0.0.1:3333";\n' +
                    '            //const param = JSON.stringify({engine:{"facets":[],"mode":"row-based"}, clusterer:{"type":"knn","function":"levenshtein","column":"surname","params":{"radius":1,"blocking-ngram-size":3}});\n' +
                    '            const params = JSON.stringify({table:"customers",limit:20});\n' +
                    '            const xmlhttp = new XMLHttpRequest();\n' +
                    '            xmlhttp.onload = function() {\n' +
                    '                const myObj = JSON.parse(this.responseText);\n' +
                    '                var text = "<select id=\\"myselect2\\" onchange=\\"/*parse(this.value.split(\'_\')[0], \'demo2\');*/ parse_html_nivel(\'lists\', this.value.split(\'_\')[1], 4, \'demo2\', [\'pcul:tieneNucleoPoblacion\', this.value.split(\'_\')[1]])\\"><option value=\\"\\">Choose an Ancient Place:</option>";\n' +
                    '                for (var x in myObj) {\n' +
                    '                    text += "<option value=\\"" + myObj[x][\'o:id\'] + \'_\' + myObj[x][\'o:title\'] + "\\">" + x + " " + myObj[x][\'o:title\'] + "</option>";\n' +
                    '                }\n' +
                    '                text += "</select>";\n' +
                    '                document.getElementById("myselect2").outerHTML = text;\n' +
                    '            };\n' +
                    '            xmlhttp.open("GET", servidor + "/command/core/get-models?project=2067728589035", true);\n' +
                    '            //xmlhttp.open("POST", servidor + "/command/core/compute-clusters?project=2238994161529", true);\n' +
                    '            //xmlhttp.open("GET", servidor + "/command/core/compute-clusters/?project=project&sort_by=title&csrf_token=sdwNoJKDwLRkG5JPZmfGxlH5Flszr45M", true);\n' +
                    '            xmlhttp.setRequestHeader("X-PINGOTHER", "pingpong");\n' +
                    '            xmlhttp.setRequestHeader("Content-Type", "application/xml");\n' +
                    '            //xmlhttp.setRequestHeader("Content-Type", "application/json; charset=utf8");\n' +
                    '            xmlhttp.withCredentials = true;\n' +
                    '            xmlhttp.setRequestHeader("Access-Control-Allow-Origin", "*");\n' +
                    '            xmlhttp.send("");\n' +
                    '            //xmlhttp.send(params);\n' +
                    '        </script>\n' +
                    '        <div id="demo6.2"></div>')
            });

        });
    });

});

module.exports = router;
