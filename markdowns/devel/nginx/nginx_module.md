# NGINX 模块开发

[TOC]

## 定义conf结构体

```cpp
typedef struct ngx_http_mymod_srv_conf_s {
    ngx_uint_t cmd_one;
    // ...
    ngx_uint_t cmd_n;
} ngx_http_mymod_srv_conf_t;
```

## 定义command

> 定义commands，类型为 static ngx_command_t[],必须在.c文件里定义。

```cpp
static char* ngx_http_mymod_test(ngx_conf_t *cf, ngx_command_t *cmd, void *conf)
{
    //
}

static ngx_command_t ngx_http_mymod_commands[] = {
    {
        ngx_string("test_command"),			 // command name in config file
        NGX_HTTP_SRV_CONF | NGX_CONF_TAKE1,	  // command location, and param number
        ngx_http_mymod_test,			     // callback, char*(*)(cf, cmd, conf)
        NGX_HTTP_SRV_CONF_OFFSET,			 // conf offset
        offsetof(ngx_http_mymod_srvj_conf_t, cmd_one), // value offset of conf struct
        NULL							   // post, void *
    },
    ...,
    ngx_null_command
}
```



## 定义http module上下文

```cpp
static ngx_http_module_t ngx_http_mymod_ctx = {
	 NULL,							// preconfiguration
	 NULL,							// postconfiguration
	 
	 NULL,							// create main configuration
	 NULL,							// init main configuration
	 
	 ngx_http_srv_mymod_create,		  // create server configuration
	 ngx_http_srv_mymod_merge,		  // merge server configuration
	 
	 NULL,							// create location configuration
	 NULL							// merge location configuration
};
```

## 定义module结构

```cpp
ngx_module_t ngx_http_mymod_module = {
    NGX_MODULE_V1,				
    &ngx_http_mymod_ctx,			 // module context
    ngx_http_mymod_commands,		 // module commands
    NGX_HTTP_MODULE,			    // module type
    NULL,						   // init master
    NULL,						   // init module
    NULL,						   // init process
    NULL,						   // init thread
    NULL,						   // exit thread
    NULL,						   // exit process
    NULL,						   // exit master
    NGX_MODULE_V1_PADDING
};
```



## 编写config文件

```shell
ngx_addon_name=ngx_http_hello_world_module

if test -n "$ngx_module_link"; then
    ngx_module_type=HTTP
    ngx_module_name=ngx_http_hello_world_module
    ngx_module_srcs="$ngx_addon_dir/ngx_http_hello_world_module.c"
    ngx_module_incs=""
    ngx_module_libs=""
    . auto/module
else
    HTTP_MODULES="$HTTP_MODULES ngx_http_hello_world_module"
    NGX_ADDON_SRCS="$NGX_ADDON_SRCS $ngx_addon_dir/ngx_http_hello_world_module.c"
fi
```

## 编译配置项

> 静态编译进nginx

```shell
./configure --add-module=path_of_mymod
```

> 动态编译

```shell
./configure --add-dynamic-module=path_of_mymod
```



## 参考

[淘宝教程 - nginx http handler 模块](nginx_module_taobao.md)
