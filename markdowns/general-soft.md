# 常用软件

[TOC]

## ntfs-3g

> ntfs-3g为Linux/Mac等系统提供了对ntfs文件系统读写的支持. 它是开源和自由的,当然也是免费的.

### 安装ntfs-3g

本安装教程参考于[FUSE维基][Fuse-wiki],根据实际情况有改动.[^1]

- ntfs-3g依赖FUSE,因此安装ntfs-3g之前需要安装 [FUSE][Fuse-home]
- 如果没有/usr/local/sbin目录,则创建之,并授予用户读写权限(brew link时会用到,否则找不到ntfs-3g命令):

  ```bash
  $ sudo mkdir /usr/local/sbin && chmod 777 /usr/local/sbin
  ```
- 通过`brew`安装`ntfs-3g`:

  ```bash
  brew install ntfs-3g
  ```

### 使用ntfs-3g

- 如果没有`/mnt`目录,则创建之(本人习惯而已,其他目录亦可):
```bash
sudo mkdir /mnt
```
- 插上设备,打开Finder,一定要先推出插入的设备
- 使用`diskutil`查看需要挂载的设备是什么(假如是`/dev/disk2s1`, 很有可能哦):

  ```bash
  diskutil list
  ```
- 使用`ntfs-3g`挂载设备(`/dev/disk2s1`)到`/mnt`:

```bash
	sudo ntfs-3g /dev/disk2s1 /mnt
```
- 挂载后, 打开Finder在设备里面可以看到多了个`OSXFUSE`卷, 如下图所示:
  ![osx-fuse-mounted-volume](./images/ntfs-3g-after-mount-in-finder.png)
  ​	
[Fuse-wiki]: https://github.com/osxfuse/osxfuse/wiki/NTFS-3G	"Ntfs-3g"
[Fuse-home]: https://osxfuse.github.io	"FUSE 主页"

[^1]: https://github.com/osxfuse/osxfuse/wiki/NFTFS-3G


