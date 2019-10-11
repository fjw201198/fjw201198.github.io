#!/bin/bash

date

base_dir=$(dirname $0)
if [ "x$base_dir" = "x." ]; then
    base_dir=$(pwd)
fi
cd $base_dir/..
cfg_name=articles.$(date +'%s').js
config_file=$(pwd)/config/$cfg_name
sed -i "s/articles.js/`echo -n $cfg_name`/g" $(pwd)/index.html
mddir=$(pwd)/markdowns
echo -n 'var artlist = ' >$config_file

# export repo
repodir=$1
if [ $# -lt 1 ]; then
    echo -n 'Please INPUT the directory of repo> '
    read repodir
    if [ "x$repodir" = "x" ]; then
        echo 'Error: repo dir can not be empty!'
        exit 1
    fi
fi
echo $repodir
if [ -d $repodir ]; then
    cd $repodir
else
    echo 'Error: repo dir is not a directory: '
    exit 2
fi
git archive -o $base_dir/latest.tar HEAD 2>&1
ecode=$?
if [ $ecode -ne 0 ]; then
    echo Error: repo dir is not an valid git repo: $ecode
    exit 3
fi
tar -C $mddir -xvf $base_dir/latest.tar
rm -f $base_dir/latest.tar

export TIME_STYLE='+%Y-%m-%d %H:%M:%S'
__changetime__=''
Plat=$(uname)
function GetChangeTime() {
    if [ $Plat = 'Linux' ]; then
        __changetime__=$(ls -lc $1 | awk -F ' ' '{print $6,$7;}')
    else
        # Mac
        __changetime__=$(ls -lcT $1 | $base_dir/format_ls_time.awk)
    fi
}
function AddMdDir() {
    if [ $# -lt 1 ]; then
        return
    fi
    if [ -d $1 ]; then
        echo in $1:
    else
        return
    fi
    local olddir=$(pwd)
    local curdir=$1
    cd $1
    local files=$(ls)
    fnum=$2
    for f in $files; do
        if [ -d $f ]; then
            AddMdDir $curdir/$f $fnum $3/$f
        else
            local fn=$(basename $f)
            local title=$(echo $fn | awk -F '.' '{print $1;}')
            local ext=$(echo $fn | awk -F '.' '{print $2;}' | tr [a-z] [A-Z])
            if [ "x$ext" = "xMD" ]; then
                echo add file $f
            elif [ "x$ext" = "xMARKDOWN" ]; then
                echo add file $f
            else
                continue
            fi
            GetChangeTime $f
            ctime=$__changetime__
            if [ $fnum -gt 1 ];then
                echo ','>>$config_file
            fi
            echo -n '{"title":"'$title'","path":"'$3/$f'","time":"'$ctime'"}'>>$config_file
            let fnum=$fnum+1
        fi
    done
    cd $olddir
}

echo '['>>$config_file
cd $mddir
AddMdDir $mddir '1' /markdowns
echo '];'>>$config_file
