# UTM 解包/封包

[TOC]

## NetworkPackage

u32 length          // 包长度（不含length）

u16 m_version     // 值为16 

u16 m_type        // 值为2 

u32\*3 m_srcId   

u32\*3 m_dstId

 UTM package 

## UTM 

u32 m_messageId;

 u32 m_ret; 

u32*3 m_req;*

u32\*3 m_res; 

u32   kvnodes_count;

 KVNodes     



## KVNODE

u32 key;

u32 type;

u32 length;

u8  value[length];

发送消息 先发_EvtModuleActive（30000003）消息： _TagPortID (array(port1, port2,...)); _TagAppStartTime (time(NULL));（appid.0.0) 再发其他消息， 期间可能会收到_EvtPingFromRemote(0x30000014)(一分钟一个）（_EvtPingServer（0x30000013）：定时任务）  作为服务端，需要监测_EvtModuleDeactive（30000004）(自己发给自己），30000003