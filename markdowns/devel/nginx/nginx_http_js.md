## Module ngx_http_js_module



The `ngx_http_js_module` module is used to implement location and variable handlers in [njs](http://nginx.org/en/docs/njs_about.html) — a subset of the JavaScript language. 

 This module is not built by default, it should be compiled with the njs module using the `--add-module` configuration parameter: 

> ```bash
> ./configure --add-module=path-to-njs/nginx
> ```

  The [repository](http://hg.nginx.org/njs) with the njs module can be cloned with the following command (requires [Mercurial](https://www.mercurial-scm.org) client): 

> ```bash
> hg clone http://hg.nginx.org/njs
> ```

  This module can also be built as [dynamic](http://nginx.org/en/docs/ngx_core_module.html#load_module): 

> ```bash
> ./configure --add-dynamic-module=path-to-njs/nginx
> ```

  

Example Configuration

 

> ```nginx
> js_include http.js;
> 
> js_set $foo     foo;
> js_set $summary summary;
> 
> server {
>     listen 8000;
> 
>     location / {
>         add_header X-Foo $foo;
>         js_content baz;
>     }
> 
>     location /summary {
>         return 200 $summary;
>     }
> }
> ```

  

 The `http.js` file: 

> ```javascript
> function foo(req, res) {
>     req.log("hello from foo() handler");
>     return "foo";
> }
> 
> function summary(req, res) {
>     var a, s, h;
> 
>     s = "JS summary\n\n";
> 
>     s += "Method: " + req.method + "\n";
>     s += "HTTP version: " + req.httpVersion + "\n";
>     s += "Host: " + req.headers.host + "\n";
>     s += "Remote Address: " + req.remoteAddress + "\n";
>     s += "URI: " + req.uri + "\n";
> 
>     s += "Headers:\n";
>     for (h in req.headers) {
>         s += "  header '" + h + "' is '" + req.headers[h] + "'\n";
>     }
> 
>     s += "Args:\n";
>     for (a in req.args) {
>         s += "  arg '" + a + "' is '" + req.args[a] + "'\n";
>     }
> 
>     return s;
> }
> 
> function baz(req, res) {
>     res.headers.foo = 1234;
>     res.status = 200;
>     res.contentType = "text/plain; charset=utf-8";
>     res.contentLength = 15;
>     res.sendHeader();
>     res.send("nginx");
>     res.send("java");
>     res.send("script");
> 
>     res.finish();
> }
> ```

  

Directives

| Syntax:  | `**js_content** *function*;` |
| -------- | ---------------------------- |
| Default: | —                            |
| Context: | `location`, `limit_except`   |

 Sets an njs function as a location content handler. 

| Syntax:  | `**js_include** *file*;` |
| -------- | ------------------------ |
| Default: | —                        |
| Context: | `http`                   |

 Specifies a file that implements location and variable handlers in njs. 

| Syntax:  | `**js_set**  *$variable* *function*;` |
| -------- | ------------------------------------- |
| Default: | —                                     |
| Context: | `http`                                |

 Sets an njs function for the specified variable. 

Request and Response Arguments

 Each HTTP njs handler receives two arguments, request and response. 

 The request object has the following properties: 

- `uri`

   current URI in a request, read-only 

- `method`

   request method, read-only 

- `httpVersion`

   HTTP version, read-only 

- `remoteAddress`

   client address, read-only 

- `headers{}`

   request headers object, read-only.  For example, the `Header-Name` header can be accessed with the syntax `headers['Header-Name']` or `headers.Header_name`  

- `args{}`

   request arguments object, read-only 

- `variables{}`

   nginx variables object, read-only 

- `response`

   the response object (0.2.0), read-only 

  

 The request object has the following methods: 

- `log(*string*)`

   writes a `string` to the error log on the `info` level of logging 

- `warn(*string*)`

   writes a `string` to the error log on the `warning` level of logging (0.2.0) 

- `error(*string*)`

   writes a `string` to the error log on the `error` level of logging (0.2.0) 

- `subrequest(*uri*[, *options*[, *callback*]])`

   creates a subrequest with the given `uri` and `options`, and installs an optional completion `callback` (0.2.0).   If `options` is a string, then it holds the subrequest arguments string. Otherwise `options` is expected to be an object with the following keys:   `args` arguments string  `body` request body  `method` HTTP method      The `callback` receives a response object with the following properties: `uri`, `method`, `status`, `contentType`, `contentLength`, `headers`, `args`. These properties have the same meaning as the request object properties. Additionally, a reply object has the `body` property holding the subrequest response body and the `parent` property referencing the parent request object.  

  

 The response object has the following properties: 

- `status`

   response status, writable 

- `headers{}`

   response headers object 

- `contentType`

   the response “Content-Type” header field value, writable 

- `contentLength`

   the response “Content-Length” header field value, writable 

  

 The response object has the following methods: 

- `sendHeader()`

   sends the HTTP header to the client 

- `send(*string*)`

   sends a part of the response body to the client 

- `finish()`

   finishes sending a response to the client 

- `return(status[, string])`

   sends the entire response with the specified `status` to the client (0.2.0)  It is possible to specify either a redirect URL (for codes 301, 302, 303, 307, and 308) or the response body text (for other codes) as the second argument.  

