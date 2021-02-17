let grafstyl = {
    responsive: true,
    minValue: 0,
    maxValue: 100,
    grid: {
        strokeStyle: '#c0c0c0',
        fillStyle: 'rgba(0, 0, 0, 0)',
        lineWidth: 1,
        millisPerLine: 250,
        verticalSections: 10,
    },
    labels: {
        fillStyle: '#008080'
    }
};

let linestyl = {
    strokeStyle: '#00c080',
    fillStyle: 'rgba(0, 128, 128, 0.25)',
    lineWidth: 2
};

function SwitchTab(head, sect) {
    let sectlist = {
        "cpuu": {
            "cpuu-usej-ttle": "cpuu-usej-body",
            "cpuu-cycl-ttle": "cpuu-cycl-body",
            "cpuu-time-ttle": "cpuu-time-body",
            "cpuu-stat-ttle": "cpuu-stat-body"
        },
        "memo": {
            "memo-over-ttle": "memo-over-body",
            "memo-phys-ttle": "memo-phys-body",
            "memo-virt-ttle": "memo-virt-body",
        },
        "disk": {
            "disk-usej-ttle": "disk-usej-body",
            "disk-part-ttle": "disk-part-body",
        }
    };
    for (indx in sectlist[sect]) {
        if (indx !== head) {
            $("#" + indx).removeClass("active");
            $("#" + sectlist[sect][indx]).removeClass("active");
        }
    }
    $("#" + head).addClass("active");
    $("#" + sectlist[sect][head]).addClass("active");
}

function AskForWebSocketEndpoint() {
    $("#restwarn").modal("setting", "closable", false).modal("show");
}

function FetchWebSocketEndpoint() {
    credjson = {
        "vsonsuri": document.getElementById("vsonsuri").value,
        "passcode": document.getElementById("passcode").value,
    }
    sessionStorage.setItem("vsoniden", JSON.stringify(credjson));
    OverviewGraphAJAX();
}

