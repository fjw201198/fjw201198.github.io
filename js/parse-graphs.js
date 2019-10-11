function parseSequence(dom) {
    let ctx = dom.innerHTML;
    ctx = ctx.replace(/&gt;/g, ">");
    ctx = ctx.replace(/&lt;/g, "<");
    let seq = Diagram.parse(ctx);
    let pic = document.createElement("div");
    pic.className = "mp-seq-svg";
    dom.parentNode.appendChild(pic);
    dom.style.display = "none";
    seq.drawSVG(pic, {theme: 'simple'});
}

function parseFlow(dom) {
    let ctx = dom.innerHTML;
    ctx = ctx.replace(/&gt;/g, ">");
    ctx = ctx.replace(/&lt;/g, "<");
    let flow = flowchart.parse(ctx);
    let pic = document.createElement("div");
    pic.className = "mp-flow-svg";
    dom.parentNode.appendChild(pic);
    dom.style.display = "none";
    flow.drawSVG(pic, flowconfig);
    // flow.drawSVG(pic);
}


function parseMermaid(dom, idx) {
    let ctx = dom.innerHTML;
    ctx = ctx.replace(/&gt;/g, ">");
    ctx = ctx.replace(/&lt;/g, "<");

    let pic = document.createElement("div");
    pic.className = "mp-mermaid-svg";
    let svgid = "mp-mermaid-" + idx;
    dom.parentNode.appendChild(pic);
    let inserter = function(svgcode, bf) {
        pic.innerHTML = svgcode;
    }
    let mer = mermaid.render(svgid, ctx, inserter);
    dom.style.display = "none";
}

function parseGraphs() {
    // parse sequences
    let Content = document.getElementById("content");
    let seqs = Content.querySelectorAll(".language-sequence");
    if (seqs) {
        for (let i = 0; i < seqs.length; ++i) {
            parseSequence(seqs[i]);
        }
    }
    let flows = Content.querySelectorAll(".language-flow");
    if (flows) {
        for (let i = 0; i < flows.length; ++i) {
            parseFlow(flows[i]);
        }
    }
    let mers = Content.querySelectorAll(".language-mermaid");
    if (mers) {
        for (let i = 0; i < mers.length; ++i) {
            parseMermaid(mers[i], i);
        }
    }
}

// parseGraphs();
