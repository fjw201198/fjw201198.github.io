# 通用响应包 (Generic Response Packets)

客户端在向服务器发送命令时，服务器返回下列响应包之一:

- OK_Packet
- ERR_Packet
- EOF_Packet

[TOC]

## OK_Packet

服务器向客户端返回OK_Packet响应包，表示命令的成功完成。

在MySQL 5.7.5中，OK packet被用来表明EOF和EOF Packet的标为过时。

如果定义了CLIENT_PROTOCOL_41，包会包含警告数量。

### Ok_Packet Payload

| 类型                                       | 名称                   | 描述                                    |
| ---------------------------------------- | -------------------- | ------------------------------------- |
| `int<1>`                                 | header               | `0x00` or `0xFE` the OK Packet header |
| `int<lenenc>`                            | affected_rows        | affected rows                         |
| `int<lenenc>`                            | last_insert_id       | last insert-id                        |
| if capabilities & CLIENT_PROTOCOL_41 {   |                      |                                       |
| `int<2>`                                 | status_flags         | SERVER_STATUS_flags_enum              |
| `int<2>`                                 | warnings             | number of warnings                    |
| } else if capabilities & CLIENT_TRANSACTIONS { |                      |                                       |
| `int<2>`                                 | status_flags         | SERVER_STATUS_flags_enum              |
| }                                        |                      |                                       |
| if capabilities & CLIENT_SESSION_TRACK   |                      |                                       |
| `string<lenenc>`                         | info                 | human readable status information     |
| if status_flags & SERVER_SESSION_STATE_CHANGED { |                      |                                       |
| `string<lenenc>`                         | sesession state info | Session State Information             |
| }                                        |                      |                                       |
| } else {                                 |                      |                                       |
| `string<EOF>`                            | info                 | human readable status information     |
| }                                        |                      |                                       |

```c
struct OK_Packet_Payload {
    int<1> header;
    int<lenenc> affected_rows;
    int<lenenc> last_insert_id;
#if (capabilities & CLIENT_PROTOCOL_41)
    int<2> status_flags;
    int<2> warnings;
#elif (capabilities & CLIENT_TRANSACTIONS)
    int<2> status_flags;
#endif
#if (capabilities & CLIENT_SESSION_TRACK)
    string<lenenc> info;
#endif
#if (status_flags & SERVER_SESSION_STATE_CHANGED)
    string<lenenc> session_state_info;
#else
    string<EOF> info;
#endif
};
```

区别 OK和EOF的规则是：

- OK: header = 0并且包长度 > 7
- EOF: header = 0xfe并且包长度 < 9

确保MYSQL向后兼容， 新客户端携带CLIENT_DEPRECATE_EOF 标记：

- 老的客户端不识别该标记，不使用它，所以，服务端不发送含EOF的OK包
- 是客户端使用该标记，老的服务器不识别该标记，不会发送带EOF标记的OK包

### OK_Packet 例子

带有CLIENT_PROTOCOL_41标记的 OK包。

```
07 00 00 02 00 00 00 02    00 00 00
```

受影响的行（0），上次插入ID（0），使用自动提交（AUTOCOMMIT)，0个警告。

### 会话状态信息

状态改变信息在OK包中以状态改变块数组的形式发送，状态改变块如下：

| 类型               | 名称   | 描述                              |
| ---------------- | ---- | ------------------------------- |
| `int<1>`         | type | 数据类型，见`enum_session_state_type` |
| `string<lenenc>` | data | 会话信息改变的值                        |

解析`data`域依赖于其类型(`type`): 

- SESSION_TRACK_SYSTEM_VARIABLES
- SESSION_TRACK_SCHEMA
- SESSION_TRACK_STATE_CHANGE

#### SESSION_TRACK_SYSTEM_VARIABLES

| 类型               | 名称    | 描述       |
| ---------------- | ----- | -------- |
| `string<lenenc>` | name  | 改变的系统变量名 |
| `string<lenenc>` | value | 改变的系统变量值 |

如`SET autocommit = OFF`语句之后：

```c
00 0f1 0a 61 75 74 6f 63    6f 6d 69 74 03 4f 46 46 // ....autocommit.OFF
```



#### SESSION_TRACK_SCHEMA

| 类型               | 名称   | 描述      |
| ---------------- | ---- | ------- |
| `string<lenenc>` | name | 改变的数据库名 |

如`USE test`语句后：

```c
01 05 04 74 65 73 74 // ...test
```



#### SESSION_TRACK_STATE_CHANGE

| 类型               | 名称         | 描述                                  |
| ---------------- | ---------- | ----------------------------------- |
| `string<lenenc>` | is_tracked | 如果启用 state tracking， 只为`0x31`("1"), |

如`SET SESSION session_track_state_change = 1`之后：

```c
03 02 01 31 // ...1
```

See also [net_send_ok](https://dev.mysql.com/doc/dev/mysql-server/latest/protocol__classic_8cc.html#a7da8463ad827636bff8a5763f27ddec0)



## ERR_Packet

该包表明错误发生了。如果CLIENT_PROTOCOL_41启用，该包会包含一个SQL state，

错误的文本长度不能超过`MYSQL_ERRMSG_SIZE`

### ERR_Packet负载

| 类型                                     | 名称               | 描述                           |
| -------------------------------------- | ---------------- | ---------------------------- |
| `int<1>`                               | header           | `0xFF` ERR packet header     |
| `int<1>`                               | error_code       | 错误码                          |
| if capabilities & CLIENT_PROTOCOL_41 { |                  |                              |
| `string[1]`                            | sql_state_marker | 错误状态标记                       |
| `string[5]`                            | sql_state        | 错误状态                         |
| }                                      |                  |                              |
| `string<EOF>`                          | error_message    | human readable error message |

如

```c
17 00 00 01 ff 48 04 23    48 59 30 30 30 4e 6f 20 // ......H.#HY000No
74 61 62 6c 65 73 20 75    73 65 64                // tables used
```

Sess also [net_send_error_packet](https://dev.mysql.com/doc/dev/mysql-server/latest/protocol__classic_8cc.html#a12b94601ea72738e3bdc21467dc6adce)

## EOF_Packet

在 MySQL 客户端/服务端 协议中，EOF_Packet和OK_Packet服务于同样的目的——表明查询执行结果的结束。由于MySQL 5.7的OK_Packet做了改变，为了避免在EOF_Packet中作重复的改变，OK_Packet在MySQL 5.7.5中被标为过时。

**警告：**

EOF_Packet包可能会出现在Protocol::LengthEncodeInteger出现的地方。你需要检查包长度是否<=9，以确保它是EOF_Packet。

### EOF_Packet Payload

| 类型                                     | 名称           | 描述                       |
| -------------------------------------- | ------------ | ------------------------ |
| `int<1>`                               | header       | `0xFE` EOF包头             |
| if capabilities & CLIENT_PROTOCOL_41 { |              |                          |
| `int<2>`                               | warnings     | 警告数                      |
| `int<2>`                               | status_flags | SERVER_STATUS_flags_enum |

如： MySQL 4.1 EOF_Packet

```C
05 00 00 05 fe 00 00 02 00 // ..............
```

warnings(0), AUTOCOMMIT enabled.

See alse [net_send_eof](https://dev.mysql.com/doc/dev/mysql-server/latest/protocol__classic_8cc.html#ad98c27cdf91ce2ca28be0f6706d36ce7)



