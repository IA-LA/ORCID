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
//const client_id /* ID de cliente */ = "APP-4JCIPZXOXYNS6WV1";
//const client_secret /* Código secreto del cliente */ = "124e8a7f-fdd4-4a8f-8b78-6ec7e17b75b9";
//const servidor = "https://sandbox.orcid.org";
//const servidor_pub = "https://pub.sandbox.orcid.org";
//const redir = ":3000/orcid/redir/";
//const servidor_api = "https://pub.sandbox.orcid.org";


/* PRODUCCION */
const client_id /* ID de cliente */ = "APP-GEKGUEO143RB1XGL";
const client_secret /* Código secreto del cliente */ = "0985ab59-a02e-4ec2-ab41-961aa1668543";
const servidor = "https://orcid.org";
const servidor_pub = "https://pub.orcid.org";
//const redir = ":3000/orcid/redir/";
const redir = ":3000/orcid/menu/";
const servidor_api = "https://pub.orcid.org";

/* DSPLIEGUE */
//const servidor_despliegue="https://ailanto-dev.intecca.uned.es";
const servidor_despliegue="https://ailanto.intecca.uned.es";
const servidor_despliegue_cookie=servidor_despliegue+"/index_cookie.html";

/* GET users listing. */
/*OAuth*/
const get_oauth_code = servidor + "/oauth/authorize?client_id=" + client_id + "&response_type=code&scope=/authenticate&show_login=true&lang=es&state=darkly&redirect_uri=";
const get_oauth_code_register = servidor + "/oauth/authorize?client_id=" + client_id + "&response_type=code&scope=/authenticate&show_login=false&family_names=Apellidos&given_names=Nombre&email=correo%40uned.es&lang=es&state=darkly&redirect_uri=";
const get_oauth_code_signout = servidor + "/oauth/authorize?client_id=" + client_id + "&response_type=code&scope=/authenticate&prompt=login&lang=es&state=darkly&redirect_uri=";
//const get_oauth_code = servidor + "/oauth/authorize?client_id=" + client_id + "&response_type=code&scope=/authenticate&redirect_uri="+servidor_despliegure;
//const get_oauth_code = servidor + "/oauth/authorize?client_id=" + client_id + "&response_type=code&scope=/authenticate&redirect_uri="+servidor_despliegure+":9002";
const post_oauth_code_token = servidor + "/oauth/token?client_id=" + client_id + "&client_secret=" + client_secret + "&grant_type=authorization_code&code=";
const get_oauth_userinfo = servidor + "/oauth/userinfo";

/* MY_ORCID Cookie*/
const get_cookie_status= servidor + "/userStatus.json";
const get_cookie_config = servidor + "/config.json";
const get_cookie_userinfo = servidor + "/userInfo.json";
const get_cookie_emails = servidor + "/account/emails.json";
const get_cookie_affiliations = servidor + "/affiliations/affiliationGroups.json";

/* API */
const get_api3_pub = servidor_pub + "/v3.0";
const get_pub = servidor_pub;

/* Login */
const servidor_login = servidor + "/signin";
const servidor_logout = servidor + "/signout";
const servidor_institutional_login = servidor + "/institutional-signin";
//const servidor_institutional_oauth_param = servidor + "/institutional-signin?client_id=" + client_id + "&response_type=code&scope=/authenticate&family_names=Apellidos&given_names=Nombre&email=correo%40uned.es&lang=es&redirect_uri=";

/*
   ORCID API PUBLICA
*/
const get_public = "/v3.0";
const get_solr = "/search?q=";

