## Module ngx_stream_js_module

 The `ngx_stream_js_module` module is used to implement handlers in [njs](http://nginx.org/en/docs/njs_about.html) — a subset of the JavaScript language. 

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
> stream {
>     js_include stream.js;
> 
>     js_set $foo foo;
>     js_set $bar bar;
> 
>     server {
>         listen 12345;
> 
>         js_preread qux;
>         return     $foo;
>     }
> 
>     server {
>         listen 12346;
> 
>         js_access  xyz;
>         proxy_pass 127.0.0.1:8000;
>         js_filter  baz;
>     }
> }
> 
> http {
>     server {
>         listen 8000;
>         location / {
>             return 200 $http_foo\n;
>         }
>     }
> }
> ```

  

 The `stream.js` file: 

> ```javascript
> var req = '';
> var matched = 0;
> var line = '';
> 
> function qux(s) {
>     var n = s.buffer.indexOf('\n');
>     if (n == -1) {
>         return s.AGAIN;
>     }
> 
>     line = s.buffer.substr(0, n);
> }
> 
> function foo(s) {
>     return line;
> }
> 
> function bar(s) {
>     var v = s.variables;
>     s.log("hello from bar() handler!");
>     return "foo-var" + v.remote_port + "; pid=" + v.pid;
> }
> 
> // The filter processes one buffer per call.
> // The buffer is available in s.buffer both for
> // reading and writing.  Called for both directions.
> 
> function baz(s) {
>     if (s.fromUpstream || matched) {
>         return;
>     }
> 
>     // Disable certain addresses.
> 
>     if (s.remoteAddress.match('^192.*')) {
>         return s.ERROR;
>     }
> 
>     // Read HTTP request line.
>     // Collect bytes in 'req' until request
>     // line is read.  Clear current buffer to
>     // disable output.
> 
>     req = req + s.buffer;
>     s.buffer = '';
> 
>     var n = req.search('\n');
> 
>     if (n != -1) {
>         // Inject a new HTTP header.
>         var rest = req.substr(n + 1);
>         req = req.substr(0, n + 1);
> 
>         var addr = s.remoteAddress;
> 
>         s.log('req:' + req);
>         s.log('rest:' + rest);
> 
>         // Output the result and skip further
>         // processing.
> 
>         s.buffer = req + 'Foo: addr_' + addr + '\r\n' + rest;
>         matched = 1;
>     }
> }
> 
> function xyz(s) {
>     if (s.remoteAddress.match('^192.*')) {
>         return s.ABORT;
>     }
> }
> ```

  

Directives

| Syntax:  | `**js_access** *function*;` |
| -------- | --------------------------- |
| Default: | —                           |
| Context: | `stream`, `server`          |

 Sets an njs function which will be called at the [access](http://nginx.org/en/docs/stream/stream_processing.html#access_phase) phase. 

| Syntax:  | `**js_filter** *function*;` |
| -------- | --------------------------- |
| Default: | —                           |
| Context: | `stream`, `server`          |

 Sets a data filter. 

| Syntax:  | `**js_include** *file*;` |
| -------- | ------------------------ |
| Default: | —                        |
| Context: | `stream`                 |

 Specifies a file that implements server and variable handlers in njs. 

| Syntax:  | `**js_preread** *function*;` |
| -------- | ---------------------------- |
| Default: | —                            |
| Context: | `stream`, `server`           |

 Sets an njs function which will be called at the [preread](http://nginx.org/en/docs/stream/stream_processing.html#preread_phase) phase. 

| Syntax:  | `**js_set**  *$variable* *function*;` |
| -------- | ------------------------------------- |
| Default: | —                                     |
| Context: | `stream`                              |

 Sets an njs function for the specified variable. 

Session Object Properties

 Each stream njs handler receives one argument, a stream session object. 

 The session object has the following properties:  

- `remoteAddress`

   client address, read-only 

- `eof`

   a boolean read-only property, true if the current buffer is the last buffer 

- `fromUpstream`

   a boolean read-only property, true if the current buffer is from the upstream server to the client 

- `buffer`

   the current buffer, writable 

- `variables{}`

   nginx variables object, read-only 

- `OK`

   the `OK` return code 

- `DECLINED`

   the `DECLINED` return code 

- `AGAIN`

   the `AGAIN` return code 

- `ERROR`

   the `ERROR` return code 

- `ABORT`

   the `ABORT` return code 

  

 The session object has the following methods:  

- `log(*string*)`

   writes a sent `*string*` to the error log on the `info` level of logging 