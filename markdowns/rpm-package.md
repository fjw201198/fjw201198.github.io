# 打包RPM注意事项



[TOC]



## 禁止生成debug包

> 适当的时候禁用打包debug是非常有必要的,这在封装闭源的二进制包时尤其必要,如果不关闭debug包,则可能会因为无法生成debug信息而使打包失败(笔者在fc27上打包时出过该错).

```bash
$ echo '%debug_package %{nil}' >> ~/.rpmmacros
```

如果~/.rpmmacros不存在,则从/usr/lib/rpm将macros拷贝到~/.rpmmacros,然后再追加该配置:

```bash
$ cp /usr/lib/rpm/macros ~/.rpmmacros && echo '%debug_package %{nil}' >> ~/.rpmmacros
```