router.get('/menu/', function(req, res, next) {
    /*
    * HOSTNAME, IP
    * http://stackoverflow.com/questions/20553554/ddg#20554225
    * https://www.abstractapi.com/guides/node-js-get-ip-address
    */
    var ip = req.socket.remoteAddress.split(':')[3];
    var ip = res.socket.remoteAddress.split(':')[3];
    if(ip !== '127.0.0.1'){
        ip = '10.201.54.31'; //IP fija dentro del rango del DHCP
        ip = '10.201.54.109';
    }

    /* Capturar #Ancla en la llamada a menú
    * https://stackoverflow.com/questions/18796421/capture-anchor-links-route-with-node-express-and-passport#18799198
    * https://stackoverflow.com/questions/12525928/how-to-get-request-path-with-express-req-object#12527220
    *
    * Capturar los Tokens
    * OK    : http://127.0.0.1:3000/orcid/menu/#access_token=0cc4e53d-6513-4b33-82b8-a9872e99bb3c&token_type=bearer&expires_in=599&tokenVersion=1&persistent=true&id_token=eyJraWQiOiJwcm9kdWN0aW9uLW9yY2lkLW9yZy03aGRtZHN3YXJvc2czZ2p1am84YWd3dGF6Z2twMW9qcyIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiMEFTY3ZvM3VIODlWd3QzM1JiUEN1ZyIsImF1ZCI6IkFQUC1HRUtHVUVPMTQzUkIxWEdMIiwic3ViIjoiMDAwOS0wMDA0LTM3NDEtODcxNSIsImF1dGhfdGltZSI6MTcxNjYzNDY4MiwiaXNzIjoiaHR0cHM6XC9cL29yY2lkLm9yZyIsImV4cCI6MTcxNjcyMTY5NSwiZ2l2ZW5fbmFtZSI6IkZyYW5jaXNjbyIsImlhdCI6MTcxNjYzNTI5NSwibm9uY2UiOiJ3aGF0ZXZlciIsImZhbWlseV9uYW1lIjoiU8OhbmNoZXoiLCJqdGkiOiJmZDg2NDQ1MS0yNGI5LTQ3ZjktYjg0MS0yMWFmYTEzOTU5MjgifQ.CFa__IBT7PZfv_CTaudMR7QkBxrllgS1g3VKY_H_0MO5Ie8hY4f4YzBiqGiYHeAzb9eRPB7nkB_bymxl7TSTKwwaIDJHIGgx9sKF_sQjdD5i-L4NaKnDmMHgvu4_cpLQhq56foyj3-ZsNxt5-yIKg1zlpdtVPs_e8rfEmAPLM5madPE5nM5iTeY-yqIlZjCLhDlRxHgNrkt_CL1h03ldtYe0Evt5zKRaaTk_cVLTHAweLBlqEzHUrLFo3D6wrFuxhWk2NQrChxaYUTTk45cLRoxu6rqQ5PAXSkT3RWnr8wo1GakkUnEmcT7P0AtCxADL9yIPbvG1WlQ8082xq3vrZQ&tokenId=447803632
    * ERROR : http://127.0.0.1:3000/orcid/menu/#error=access_denied&error_description=User%20denied%20access
    * */

    /*
    * OAuth      : ir('https://orcid.org/oauth/authorize?client_id=APP-GEKGUEO143RB1XGL&response_type=code&scope=/authenticate&show_login=true&lang=es&state=darkly&redirect_uri=http://127.0.0.1:3000/orcid/menu/');
    * OAuth Code : http://127.0.0.1:3000/orcid/menu/?code=5G0HnI&state=darkly
    * OAuth Token: https://orcid.org/oauth/authorize?client_id=APP-GEKGUEO143RB1XGL&response_type=code&scope=/authenticate&show_login=true&lang=es&state=darkly&redirect_uri=http://127.0.0.1:3000/orcid/menu/
    *
    * */
    if(req.query.state!==undefined){
        // Unauthorized: Error
        if(req.query.error!==undefined){

        }
        // Authorized: Access Token
        if(req.query.code!==undefined) {
            // POST OAUth 2 Access_token
            fetch.fetchUrl(post_oauth_code_token + req.query.code, {
                method: "POST",
                headers: {
                    Accept: "*/*",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data: {
                    client_id: client_id,
                    client_secret: client_secret,
                    grant_type: "authorization_code",
                    code: req.query.code,
                    redirect_uri: ip + redir
                }
            }, function (error, meta, body) {
                //console.log(body.toString());
                response = body.toString();
                console.log(response);
                var access_token = JSON.parse(body);

                // GET OAUth 2 Userinfo
                fetch.fetchUrl(get_oauth_userinfo, {
                    method: "GET",
                    headers: {
                        Accept: "*/*",
                        Authorization: "Bearer " + access_token['access_token']
                    }
                }, function (error, meta, body) {
                    //console.log(body.toString());
                    response += " " + body.toString();
                    console.log(response);
                    var userinfo = JSON.parse(body);

                    // GET OAUth 3 Email
                    fetch.fetchUrl(get_api3_pub + '/' + userinfo['sub'] + '/email', {
                        method: "GET",
                        headers: {
                            Accept: "application/orcid+json"
                        }
                    }, function (error, meta, body) {
                        //console.log(body.toString());
                        response += " " + body.toString();
                        console.log(response);
                        var email = JSON.parse(body);
                        res.render('orcid_boton', {
                            theme: 'darkly',
                            title: 'ORCID OAuth 2',
                            subtitle: ' Code: ' + req.query.code + ' & Access_token: ' + access_token['access_token'] + ' & ORCID userinfo : ' + userinfo['sub'] + ' & ORCID emails: ' + (email['email'] === undefined ? '' : email['email'].length > 0 ? (email['email'].length > 1 ? (email['email'].length > 2 ? email['email'][0]['email'] + " " + email['email'][1]['email'] + " " + email['email'][2]['email'] : email['email'][0]['email'] + " " + email['email'][1]['email']) : email['email'][0]['email']) : "No email"),
                            message: util.inspect(response),
                            url: servidor_despliegue_cookie
                        });
                    });
                });
            });
        }
    }
    /*
    * No OAuth
     */
    else {
        /* ORCID LOGGEDIN */
        //https://orcid.org/userStatus.json

        // GET ORCID LoggedIn
        fetch.fetchUrl('https://orcid.org/userStatus.json', {
            method: "GET",
            headers: {
                Accept: "application/orcid+json"
            }
        }, function (error, meta, body) {
            //console.log(body.toString());
            var response = body.toString();
            console.log(response);
            var loggedin = JSON.parse(body);
            console.log(loggedin['loggedIn']);
            if (loggedin['loggedIn'] === false) {
                console.log('FALSE LoogedIn' + req.protocol + req.hostname + req.headers.host + req.route.path + JSON.stringify(req.this));

                /*OAuth*/
                const get_oauth_code_redir = get_oauth_code + 'http://' + ip + redir;
                const get_oauth_code_redir_register = get_oauth_code_register + 'http://' + ip + redir;
                const get_oauth_code_redir_signout = get_oauth_code_signout + 'http://' + ip + redir;
                //DOBLE ENCODE
                const servidor_login_redir = servidor_login + '?client_id=' + client_id + '&redirect_uri=' + get_oauth_code + encodeURIComponent('http://' + ip + redir);
                const servidor_logout_redir = servidor_logout + '?redirect_uri=' + encodeURIComponent('http://' + ip + redir);
                const servidor_institutional_login_redir = servidor_institutional_login + '?client_id=' + client_id + '&redirect_uri=' + encodeURIComponent(get_oauth_code + 'http://' + ip + redir);
                /*SSO*/
                //const servidor_uned_sso_redir = "https://sso.uned.es/sso/index.aspx?URL=https%3A%2F%2Fwww.intecca.uned.es%2Fgiccu%2Fapi%2Fgcono%2Fauth%2Funed";
                const servidor_uned_sso_redir1 = "https://sso.uned.es/sso/index.aspx?URL=https%3A%2F%2F127.0.0.1:3000%2Forcid%2Fredir%2F";
                const servidor_uned_sso_redir2 = "https://sso.uned.es/sso/index.aspx?URL=" + encodeURIComponent(get_oauth_code_redir);
                const servidor_uned_sso_redir3 = "https://sso.uned.es/sso/index.aspx?URL=" + encodeURIComponent(servidor_despliegue_cookie);
                /*ORCID Saml*/
                const servidor_orcid_salm1 = "https://orcid.org/Shibboleth.sso/Login?SAMLDS=1&target=https%3A%2F%2Forcid.org%2Fshibboleth%2Fsignin&entityID=https%3A%2F%2Fwww.rediris.es%2Fsir%2Funedidp";


                /*MY_ORCID Cookie*/
                // RAIZ
                // TODO https://orcid.org/config.json ******************** LIBRE *********************************
                // TODO https://orcid.org/userStatus.json **************** LIBRE *********************************
                // TODO https://orcid.org/userInfo.json **********************************************************

                //VECTORS
                //https://orcid.org/assets/vectors/orcid.logo.svg
                //https://orcid.org/assets/vectors/
                //...

                //IMG
                //https://orcid.org/assets/img/organizations.jpg

                //MY-ORCID
                //https://orcid.org/my-orcid/?orcid=
                //https://orcid.org/my-orcid/externalIdentifiers.json
                //...

                // CUENTA
                //TODO https://orcid.org/account/emails.json *****************************************************
                //https://orcid.org/account/nameForm.json
                //https://orcid.org/account/countryForm.json
                //https://orcid.org/account/biographyForm.json
                //https://orcid.org/account/preferences.json

                // MENSAJES
                //https://orcid.org/inbox/unreadCount.json

                //AFFILIATIONS
                //https://orcid.org/affiliations/affiliationGroups.json

                // DELEGATORS
                //https://orcid.org/delegators/delegators-and-me.json

                //WORKS
                //https://orcid.org/works/worksExtendedPage.json?offset=0&sort=date&sortAsc=false&pageSize=50
                //https://orcid.org/works/groupingSuggestions.json

                //RESEARCH-RESOURCES
                //https://orcid.org/research-resources/researchResourcePage.json?offset=0&sort=date&sortAsc=false&pageSize=50

                //FUNDINGS
                //https://orcid.org/fundings/fundingGroups.json?&sort=date&sortAsc=false

                //PEER-REVIEWS
                //https://orcid.org/peer-reviews/peer-reviews-minimized.json?sortAsc=false

                /*OpenID*/
                /*Impkicit OAuth*/
                //const get_openid_token = servidor + "/oauth/authorize?response_type=token&redirect_uri=http:%2F%2F127.0.0.1:3000%2Forcid%2F&client_id=" + client_id + "&scope=openid&nonce=whatever";
                const get_openid_token = servidor + "/oauth/authorize?response_type=token&redirect_uri=http:%2F%2F" + ip + ":3000%2Forcid%2Fmenu%2F&client_id=" + client_id + "&scope=openid&nonce=whatever";
                const get_openid_token_userinfo = servidor + "/oauth/authorize?response_type=token&redirect_uri=http:%2F%2F" + ip + ":3000%2Forcid%2Fmenu%2F&client_id=" + client_id + "&scope=openid&nonce=whatever";

                res.render('orcid_menu', {
                    theme: (req.query.theme === undefined ? (req.query.state === undefined ? 'flatly' : req.query.state) : req.query.theme),
                    title: 'ORCID Menú',
                    subtitle: servidor,
                    message: 'Aprieta un botón!',
                    url: servidor_login_redir,
                    url0: servidor_logout,
                    url1: servidor_institutional_login_redir,
                    url2: servidor_uned_sso_redir1,
                    url3: servidor_uned_sso_redir2,
                    url4: servidor_uned_sso_redir3,
                    url5: servidor_orcid_salm1,
                    url01: get_oauth_code_redir,
                    url02: get_oauth_code_redir_register,
                    url03: get_oauth_code_redir_signout,
                    url10: get_openid_token,
                    url20: servidor_api,
                    url21: servidor_api + get_public,
                    url22: servidor_api + get_public + get_solr,
                    url230: get_oauth_code + 'http://' + ip + redir + "?theme=" + req.query.theme,
                    url231: post_oauth_code_token + 'http://' + ip + redir + "?theme=" + req.query.theme,
                    url232: get_oauth_code + 'http://' + ip + ":3000/orcid/boton/api/userinfo/",
                    url240: get_cookie_status,
                    url241: get_cookie_config,
                    url242: get_cookie_userinfo,
                    url243: get_cookie_emails,
                    url246: get_cookie_affiliations,
                    orcid: "0009-0003-3064-7331" //Cogerlo de la llamada de autorización
                });
            }
            else {
                console.log('TRUE LoggedIn');

                /*OAuth*/
                const get_oauth_code_redir = get_oauth_code + 'http://' + ip + redir;
                const get_oauth_code_redir_register = get_oauth_code_register + 'http://' + ip + redir;
                const get_oauth_code_redir_signout = get_oauth_code_signout + 'http://' + ip + redir;
                //DOBLE ENCODE
                const servidor_login_redir = servidor_login + '?client_id=' + client_id + '&redirect_uri=' + get_oauth_code + encodeURIComponent('http://' + ip + redir);
                const servidor_logout_redir = servidor_logout + '?redirect_uri=' + encodeURIComponent('http://' + ip + redir);
                const servidor_institutional_login_redir = servidor_institutional_login + '?client_id=' + client_id + '&redirect_uri=' + encodeURIComponent(get_oauth_code + 'http://' + ip + redir);
                /*SSO*/
                //const servidor_uned_sso_redir = "https://sso.uned.es/sso/index.aspx?URL=https%3A%2F%2Fwww.intecca.uned.es%2Fgiccu%2Fapi%2Fgcono%2Fauth%2Funed";
                const servidor_uned_sso_redir1 = "https://sso.uned.es/sso/index.aspx?URL=https%3A%2F%2F127.0.0.1:3000%2Forcid%2Fredir%2F";
                const servidor_uned_sso_redir2 = "https://sso.uned.es/sso/index.aspx?URL=" + encodeURIComponent(get_oauth_code_redir);
                const servidor_uned_sso_redir3 = "https://sso.uned.es/sso/index.aspx?URL=" + encodeURIComponent(servidor_despliegure_cookie);
                /*ORCID Saml*/
                const servidor_orcid_salm1 = "https://orcid.org/Shibboleth.sso/Login?SAMLDS=1&target=https%3A%2F%2Forcid.org%2Fshibboleth%2Fsignin&entityID=https%3A%2F%2Fwww.rediris.es%2Fsir%2Funedidp";

                /* ORCID eMAILS */
                //https://orcid.org/account/emails.json
                // GET OAUth 3 Email
                fetch.fetchUrl('https://orcid.org/account/emails.json', {
                    method: "GET",
                    headers: {
                        Accept: "application/orcid+json"
                    }
                }, function (error, meta, body) {
                    console.log(body.toString());
                    var response = body.toString();
                    //console.log(response);
                    var loggedin = JSON.parse(body);
                    console.log(loggedin);
                });


            }
        });
    }
});

router.get('/boton/api/userinfo', function(req, res, next) {
    /*
    * HOSTNAME, IP
    * http://stackoverflow.com/questions/20553554/ddg#20554225
    * https://www.abstractapi.com/guides/node-js-get-ip-address
    */
    var ip = req.socket.remoteAddress.split(':')[3];
    var ip = res.socket.remoteAddress.split(':')[3];
    if(ip !== '127.0.0.1') {
        ip = '10.201.54.31'; //IP fija dentro del rango del DHCP
        ip = '10.201.54.109';
    }

    // GET OAUth 1 Userinfo
    var access_token = get_oauth_userinfo;
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
            redirect_uri: "http://127.0.0.1" + redir
        }}, function(error, meta, body) {
        //console.log(body.toString());
        response = body.toString();
        console.log(response);
        if(response !== '{"error":"invalid_grant","error_description":"Invalid authorization code: undefined"}')
            access_token = JSON.parse(body)["access_token"];

        /*OAuth*/
        //https://orcid.org/oauth/userinfo?access_token=0ce67482-4b3e-48c4-8700-464fa1c9b9d2
        const get_oauth_userinfo_redir = get_oauth_code + get_oauth_userinfo + "?access_token=" + access_token;
        res.render('orcid_boton', { theme: req.query.theme, title: 'ORCID OAuth 1 (userinfo)', subtitle: servidor, message: 'Aprieta el botón!', url: get_oauth_userinfo_redir});

    });

});

