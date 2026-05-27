

function seriesLoadScripts(scripts, options, callback) {
    if (typeof scripts !== "object") {
        var scripts = [scripts];
    }
    var HEAD = document.getElementsByTagName("head")[0] || document.documentElement;
    var s = [];
    var last = scripts.length - 1;
    //递归
    var recursiveLoad = function(i) {
        s[i] = document.createElement("script");
        s[i].setAttribute("type", "text/javascript");
        // Attach handlers for all browsers
        // 异步
        s[i].onload = s[i].onreadystatechange = function() {
            if (!(/*@cc_on!@*/ 0) || this.readyState === "loaded" || this.readyState === "complete") {
                this.onload = this.onreadystatechange = null;
                this.parentNode.removeChild(this);
                if (i !== last) {
                    recursiveLoad(i + 1);
                } else if (typeof callback === "function") {
                    callback();
                }
            }
        };
        // 同步
        s[i].setAttribute("src", scripts[i]);

        // 设置属性
        if (typeof options === "object") {
            for (var attr in options) {
                s[i].setAttribute(attr, options[attr]);
            }
        }

        HEAD.appendChild(s[i]);
    };
    recursiveLoad(0);
}

function parallelLoadScripts(scripts, options, callback) {
    if (typeof scripts !== "object") {
        var scripts = [scripts];
    }
    var HEAD = document.getElementsByTagName("head")[0] || document.documentElement;
    var s = [];
    var loaded = 0;
    for (var i = 0; i < scripts.length; i++) {
        s[i] = document.createElement("script");
        s[i].setAttribute("type", "text/javascript");
        // Attach handlers for all browsers
        // 异步
        s[i].onload = s[i].onreadystatechange = function() {
            if (!(/*@cc_on!@*/ 0) || this.readyState === "loaded" || this.readyState === "complete") {
                loaded++;
                this.onload = this.onreadystatechange = null;
                this.parentNode.removeChild(this);
                if (loaded === scripts.length && typeof callback === "function") callback();
            }
        };
        // 同步
        s[i].setAttribute("src", scripts[i]);

        // 设置属性
        if (typeof options === "object") {
            for (var attr in options) {
                s[i].setAttribute(attr, options[attr]);
            }
        }

        HEAD.appendChild(s[i]);
    }
}

function loadLink(url) {
    var doc = document;
    var link = doc.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", url);

    var heads = doc.getElementsByTagName("head");
    if (heads.length) {
        heads[0].appendChild(link);
    } else {
        doc.documentElement.appendChild(link);
    }
}

function loadLinks(urls) {
    if (typeof urls !== "object") {
        urls = [urls];
    }
    if (urls.length) {
        urls.forEach((url) => {
            loadLink(url);
        });
    }
}

export { seriesLoadScripts, parallelLoadScripts, loadLink, loadLinks };
