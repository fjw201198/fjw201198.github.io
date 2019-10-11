#!/usr/bin/awk -f

BEGIN {
    mon["Jan"] = "01";
    mon["Feb"] = "02";
    mon["Mar"] = "03";
    mon["Apr"] = "04";
    mon["May"] = "05";
    mon["Jun"] = "06";
    mon["Jul"] = "07";
    mon["Aug"] = "08";
    mon["Sep"] = "09";
    mon["Oct"] = "10";
    mon["Nov"] = "11";
    mon["Dec"] = "12";
    FS=" ";
}

{
    mm = mon[$6];
    d = 0 + $7;
    dd = $7;
    if (d < 10) {
        dd = "0"dd;
    }
    print $9"-"mm"-"dd" "$8;
}
