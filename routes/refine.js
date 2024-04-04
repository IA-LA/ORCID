var express = require('express');
var router = express.Router();

var fetch = require('fetch');
//var node_fetch = require('node-fetch');
var axios = require('axios/dist/browser/axios.cjs');
var http = require('http');
//var nlp = require('node-nlp');
var natural_nlp = require('natural');
var refine = require('openrefine');

//
/* GET users listing. */
router.get('/', function(req, res, next) {
    const servidor = "http://127.0.0.1:3333";
    const post2 = servidor + '/command/core/split-multi-value-cells?"columnName=__anonymous__ - o:title"&keyColumnName="__anonymous__ - o:title&separator"=b&mode=plain&project=2067728589035';
    const post = servidor + "/command/core/compute-clusters?project=2067728589035";
    const csrf = servidor + "/command/core/get-csrf-token";
    const proyectos = servidor + "/command/core/get-all-project-metadata";
    const get_unesco_719 = servidor + "/command/core/get-rows?project=2396155475486&limit=719";
    const get_unesco_695 = servidor + "/command/core/get-rows?project=2633874302386&limit=695";
    const get = servidor + "/command/core/get-models?project=2067728589035";
    var respuesta = "Vacío";
    var response = "Vacío";

    var post_data = JSON.stringify({
        "engine": {
            "facets": [],
            "mode": "row-based"
        },
        "clusterer": {
            "type": "knn",
            "function": "levenshtein",
            "column": "__anonymous__ - palabraClave",
            "params": {
                "radius": 1,
                "blocking-ngram-size": 6
            }
        }
    });

    var post_options = {
        host: "127.0.0.1",
        port: 3333,
        path: "/command/core/compute-clusters?project=2067728589035",
        method: 'POST',
        headers: {
            Cookie: "session=000000001",
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
        }
    };

// Set up the request
    var post_req = http.request(post_options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('========Response========: ' + chunk);
        });
    });

// post the data
    //post_req.write(post_data);
    post_req.write(post_data);
    post_req.end();

    /*
     * FETCH Levenshtein
     */
    var options = {
        method: "POST",
        payload: JSON.stringify({
            "engine": {
                "facets": [],
                "mode": "row-based"
            },
            "clusterer": {
                "type": "knn",
                "function": "levenshtein",
                "column": "__anonymous__ - palabraClave",
                "params": {
                    "radius": 1,
                    "blocking-ngram-size": 6
                }
            }
        })
    };

    /*
     * FETCH Fingerprint
     */
    options = {
        method: "POST",
        payload: JSON.stringify({
            "engine": {
                "facets": [],
                "mode": "record-based"
            },
            "clusterer": {
                "type": "binning",
                "function": "fingerprint",
                "column": "__anonymous__ - palabraClave",
                "params": {}
            }
        })
    };
    // POST
    fetch.fetchUrl(post, options, function(error, meta, body) {
        //console.log(body.toString());
        response = body.toString();
        respuesta ='<h1>Refine</h1>' +
            '   <h2>Refine POST Clustering</h2>' +
            '        <h4>' +
            '        ' + response +
            '        </h4>' +
            '        <div id="demo1"></div>';
        // GET
        fetch.fetchUrl(get_unesco_719, {method: "GET"}, function(error, meta, body) {
            var json_719 = JSON.parse(body);
            //console.log(json_719['rows'][0]['cells'][1]['v']);
            //console.log(body.toString());
            response = body.toString();
            respuesta = respuesta +
                '   <h2>Refine GET Proyectos</h2>' +
                '        <h4>' +
                '        ' + response +
                '        </h4>' +
                '        <div id="demo1"></div>';
            // GET
            fetch.fetchUrl(get_unesco_695, {method: "GET"}, function(error, meta, body) {
                var json_695 = JSON.parse(body);
                //console.log(json_695['rows'][0]['cells'][1]['v']);

                json_719['rows'].forEach(function(item_719){
                    json_695['rows'].forEach(function(item_695){
                        if(item_719['cells'][1]['v'] === item_695['cells'][1]['v']){
                            item_719['cells'][1]['v'] = 'REPETIDO';
                            item_695['cells'][1]['v'] = 'REPETIDO';
                        }
                    });
                });

                var contador_719 = 0;
                var contador_695 = 0;
                json_719['rows'].forEach(function(item_719){
                    contador_719 += 1;
                    if(item_719['cells'][1]['v'] !== 'REPETIDO') console.log('TERMINO_719 (' + contador_719 + '): ' + item_719['cells'][1]['v']);
                });
                json_695['rows'].forEach(function(item_695){
                    contador_695 += 1;
                    if(item_695['cells'][1]['v'] !== 'REPETIDO')console.log('TERMINO_695 (' + contador_695 + '): ' + item_695['cells'][1]['v']);
            });

                //console.log(body.toString());
                response = body.toString();
                res.send(respuesta +
                    '   <h2>Refine GET Modelo de Columnas</h2>' +
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
                    '        <div id="demo2"></div>')
            });
            });

        });

    });

module.exports = router;
