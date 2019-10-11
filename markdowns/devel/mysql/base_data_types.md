# 基本数据类型

## 1 整型（Interger Types)

### 1.1 整型类型（Protocol::FixedLengthInteger）

MySQL以多字节的形式存储 定长无符号整数值。支持的长度有:

- `int<1>`, 1 字节`Protocol::FixedLengthInteger`.
- `int<2>`, 2 字节
- `int<3>`, 3 字节
- `int<4>`, 4字节
- `int<6>`, 6字节
- `int<8>`, 8字节

### 1.2 整型编码的长度 (Protocol::LengthEncodedInteger)

整数占用多少字节，取决于它的大小。下面是计算整型编码长度的方法。

| 大于或等于 |   小于   |      存储为      |
| :--------: | :------: | :--------------: |
|    $0$     |  $251$   |    1 字节整数    |
|   $251$    | $2^{16}$ | 0XFC + 2字节整数 |
|  $2^{16}$  | $2^{24}$ | 0XFD + 3字节整数 |
|  $2^{24}$  | $2^{64}$ | 0XFE + 8字节整数 |

相似地，将编码过的整数转化为数值时，先检查第一字节。

**注意：** *当包长度的第一字节为0XFE时，需要检查包的长度以确保有足够的空间存放8字节整数，如果不够的话，可能到了包结束（EOF_Packet)*.

## 2 字符串

### 2.1 定长字符串 (Protocol::FixedLengthString)

定长字符串有一个已知的、硬编码的长度， 如``ERR_Packet`的sql-state总是为5字节。

### 2.2 NULL结束的字符串 (Protocol::NullTerminatedString)

字符串以`0x00`结束.

### 2.3 变长字符串 (Protocol::VariableLengthString)

字符串的长度是由其他域(`field`)决定的或运行时计算的。

### 2.4 长度编码的字符串 (Protocol::LengthEncodedString)

长度编码的字符串，冠有长度编码的整数来描述字符串的长度， 他是边长字符串的特例。

### 2.5 Protocol::RestOfPacketString 

如果字符串是包(packet)的最后一个成员（component），其长度可通包的长度减去当前位置来计算。

