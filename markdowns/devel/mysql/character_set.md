# 字符集

MySQL有一个非常灵活的字符集支持文档[Character Set Support](http://dev.mysql.com/doc/refman/5.7/en/charset.html)

```mysql
SELECT id, collation_name FROM information_schema.collations ORDER BY id;
```

```
  +----+-------------------+
  | id | collation_name    |
  +----+-------------------+
  |  1 | big5_chinese_ci   |
  |  2 | latin2_czech_cs   |
  |  3 | dec8_swedish_ci   |
  |  4 | cp850_general_ci  |
  |  5 | latin1_german1_ci |
  |  6 | hp8_english_ci    |
  |  7 | koi8r_general_ci  |
  |  8 | latin1_swedish_ci |
  |  9 | latin2_general_ci |
  | 10 | swe7_swedish_ci   |
  +----+-------------------+
```

下表现是了几个通用的字符集：

| Number | Hex  | Character Set Name |
| ------ | ---- | ------------------ |
| 8      | 0x08 | latin1_swedish_ci  |
| 33     | 0x21 | utf8_general_ci    |
| 63     | 0x3f | binary             |

## Protocol::CharacterSet

字符集在协议中定义为一个整数，域（Fields):

- charset_nr (2) - number of the  character set and collation