router.get('/boton/oauth/', function(req, res, next) {
    /*
    * HOSTNAME, IP
    * http://stackoverflow.com/questions/20553554/ddg#20554225
    * https://www.abstractapi.com/guides/node-js-get-ip-address
    */
    var ip = req.socket.remoteAddress.split(':')[3];
    var ip = res.socket.remoteAddress.split(':')[3];
    if(ip !== '127.0.0.1') {
        ip = '10.201.54.31'; //IP fija dentro del rango del DHCP
        ip = '10.201.54.109';
    }

    /*OAuth*/
    const get_oauth_code_redir = get_oauth_code + 'http://' + ip + redir;
    res.render('orcid_boton', { theme: req.query.theme, title: 'ORCID OAuth 1', subtitle: servidor, message: 'Aprieta el botón!', url: get_oauth_code_redir});
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
                    Accept: "application/orcid+json"
                }}, function(error, meta, body) {
                //console.log(body.toString());
                response += " " + body.toString();
                console.log(response);
                var email = JSON.parse(body);
                res.render('orcid_boton', {
                    theme: 'darkly',
                    title: 'ORCID OAuth 2',
                    subtitle: ' Code: ' + req.query.code + ' & Cookies: ' + util.inspect(cookies) + ' & Access_token: ' + access_token['access_token'] + ' & ORCID userinfo : ' + userinfo['sub'] + ' & ORCID emails: ' + (email['email']===undefined?'':email['email'].length > 0 ? (email['email'].length > 1 ? (email['email'].length > 2 ? email['email'][0]['email'] + " " + email['email'][1]['email'] + " " + email['email'][2]['email'] : email['email'][0]['email'] + " " + email['email'][1]['email']) : email['email'][0]['email']) : "No email"),
                    message: util.inspect(response),
                    url: servidor_despliegure_cookie
                });
            });
        });
    });
});

