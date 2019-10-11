# FCGI 协议

[TOC]

## 消息类型

```c++
typedef enum _fcgi_request_type {
	FCGI_BEGIN_REQUEST		=  1, /* [in]                              */
	FCGI_ABORT_REQUEST		=  2, /* [in]  (not supported)             */
	FCGI_END_REQUEST		=  3, /* [out]                             */
	FCGI_PARAMS			    =  4, /* [in]  environment variables       */
	FCGI_STDIN			    =  5, /* [in]  post data                   */
	FCGI_STDOUT			    =  6, /* [out] response                    */
	FCGI_STDERR			    =  7, /* [out] errors                      */
	FCGI_DATA			    =  8, /* [in]  filter data (not supported) */
	FCGI_GET_VALUES		     =  9, /* [in]                              */
	FCGI_GET_VALUES_RESULT   = 10  /* [out]                             */
} fcgi_request_type;
```

消息发送顺序如下

```sequence
NGINX -> FCGI: FCGI_BEGIN_REQUEST
NGINX -> FCGI: FCGI_PARAMS,...
NGINX -> FCGI: FCGI_PARAMS(EMPTY)
NGINX -> FCGI: FCGI_STDIN,...
NGINX -> FCGI: FCGI_STDIN(EMPTY)
FCGI ->  NGINX: FCGI_STDOUT/FCGI_STDERR...
FCGI ->  NGINX: FCGI_END_REQUEST(JUST NO FCGI_STDERR NEED)
```

## 消息头

```c++
typedef struct _fcgi_header {
	unsigned char version;          /* FASTCGI version   */
	unsigned char type;             /* fcgi_request_type */
	unsigned char requestIdB1;      /* request id */
	unsigned char requestIdB0;
	unsigned char contentLengthB1;  /* content data length */
	unsigned char contentLengthB0;
	unsigned char paddingLength;    /* paddings */
	unsigned char reserved;         /* reserved */
} fcgi_header;
```

**说明：** 关于上面的xxB1和xxB0的协议说明：当两个相邻的结构组件除了后缀“B1”和“B0”之外命名相同时，它表示这两个组件可视为估值为B1<<8 + B0的单个数字。 当消息体的长度超过65535时，则将消息分割为多个相同类型的消息发送。



##  消息体

### FCGI_BEGIN_REQUEST

```cpp
typedef struct _fcgi_begin_request {
    unsigned char roleB1;
    unsigned char roleB0;
    unsigned char flags;
    unsigned char reserved[5];
} fcgi_begin_request;
```

> role表示web服务器期待应用冲淡的角色，角色定义如下， 一般为FCGI_RESPONDER

role 有：

```cpp
typedef enum _fcgi_role {
    FCGI_RESPONDER  = 1,
    FCGI_AUTHORIZER = 2,
    FCGI_FILTER     = 3
} fcgi_role;
```

> flags包含一个控制线路关闭的位：flags & FCGI_KEEP_CONN, 如果为0，则表示本次请求响应后关闭连接，如果为非0，则本次请求响应后不关闭连接.

### FCGI_END_REUQEST

```cpp
typedef struct _fcgi_end_request {
    unsigned char appStatusB3;
    unsigned char appStatusB2;
    unsigned char appStatusB1;
    unsigned char appStatusB0;
    unsigned char protocolStatus;
    unsigned char reserved[3];
} fcgi_end_request;
```

appStatus组件是应用级别的状态码。 protocolStatus组件是协议级别的状态码，其值可能是：

 - `FCGI_REQUEST_COMPLETE`, 请求正常结束；
 - `FCGI_CANT_MPX_CONN`，拒绝新请求。这发生在Web服务器通过一条线路向应用发送并发请求时；
 - `FCGI_OVERLOADED`, 拒绝新请求，这发生在应用用完某些资源时（如数据库连接）； 
 - `FCGI_UNKNOWN_ROLE`, 拒绝新请求，这发生在Web服务器指定了一个应用不能识别的角色时；

