(function(window,document) {
var Content = document.getElementById("content");
var filetree = document.getElementById("filetree");

var headbar = {
    weblogo: document.getElementById("logo"),
    webname: document.getElementById("webname"),
    sysmenu: document.getElementById("sysmenu"),
    webmenu: document.getElementById("menus")
};

var footbar = {
    beian: document.getElementById("beian"),
    copyright: document.getElementById("copyright")
}

var Dialogs = {
    dialog: document.getElementById("dialogtmp"),

    sysinfo: document.getElementById("sysinfotmp"),
    prefer: document.getElementById("prefertmp"),
    shutdown: document.getElementById("shutdowntmp")
}

var FSTree = {};

const TAB_INDENT = 4;
const MARKDOWN_ROOT = "/markdowns";

function addSpace(line, ctxLen, tbCnt) {
	if (tbCnt > 0) {
		let spaceCnt = (TAB_INDENT - (ctxLen % TAB_INDENT)) + TAB_INDENT * (tbCnt - 1);
		for (let k = 0; k < spaceCnt; ++k) {
			line.push(' ');
		}
	}
}

function tabToSpace(txt) {
	let lines = txt.split("\n");
	for (let i = 0; i < lines.length; ++i) {
		let li = lines[i];
		let line = [];
		let tbCnt = 0;
		let piecelen = 0;
		for (let j = 0; j < li.length; ++j) {
			if (li[j] == '\t') {
				++tbCnt;
			} else {
				addSpace(line, piecelen, tbCnt);
				if (tbCnt > 0) {
					piecelen = 0;
				}
				tbCnt    = 0;
				line.push(li[j]);
				++piecelen;
			}
		}
		addSpace(line, piecelen, tbCnt);
		lines[i] = line.join("");
	}
	return lines.join("\n");
}

function setArticle(data, fpath) {
    if (!data || data == "") {
        console.log("data error.\n");
    }
	let md = new markdownit();
	data = md.render(data);
    Content.innerHTML = data;
    // load math jax
    let script = document.createElement("script");
    script.setAttribute("defer", "true");
    script.setAttribute("src", "js/parse-mathjax.js");
    Content.appendChild(script);

    // parse graphs
    let pgscript = document.createElement("script");
    pgscript.innerHTML = "parseGraphs();";
    Content.appendChild(pgscript);

	// highlight block codes
	let codes = document.querySelectorAll("pre code");
	if (codes) {
		codes.forEach((block)=> {
			block.innerHTML = tabToSpace(block.innerHTML);
			hljs.highlightBlock(block);
		});
	}

	// rewrite pictures path
    let paths = fpath.split("/");
    // document.title = paths[paths.length - 1];
	paths.splice(paths.length - 1, 1);
	let basepath = paths.join("/");
	let images = document.querySelectorAll("#content img");
	if (images) {
		images.forEach((img) => {
			let spaths = img.src.split("//");
			spaths.splice(0, 1);
			spaths = spaths[0].split("/");
			spaths.splice(0, 1);
			img.src = basepath + "/" + spaths.join("/");
		});
	}
}

async function onSetArticle(e)
{
    e.preventDefault();
    if (e.target == filetree) {
        return;
    }
    try {
        let idx = parseInt(e.target.dataset.index);
        let info = artlist[idx];
        let stat = {index: idx}
		if (e.noHistory != "yes") {
			window.history.pushState(stat,
                                 info.title, 
                                 '/index.html?p=' + idx);
		}
    } catch (err) {
         console.log(err);
    }
    Content.innerHTML = "loading...";
    let file = e.target.dataset.path;
    let siblings = e.target.parentNode.children;
    for (let i = 0; i < siblings.length; ++i) {
        siblings[i].className = "note-link";
    }
    e.target.className = "note-link active";
    try {
        await fetch(file).then(function(res) {
            return res.text();
        }).then(function(txt) {
            setArticle(txt, file);
        });
    } catch(err)  {
        Content.innerHTML = err;
    }
}

filetree.addEventListener("click", function(ev) {
    onSetArticle(ev);
}, false);

function setFileList(fsarr) {
    if (!fsarr)
        return;
    filetree.innerHTML = "";
    for (let i = 0; i < fsarr.length; ++i) {
        let data = artlist[fsarr[i]];
        let item = document.createElement("a");
        item.href = "#";
        item.dataset.path = data["path"];
        item.dataset.index = "" + i;
        item.textContent = data["title"];
        item.className = "note-link";
        filetree.appendChild(item);
    }
}

function initRightPage() {
    let url = window.location.href;
    let uris = url.split("?")
    if (uris.length < 2) {
        return;
    }
    let query = uris[1];
    let params = query.split("&");
    let pobj = {};
    for (let i = 0; i < params.length; ++i) {
        let kv = params[0].split("=");
        pobj[kv[0]] = kv[1];
    }
    let page = parseInt(pobj['p']);
    let btn = filetree.children[page];
    onSetArticle({target: btn, noHistory: "yes", preventDefault: function() {}});
}

function setWebInfo() {
    if (webinfo.logo) {
        headbar.weblogo.children[0].src = webinfo.logo;
    }
    if (webinfo.name) {
        headbar.webname.innerHTML = "<a href='/index.html'>" + webinfo.name + "</a>";
        document.title = webinfo.name;
    }
    if (webinfo.beian) {
        footbar.beian.innerHTML = webinfo.beian;
    }
    if (webinfo.copyright) {
        footbar.copyright.innerHTML = webinfo.copyright;
    }
}

function _genMenuHelper(dom, data, sub, parentPath) {
    let curitem = document.createElement("div");
    curitem.className = "item";
    curitem.dataset.path = parentPath + "/" + data;
    curitem.innerHTML = '<div class="menu-title">' + data + '</div>';
    if (Object.keys(sub).length > 0) {
        let subm = document.createElement("div");
        subm.className = "submenu";
        // add current first
        let meitem = document.createElement("div");
        meitem.className = "item";
        meitem.dataset.path = curitem.dataset.path;
        meitem.innerHTML = '<div class="menu-title">' + data + '</div>';
        subm.appendChild(meitem);
        // add line
        let sepline = document.createElement("div");
        sepline.className = "line";
        subm.appendChild(sepline);
        for (let kn in sub) {
            _genMenuHelper(subm, kn, sub[kn], parentPath + "/" + data);
        }
        curitem.appendChild(subm);
    }
    dom.appendChild(curitem);
}

function parseMenu() {
    // generate menu tree data
    let menuarr = {};
    for (let i = 0; i < artlist.length; ++i) {
        let pathi = artlist[i].path;
        let pathpart = pathi.split("/");
        let node = menuarr;
        for (let j = 2; j < pathpart.length - 1; ++j) {
            let curnode = node[pathpart[j]];
            if (!curnode) {
                curnode = {};
                node[pathpart[j]] = curnode;
            }
            node = curnode;
        }
        // update FSTree
        pathpart.splice(pathpart.length - 1, 1);
        let fdir = pathpart.join("/");
        if (!FSTree.hasOwnProperty(fdir)) {
            FSTree[fdir] = [];
        }
        FSTree[fdir].push(i);
    }
    // generate menu tree view
    let mtree = document.createElement("div");
    mtree.className = "topmenu";
    for (let kn in menuarr) {
        _genMenuHelper(mtree, kn, menuarr[kn], MARKDOWN_ROOT);
    }
    headbar.webmenu.appendChild(mtree);
}

// diaglog of system info
function fillSystemInfo(sysinfo) {
    sysinfo.querySelector(".si-logo-icon img").src = webinfo.logo;
    sysinfo.querySelector(".si-logo-name").textContent = webinfo.name;
    let ref = sysinfo.querySelector(".si-info.ref");
    for (let i = 0; i < webinfo.reference.length; ++i) {
        let aaa = document.createElement("a");
        aaa.href = webinfo.reference[i];
        aaa.innerHTML = '[' + (i + 1) + '] ' + webinfo.reference[i];
        ref.appendChild(aaa);
    }
    let spec = sysinfo.querySelector(".si-spec");
    for (let i = 0; i < webinfo.spec.length; ++i) {
        let ddd = document.createElement("div");
        ddd.innerHTML = webinfo.spec[i];
        spec.appendChild(ddd);
    }
}

// dialog of perference
function fillPreference(prefer) {
    prefer.querySelector(".name").children[0].value = webinfo.name;
    prefer.querySelector(".logo").children[0].value = webinfo.logo;
    prefer.querySelector(".line-width").children[0].value = flowconfig["line-width"];
    prefer.querySelector(".line-length").children[0].value = flowconfig["line-length"];
    prefer.querySelector(".font-size").children[0].value = flowconfig["font-size"];
    prefer.querySelector(".yes-title").children[0].value = flowconfig["yes-text"];;
    prefer.querySelector(".no-title").children[0].value = flowconfig["no-text"];
}

// dialog of shutdown
function fillShutdown(shut) {
    shut.querySelector(".sti-icon img").src = webinfo.shutdownIcon;
}

function savePreference(ptinfos) {
    // HTML5 local storage will not be used.
    for (let i = 0; i < ptinfos.length; ++i) {
        let pti = ptinfos[i].children[0];
        if (pti.name == "wname") {
            webinfo.name = pti.value;
        } else if (pti.name == "wlogo") {
            webinfo.logo = pti.value;
        } else {
            flowconfig[pti.name] = pti.value;
        }
    }
    flowconfig["line-width"] = parseInt(flowconfig["line-width"]);
    flowconfig["line-length"] = parseInt(flowconfig["line-length"]);
    flowconfig["font-size"] = parseInt(flowconfig["font-size"]);
}

function closeDialog(ev) {
    let diags = document.body.querySelectorAll(".dialog");
    for (let x = 0; x < diags.length; ++x) {
        let ptinfos = diags[x].querySelectorAll(".pt-info");
        if (ptinfos && ptinfos.length > 0)  {
            savePreference(ptinfos);
        }
        document.body.removeChild(diags[x]);
    }
}

function shutdownNow(ev) {
    closeDialog(ev);
    // window.close();
}

function shutCancel(ev) {
    closeDialog(ev);
}

function sysmenuCallback(ev) {
    let who = ev.target;
    let mtype = who.dataset.type;
    if (!mtype) {
        return;
    }
    
    let diaglog = document.importNode(Dialogs.dialog.content, true);
    let diagtitle = diaglog.querySelector(".d-t-ctx");
    let closebtn = diaglog.querySelector(".d-t-close");
    let diagbody  = diaglog.querySelector(".d-ctx");
    if (mtype == "about") {
        diagtitle.innerHTML = "系统信息";
        let about = document.importNode(Dialogs.sysinfo.content, true);
        fillSystemInfo(about);
        diagbody.appendChild(about);
        // listen switch
        let swbtns = diaglog.querySelector(".si-btns");
        swbtns.addEventListener("click", sysinfoSwitchCallback, false);
    }
    else if (mtype == "preference") {
        diagtitle.innerHTML = "偏好设置";
        let pref = document.importNode(Dialogs.prefer.content, true);
        fillPreference(pref);
        diagbody.appendChild(pref);
    }
    else if (mtype == "shutdown") {
        diagtitle.innerHTML = "关闭\"计算机\"?";
        let shut = document.importNode(Dialogs.shutdown.content, true);
        fillShutdown(shut);
        diagbody.appendChild(shut);
        diaglog.querySelector(".ok").addEventListener("click", shutdownNow, false);
        diaglog.querySelector(".cancel").addEventListener("click", shutCancel, false);
    }
    document.body.appendChild(diaglog);
    closebtn.addEventListener("click", closeDialog, false);
}

function sysinfoSwitchCallback(ev) {
    let who = ev.target;
    let btns = who.parentNode.children;
    for (let i = 0; i < btns.length; ++i) {
        btns[i].className = btns[i].className.replace(/ active/g, '');
    }
    who.className = who.className + " active";
    let winname = who.dataset.win;
    let wins = this.parentNode.querySelector(".si-wins").children;
    for (let i = 0; i < wins.length; ++i) {
        wins[i].className = wins[i].className.replace(/ active/g, '');
        if (wins[i].dataset.win == winname) {
            wins[i].className = wins[i].className + " active";
        }
    }
}

function menuCallback(ev) {
    let who = ev.target;
    if (who.className != "menu-title") {
        return;
    }
    let fdir = who.parentNode.dataset.path;
    if (!fdir) {
        return;
    }
    document.title = fdir;
    setFileList(FSTree[fdir]);
}

function listen() {
    // history back
    window.onpopstate = function(ev) {
        let stat = ev.state;
        if (!stat) {
            return;
        }
        // window.location.href = window.location.href;
        initRightPage();
    }

    // listen sysmenu
    headbar.sysmenu.addEventListener("click", sysmenuCallback, false);
    headbar.webmenu.addEventListener("click", menuCallback, false);
}

function init() {
    setWebInfo();
    parseMenu();
    listen();
    setFileList(FSTree[MARKDOWN_ROOT]);
    initRightPage();
}

init();
})(window,document);