router.get('/boton/openid/', function(req, res, next) {
    /*
    * HOSTNAME, IP
    * http://stackoverflow.com/questions/20553554/ddg#20554225
    * https://www.abstractapi.com/guides/node-js-get-ip-address
    */
    var ip = req.socket.remoteAddress.split(':')[3];
    var ip = res.socket.remoteAddress.split(':')[3];
    if(ip !== '127.0.0.1') {
        ip = '10.201.54.31'; //IP fija dentro del rango del DHCP
        ip = '10.201.54.109';
    }

    /*OpenID*/
    /*Impkicit OAuth*/
    //const get_openid_token = servidor + "/oauth/authorize?response_type=token&redirect_uri=http:%2F%2F127.0.0.1:3000%2Forcid%2F&client_id=" + client_id + "&scope=openid&nonce=whatever";
    const get_openid_token = servidor + "/oauth/authorize?response_type=token&redirect_uri=http:%2F%2F" + ip + ":3000%2Forcid%2Fmenu%2F&client_id=" + client_id + "&scope=openid&nonce=whatever";

    res.render('orcid_boton', { theme: req.query.theme, title: 'ORCID OpenID', subtitle: servidor, message: 'Aprieta el botón!', url: get_openid_token });
});

router.get('/uned/', function(req, res, next) {
    /*
        REFINE ORCID SEARCH
    */
    const servidor_refine = "http://127.0.0.1:3333";
    const servidor_node = "http://127.0.0.1:3000";
    const get_orcid_salm = "/command/core/get-rows?project=2105137373812&limit=10";

    const servidor = "https://orcid.org";
    const get_orcid_1 = servidor + "/orcid-search/search?firstName=ANA&lastName=&institution=UNED&keyword=&otherFields=true&orcid=";
    const get_all = servidor + "/orcid-search/search?firstName=AAAAAA&lastName=BBBBBB&institution=CCCCCC&keyword=DDDDD&otherFields=true&orcid=0000-0003-0538-2565";

    //http://127.0.0.1:3000/orcid/#access_token=f1d655c2-aa1b-4a36-85f8-4e6644cf0ead&token_type=bearer&expires_in=599&tokenVersion=1&persistent=true&id_token=eyJraWQiOiJzYW5kYm94LW9yY2lkLW9yZy0zaHBnb3NsM2I2bGFwZW5oMWV3c2dkb2IzZmF3ZXBvaiIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiczByUHpCbHAzajRQV3Vrc2lZc3dYQSIsImF1ZCI6IkFQUC00SkNJUFpYT1hZTlM2V1YxIiwic3ViIjoiMDAwOS0wMDAwLTgyODctMTM1WCIsImF1dGhfdGltZSI6MTcxMTAxMzc1NiwiaXNzIjoiaHR0cHM6XC9cL3NhbmRib3gub3JjaWQub3JnIiwiZXhwIjoxNzExMTAwNzI4LCJnaXZlbl9uYW1lIjoiZmpzYW5jaGV6IiwiaWF0IjoxNzExMDE0MzI4LCJub25jZSI6IndoYXRldmVyIiwiZmFtaWx5X25hbWUiOiJmanNhbmNoZXoiLCJqdGkiOiI5MzFjZjE0MS01OTVmLTRlOGEtYmViOC1kMDBiZDdiN2IxMDAifQ.nTOhe16KSXaR0RPGnIUcQhYzeVzBUY2QbIQ3-l63ErcOeqvOiUgL1TkiQONNo64_lEroHp1xzS7SQm7ih4utAU6cMr10l4Y9LAjPWo7Yy8_7VxhGgYYXYWmQ6xf1ulXPbYLj10CuR08j038nmDLvx8aU1hpYxa3mVF2mFSyWpvwfNJBK4kpQhaf73CZDezXK49TxlpLxJqc_vR8rMNG5YIC_OuqCYWSWq1gIPxUe3pD9697Hwa_k34mcfUGy48l1Af1fN0V_pXDNG8ULQwUzPM4vjJPYNv-lKbCR9XDen7Uo7IExM5GTtkwpwZdmzvpqp2lSqWRBRUaRqCYDJlkjNQ&tokenId=22783971
    var respuesta = "Vacío";
    var response = "Vacío";

    // GET
    fetch.fetchUrl(servidor_refine + get_orcid_salm, {method: "GET"}, function(error, meta, body) {
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
        fetch.fetchUrl(servidor_refine + get_orcid_salm, {method: "GET"}, function(error, meta, body) {
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

router.post('/', function(req, res, next) {
    res.send(util.inspect(req.url));
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
