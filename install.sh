#/usr/bin/bash

repodir=$1
if [ $# -lt 1 ]; then
    echo 'Please INPUT the directory of the git repo '
    echo -n '> '
    read repodir
    if [ "x$repodir" = "x" ];then
        echo Error: repo directory can not be empty
        exit 1
    fi
fi

workdir=$(dirname $0)
if [ $workdir = "." ]; then
    workdir=$(pwd)
fi
onebit=${workdir:0:1}
if [ $onebit = "x." ]; then 
    workdir=$(pwd)${workdir:1}
fi

setfacl -Rm u:git:rwx $workdir
setfacl -Rm g:git:rwx $workdir

# generate the git hook
hk=$workdir/hook/post-receive
dest=$repodir/hooks/post-receive
if [ -d $repodir/.git ]; then
    dest=$repodir/.git/hooks/post-receive
fi
echo '#!/usr/bin/bash' >$hk
echo $workdir/scripts/update-md-list.sh $repodir >>$hk
if [ -f $dest ]; then
    echo $workdir/scripts/update-md-list.sh $repodir >> $dest
else
    echo '#!/usr/bin/bash' >>$dest
    echo $workdir/scripts/update-md-list.sh $repodir >>$dest
fi
