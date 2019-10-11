# FCGI协议解析

[TOC]

## FCGI消息头

> 为了方便区分接收的消息，FCGI协议为所有消息定义一个通用的消息头。所有消息的消息头结构一样：

```c++
typedef struct _fcgi_request_header {
  unsigned char version;
  unsigned char type;
  unsigned char request_id_B1;
  unsigned char request_id_B0;
  unsigned char content_length_B1;
  unsigned char content_length_B0;
  unsigned char padding_length;
  unsigned char reserved;
} fcgi_request_header;
```

> 其中`request_id = request_id_B1 << 8 + request_id_B0 `, 
>
> `content_length = content_length_B1 << 8 + content_length_B0`

> 以后的多字节都是高位在前，低位在后。

## FCGI消息类型

> fcgi消息类型定义如下：

```c++
enum FcgiMsgType {
  FCGI_BEGIN_REQUEST 		= 1,
  FCGI_ABORT_REQEUST 		= 2,
  FCGI_END_REQUEST 			= 3,
  FCGI_PARAMS 				= 4,
  FCGI_STDIN 				= 5,
  FCGI_STDOUT 				= 6,
  FCGI_STDERR 				= 7,
  FCGI_DATA 				= 8,
  FCGI_GET_VALUES 			= 9,
  FCGI_GET_VALUES_RESULT 	= 10,
  FCGI_UNKNOWN 				= 11
};
```

### FCGI_BEGIN_REQUEST

> 每个请求的第一个消息，fcgi收到该消息后应该分配内存等初始化工作。

### FCGI_ABORT_REQUEST

> 异常中断

## FCGI流程

### 正常情况消息交互

```sequence
WebServer->FCGIServer: FCGI_BEGIN_REQUEST (请求开始)
WebServer->FCGIServer: FCGI_PARAMS (参数，名值对，传统cgi之环境变量)
WebServer->FCGIServer: FCGI_PARAMS (...)
WebServer->FCGIServer: FCGI_PARAMS (参数，空消息体，表明参数已传完)
WebServer->FCGIServer: FCGI_STDIN (POST包体)
WebServer->FCGIServer: FCGI_STDIN (...)
WebServer->FCGIServer: FCGI_STDIN (空消息体，表明接收输入完成)
Note right of FCGIServer: 组装、解析请求，返回响应
FCGIServer->WebServer: FCGI_STDOUT/FCGI_STDERR
FCGIServer->WebServer: FCGI_STDOUT/FCGI_STDERR(...)
FCGIServer->WebServer: FCGI_STDOUT/FCGI_STDERR(空内容，可选)
FCGIServer->WebServer: FCGI_END_REQUEST(结束请求)
```

### 异常消息交互

#### 未识别消息（待验证）

```sequence
WebServer->FCGIServer: 未识别的FCGI消息
FCGIServer->WebServer: FCGI_UNKNOWN
```

####  连接中断等异常（待验证）

```sequence
WebServer->FCGIServer: FCGI_ABORT_REQUEST
FCGIServer->WebServer: FCGI_END_REQUEST
```

#### GET_VALUES

WebServer通过名值对的形式传递需要获取的选项的值（空值），FCGI支持获取的选项如下：

- FCGI_MAX_CONNS：最大连接数
- FCGI_MAX_REQS：最大请求数
- FCGI_MXPS_CONNS：是否允许多路复用，1允许，0不允许。

```sequence
WebServer->FCGIServer: FCGI_GET_VALUES
FCGIServer->WebServer: FCGI_GET_VALUES_RESULT
```