### FCGI_PARAMS

fcgi_params由名值对组成（无缝连接，二进制）。

名值对（name-value pairs)

不管是名值对的`nameLength`还是`valueLength`，只要最高位为1，则表示长度是4字节的，否则长度为1字节。

```cpp
typedef struct {
            unsigned char nameLengthB0;  /* nameLengthB0  >> 7 == 0 */
            unsigned char valueLengthB0; /* valueLengthB0 >> 7 == 0 */
            unsigned char nameData[nameLength];
            unsigned char valueData[valueLength];
} FCGI_NameValuePair11;

typedef struct {
            unsigned char nameLengthB0;  /* nameLengthB0  >> 7 == 0 */
            unsigned char valueLengthB3; /* valueLengthB3 >> 7 == 1 */
            unsigned char valueLengthB2;
            unsigned char valueLengthB1;
            unsigned char valueLengthB0;
            unsigned char nameData[nameLength];
            unsigned char valueData[valueLength
                    ((B3 & 0x7f) << 24) + (B2 << 16) + (B1 << 8) + B0];
} FCGI_NameValuePair14;

typedef struct {
            unsigned char nameLengthB3;  /* nameLengthB3  >> 7 == 1 */
            unsigned char nameLengthB2;
            unsigned char nameLengthB1;
            unsigned char nameLengthB0;
            unsigned char valueLengthB0; /* valueLengthB0 >> 7 == 0 */
            unsigned char nameData[nameLength
                    ((B3 & 0x7f) << 24) + (B2 << 16) + (B1 << 8) + B0];
            unsigned char valueData[valueLength];
} FCGI_NameValuePair41;

typedef struct {
            unsigned char nameLengthB3;  /* nameLengthB3  >> 7 == 1 */
            unsigned char nameLengthB2;
            unsigned char nameLengthB1;
            unsigned char nameLengthB0;
            unsigned char valueLengthB3; /* valueLengthB3 >> 7 == 1 */
            unsigned char valueLengthB2;
            unsigned char valueLengthB1;
            unsigned char valueLengthB0;
            unsigned char nameData[nameLength
                    ((B3 & 0x7f) << 24) + (B2 << 16) + (B1 << 8) + B0];
            unsigned char valueData[valueLength
                    ((B3 & 0x7f) << 24) + (B2 << 16) + (B1 << 8) + B0];
} FCGI_NameValuePair44;
```

### FCGI_GET_VALUES/FCGI_GET_VALUES_RESULT

FCGI_GET_VALUES, FCGI_GET_VALUES_RESULT  Web服务器能查询应用内部的具体的变量。典型地，服务器会在应用启动上执行查询以使系统配置的某些方面自动化。  应用把收到的查询作为记录{FCGI_GET_VALUES, 0, ...}。FCGI_GET_VALUES记录的contentData部分包含一系列值为空的名-值对。  应用通过发送补充了值的{FCGI_GET_VALUES_RESULT, 0, ...}记录来响应。如果应用不理解查询中包含的一个变量名，它从响应中忽略那个名字。 

FCGI_GET_VALUES, 被设计为允许可扩充的变量集。初始集提供信息来帮助服务器执行应用和线路的管理,支持的选项有：

- `FCGI_MAX_CONNS`, 该应用将接受的并发传输线路的最大值，例如"1"或"10";
- `FCGI_MAX_REQS`, 该应用将接受的并发请求的最大值，例如"1"或"50"; 
- `FCGI_MPXS_CONNS`, 如果应用不多路复用线路（也就是通过每个线路处理并发请求）则为 "0"，其他则为"1"。

### FCGI_UNKNOWN_TYPE

```cpp
typedef struct {
	unsigned char type;    
	unsigned char reserved[7];
} FCGI_UnknownTypeBody;
```