async function OverviewGraphAJAX() {
    let cpusgraf = new SmoothieChart(grafstyl);
    let physgraf = new SmoothieChart(grafstyl);
    let swapgraf = new SmoothieChart(grafstyl);
    let battgraf = new SmoothieChart(grafstyl);
    let dediphys = new SmoothieChart(grafstyl);
    let dedivirt = new SmoothieChart(grafstyl);
    let cpusline = new TimeSeries();
    let physline = new TimeSeries();
    let swapline = new TimeSeries();
    let battline = new TimeSeries();
    let depyline = new TimeSeries();
    let devtline = new TimeSeries();
    cpusgraf.addTimeSeries(cpusline, linestyl);
    physgraf.addTimeSeries(physline, linestyl);
    swapgraf.addTimeSeries(swapline, linestyl);
    battgraf.addTimeSeries(battline, linestyl);
    dediphys.addTimeSeries(depyline, linestyl);
    dedivirt.addTimeSeries(devtline, linestyl);
    let prcpgraf = [];
    let prcpline = [];
    let cyclgraf = [];
    let cyclline = [];
    let cpuquant = 0;
    await $.getJSON(JSON.parse(sessionStorage.getItem("vsoniden"))["vsonsuri"] + "deadsync/",
        function(data) {
            let deadobjc = JSON.parse(data.deadobjc);
            cpuquant = parseInt(deadobjc["cpuquant"]);
            // Rendered DOM for every disk partition and setting stage for live updating
            for (let indx in deadobjc["diousage"]) {
                $("#disk-usej-body").append(
                    "<table class='ui fixed compact table' id='disk-usej-tabl-" + indx + "'>" + "<thead>" + "<tr>" +
                    "<th colspan='3'><h2 class='bodyfont' id='disk-usej-name-" + indx + "' style='color: #008080;'>" + indx + "</h2></th>" +
                    "<th><div class='ui small horizontal statistic'><div class='value bodyfont' id='disk-usej-bstm-" + indx + "'>0</div><div class='label bodyfont'>BSTM</div></div></th>" +
                    "</tr>" + "</thead>" + "<tbody>" + "<tr>" +
                    "<td><div class='ui small horizontal statistic'><div class='value bodyfont' id='disk-usej-rdct-" + indx + "'>0</div><div class='label bodyfont'>RDCT</div></div></td>" +
                    "<td><div class='ui small horizontal statistic'><div class='value bodyfont' id='disk-usej-wrct-" + indx + "'>0</div><div class='label bodyfont'>WRCT</div></div></td>" +
                    "<td><div class='ui small horizontal statistic'><div class='value bodyfont' id='disk-usej-rdbt-" + indx + "'>0</div><div class='label bodyfont'>RDBT</div></div></td>" +
                    "<td><div class='ui small horizontal statistic'><div class='value bodyfont' id='disk-usej-wrbt-" + indx + "'>0</div><div class='label bodyfont'>WRBT</div></div></td>" +
                    "</tr>" + "<tr>" +
                    "<td><div class='ui small horizontal statistic'><div class='value bodyfont' id='disk-usej-rdtm-" + indx + "'>0</div><div class='label bodyfont'>RDTM</div></div></td>" +
                    "<td><div class='ui small horizontal statistic'><div class='value bodyfont' id='disk-usej-wrtm-" + indx + "'>0</div><div class='label bodyfont'>WRTM</div></div></td>" +
                    "<td><div class='ui small horizontal statistic'><div class='value bodyfont' id='disk-usej-rdmc-" + indx + "'>0</div><div class='label bodyfont'>RDMC</div></div></td>" +
                    "<td><div class='ui small horizontal statistic'><div class='value bodyfont' id='disk-usej-wrmc-" + indx + "'>0</div><div class='label bodyfont'>WRMC</div></div></td>" +
                    "</tr>" + "</tbody>" + "</table>"
                );
            }
            // One-time rendering of disk partitions
            for (let indx = 0; indx < deadobjc.diskpart.length; indx ++) {
                $("#disk-part-body").append(
                    "<table class='ui definition fixed compact table'>" + "<tbody>" + "<tr>" + "<td rowspan='2' class='four wide'>" +
                    "<h1 class='bodyfont' style='margin: 0px; color: #008080;' id='disk-part-name-" + indx + "'>" + deadobjc.diskpart[indx]["device"] + "</h1>" +
                    "<pre style='margin: 0px;' id='disk-part-fsys-" + indx + "'>" + deadobjc.diskpart[indx]["fstype"] + "</pre>" + "</td>" +
                    "<td class='twelve wide'><div class='ui teal horizontal label'><code>MLOC</code></div><code id='disk-part-mloc-" + indx + "'>" + deadobjc.diskpart[indx]["mountpoint"] + "</code></td>" +
                    "</tr>" + "<tr>" + "<td class='rowspanned'></td>" +
                    "<td><div class='ui teal horizontal label'><code>OPTS</code></div><code id='disk-part-opts-" + indx + "'>" + deadobjc.diskpart[indx]["opts"] + "</code></td>" +
                    "</tr>" + "</tbody>" + "</table>"
                )
            }
            for (let indx = 0; indx < cpuquant; indx++) {
                $("#prcpgraf").append(
                    "<div class='teal padded card bodyfont'>" +
                    "<div class='content'>" + "<div class='header bodyfont' style='color: #00c080;'>CPU #" + indx + "</div>" +
                    "<div class='meta'><span id='cpuu-perc-" + indx + "'>0</span>% in use</div>" + "<div class='description'>" +
                    "<canvas id='cpuu-graf-" + indx + "' style='width:100%; height:12.5vh;'></canvas>" +
                    "</div>" + "</div>" + "</div>"
                );
                $("#cyclgraf").append(
                    "<div class='teal padded card bodyfont'>" +
                    "<div class='content'>" + "<div class='header bodyfont' style='color: #00c080;'>CPU #" + indx + "</div>" +
                    "<div class='meta'><span id='cpuu-cycl-curt-" + indx + "'>0</span>MHz (<span id='cpuu-cycl-mine-" + indx + "'>0</span>/<span id='cpuu-cycl-maxe-" + indx + "'>0</span>)</div>" +
                    "<div class='description'>" + "<canvas id='cpuu-cygf-" + indx + "' style='width:100%; height:12.5vh;'></canvas>" +
                    "</div>" + "</div>" + "</div>"
                );
                let sncpgraf = new SmoothieChart(grafstyl);
                let sncpline = new TimeSeries();
                let scycgraf = new SmoothieChart({
                    responsive: true,
                    minValue: deadobjc.cpuclock[indx]["min"],
                    maxValue: deadobjc.cpuclock[indx]["max"],
                    grid: {
                        strokeStyle: '#c0c0c0',
                        fillStyle: 'rgba(0, 0, 0, 0)',
                        lineWidth: 1,
                        millisPerLine: 250,
                        verticalSections: 10,
                    },
                    labels: {
                        fillStyle: '#008080'
                    }
                });
                let scycline = new TimeSeries();
                sncpgraf.addTimeSeries(sncpline, linestyl);
                scycgraf.addTimeSeries(scycline, linestyl);
                prcpgraf[prcpgraf.length] = sncpgraf;
                prcpline[prcpline.length] = sncpline;
                cyclgraf[cyclgraf.length] = scycgraf;
                cyclline[cyclline.length] = scycline;
            }
            if (deadobjc.passcode === JSON.parse(sessionStorage.getItem("vsoniden"))["passcode"]) {
                document.getElementById("systover").innerText = deadobjc.osnmdata["System name"];
                document.getElementById("hostover").innerText = deadobjc.osnmdata["Host name"];
                document.getElementById("versover").innerText = deadobjc.osnmdata["Version"];
                document.getElementById("userover").innerText = deadobjc.osnmdata["Username"];
                document.getElementById("bootover").innerText = deadobjc.boottime;
            } else {
                $("#wrngiden").modal("setting", "closable", false).modal("show");
            }
        }
    );
    for (let indx = 0; indx < cpuquant; indx ++) {
        $("#cpuu-time-tabl-cont").append(
            "<tr>" +
            "<td id='cpuu-time-name-" + indx + "'>CPU #" + indx + "</td>" +
            "<td id='cpuu-time-user-" + indx + "'>Unavailable</td>" +
            "<td id='cpuu-time-nice-" + indx + "'>Unavailable</td>" +
            "<td id='cpuu-time-syst-" + indx + "'>Unavailable</td>" +
            "<td id='cpuu-time-idle-" + indx + "'>Unavailable</td>" +
            "<td id='cpuu-time-iowt-" + indx + "'>Unavailable</td>" +
            "<td id='cpuu-time-ireq-" + indx + "'>Unavailable</td>" +
            "<td id='cpuu-time-soft-" + indx + "'>Unavailable</td>" +
            "<td id='cpuu-time-stel-" + indx + "'>Unavailable</td>" +
            "<td id='cpuu-time-gest-" + indx + "'>Unavailable</td>" +
            "<td id='cpuu-time-gtnc-" + indx + "'>Unavailable</td>" + 
            "</tr>"
        );
    }
    while (1) {
        await new Promise(r => setTimeout(r, 1000));
        $.getJSON(JSON.parse(sessionStorage.getItem("vsoniden"))["vsonsuri"] + "livesync/",
            function (data) {
                let liveobjc = JSON.parse(data.liveobjc);
                if (liveobjc.passcode === JSON.parse(sessionStorage.getItem("vsoniden"))["passcode"]) {
                    for (let indx in liveobjc.cpuprcnt) {
                        cpusline.append(new Date().getTime(), parseFloat(liveobjc.cpuprcnt[indx]).toPrecision(3));
                        document.getElementById("cpusvalu").innerText = parseFloat(liveobjc.cpuprcnt[indx]).toPrecision(3);
                    }
                    depyline.append(new Date().getTime(), parseFloat(liveobjc.virtdata["percent"]).toPrecision(3));
                    document.getElementById("phys-dedi-byte").innerText = parseInt(liveobjc.virtdata["used"]) + " of " + parseInt(liveobjc.virtdata["total"]);
                    physline.append(new Date().getTime(), parseFloat(liveobjc.virtdata["percent"]).toPrecision(3));
                    document.getElementById("physvalu").innerText = parseFloat(liveobjc.virtdata["percent"]).toPrecision(3);
                    document.getElementById("phys-dedi-perc").innerText = parseInt(liveobjc.virtdata["percent"]);
                    devtline.append(new Date().getTime(), parseFloat(liveobjc.swapinfo["percent"]).toPrecision(3));
                    document.getElementById("virt-dedi-byte").innerText = parseInt(liveobjc.swapinfo["used"]) + " of " + parseInt(liveobjc.swapinfo["total"]);
                    swapline.append(new Date().getTime(), parseFloat(liveobjc.swapinfo["percent"]).toPrecision(3));
                    document.getElementById("swapvalu").innerText = parseFloat(liveobjc.swapinfo["percent"]).toPrecision(3);
                    document.getElementById("virt-dedi-perc").innerText = parseInt(liveobjc.swapinfo["percent"]);
                    battline.append(new Date().getTime(), parseFloat(liveobjc.sensread.battstat["percent"]).toPrecision(3));
                    document.getElementById("battvalu").innerText = parseFloat(liveobjc.sensread.battstat["percent"]).toPrecision(3);
                    for (let indx = 0; indx < cpuquant; indx ++) {
                        prcpline[indx].append(new Date().getTime(), parseFloat(liveobjc.cpuprcnt[indx]).toPrecision(3));
                        document.getElementById("cpuu-perc-"+indx).innerText = parseFloat(liveobjc.cpuprcnt[indx]).toPrecision(3);
                        cyclline[indx].append(new Date().getTime(), parseFloat(liveobjc.cpuclock[indx]["current"]).toPrecision(5));
                        document.getElementById("cpuu-cycl-curt-" + indx).innerText = parseFloat(liveobjc.cpuclock[indx]["current"]).toPrecision(5);
                        document.getElementById("cpuu-cycl-mine-" + indx).innerText = parseFloat(liveobjc.cpuclock[indx]["min"]).toPrecision(5);
                        document.getElementById("cpuu-cycl-maxe-" + indx).innerText = parseFloat(liveobjc.cpuclock[indx]["max"]).toPrecision(5);
                    }
                    document.getElementById("cpuu-stat-ctxs").innerText = liveobjc.cpustats["ctx_switches"];
                    document.getElementById("cpuu-stat-intr").innerText = liveobjc.cpustats["interrupts"];
                    document.getElementById("cpuu-stat-soft").innerText = liveobjc.cpustats["soft_interrupts"];
                    document.getElementById("cpuu-stat-syst").innerText = liveobjc.cpustats["syscalls"];
                    // Physical memory dedicated statistics table updater
                    document.getElementById("memo-phys-totl").innerText = liveobjc.virtdata["total"];
                    document.getElementById("memo-phys-free").innerText = liveobjc.virtdata["available"];
                    document.getElementById("memo-phys-used").innerText = liveobjc.virtdata["used"];
                    document.getElementById("memo-phys-actv").innerText = liveobjc.virtdata["active"];
                    document.getElementById("memo-phys-inac").innerText = liveobjc.virtdata["inactive"];
                    document.getElementById("memo-phys-buff").innerText = liveobjc.virtdata["buffers"];
                    document.getElementById("memo-phys-cach").innerText = liveobjc.virtdata["cached"];
                    document.getElementById("memo-phys-shar").innerText = liveobjc.virtdata["shared"];
                    document.getElementById("memo-phys-slab").innerText = liveobjc.virtdata["slab"];
                    // Virtual memory dedicated statistics table updater
                    document.getElementById("memo-virt-totl").innerText = liveobjc.swapinfo["total"];
                    document.getElementById("memo-virt-free").innerText = liveobjc.swapinfo["free"];
                    document.getElementById("memo-virt-used").innerText = liveobjc.swapinfo["used"];
                    document.getElementById("memo-virt-sine").innerText = liveobjc.swapinfo["sin"];
                    document.getElementById("memo-virt-sout").innerText = liveobjc.swapinfo["sout"];
                    // Disk usage body updater
                    for (let indx in liveobjc["diousage"]) {
                        //console.log("disk-usej-name-" + indx);
                        document.getElementById("disk-usej-name-" + indx).innerText = indx;
                        document.getElementById("disk-usej-bstm-" + indx).innerText = liveobjc["diousage"][indx]["busy_time"];
                        document.getElementById("disk-usej-rdct-" + indx).innerText = liveobjc["diousage"][indx]["read_count"];
                        document.getElementById("disk-usej-wrct-" + indx).innerText = liveobjc["diousage"][indx]["write_count"];
                        document.getElementById("disk-usej-rdbt-" + indx).innerText = liveobjc["diousage"][indx]["read_bytes"];
                        document.getElementById("disk-usej-wrbt-" + indx).innerText = liveobjc["diousage"][indx]["write_bytes"];
                        document.getElementById("disk-usej-rdtm-" + indx).innerText = liveobjc["diousage"][indx]["read_time"];
                        document.getElementById("disk-usej-wrtm-" + indx).innerText = liveobjc["diousage"][indx]["write_time"];
                        document.getElementById("disk-usej-rdmc-" + indx).innerText = liveobjc["diousage"][indx]["read_merged_count"];
                        document.getElementById("disk-usej-wrmc-" + indx).innerText = liveobjc["diousage"][indx]["write_merged_count"];
                    }
                    // Stream graphs to DOM Canvas elements
                    cpusgraf.streamTo(document.getElementById("cpusover"), 1000);
                    physgraf.streamTo(document.getElementById("physover"), 1000);
                    swapgraf.streamTo(document.getElementById("swapover"), 1000);
                    battgraf.streamTo(document.getElementById("battover"), 1000);
                    dediphys.streamTo(document.getElementById("phys-dedi-graf"), 1000);
                    dedivirt.streamTo(document.getElementById("virt-dedi-graf"), 1000);
                    for (let indx = 0; indx < cpuquant; indx ++) {
                        cyclgraf[indx].streamTo(document.getElementById("cpuu-cygf-" + indx), 1000);
                        prcpgraf[indx].streamTo(document.getElementById("cpuu-graf-" + indx), 1000);
                    }
                    for (let indx = 0; indx < cpuquant; indx ++) {
                        document.getElementById("cpuu-time-user-"+indx).innerText = liveobjc.cputimes[indx]["user"];
                        document.getElementById("cpuu-time-nice-"+indx).innerText = liveobjc.cputimes[indx]["nice"];
                        document.getElementById("cpuu-time-syst-"+indx).innerText = liveobjc.cputimes[indx]["system"];
                        document.getElementById("cpuu-time-idle-"+indx).innerText = liveobjc.cputimes[indx]["idle"];
                        document.getElementById("cpuu-time-iowt-"+indx).innerText = liveobjc.cputimes[indx]["iowait"];
                        document.getElementById("cpuu-time-ireq-"+indx).innerText = liveobjc.cputimes[indx]["irq"];
                        document.getElementById("cpuu-time-soft-"+indx).innerText = liveobjc.cputimes[indx]["softirq"];
                        document.getElementById("cpuu-time-stel-"+indx).innerText = liveobjc.cputimes[indx]["steal"];
                        document.getElementById("cpuu-time-gest-"+indx).innerText = liveobjc.cputimes[indx]["guest"];
                        document.getElementById("cpuu-time-gtnc-"+indx).innerText = liveobjc.cputimes[indx]["guest_nice"];
                        
                    }
                } else {
                    $("#wrngiden").modal("setting", "closable", false).modal("show");
                }
            }
        );
    }
}