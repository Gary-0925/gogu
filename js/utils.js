let supabaseClient = null;

function getClient() {
    if (!supabaseClient) {
        const supabaseUrl = 'https://xagbayhoblnpfropmrdi.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZ2JheWhvYmxucGZyb3BtcmRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTY4NzYsImV4cCI6MjA3NjM5Mjg3Nn0.jDRu8MZdEyc0jJDuYXXJ3_LzBM_rwqmjGyvegqVCqO0';
        supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    }
    return supabaseClient;
}

function getArgs(key) {
    const args = {};
    for (const [k, v] of new URLSearchParams(window.location.search).entries()) {
        args[k] = v;
    }
    return key ? args[key] : args;
}

document.addEventListener('DOMContentLoaded', function () {
    const currentPath = window.location.pathname;
    let scriptPath = currentPath.replace(/\.html$/, '.js');
    if (!scriptPath.endsWith(".js")) scriptPath += ".js";
    const script = document.createElement('script');
    script.src = scriptPath;
    document.head.appendChild(script);
});

function sign_out() {
    localStorage.removeItem("name");
    localStorage.removeItem("priKey");
    window.location.reload();
}

function change_theme() {
    if (localStorage.getItem("theme") == 'light') localStorage.setItem("theme", "dark");
    else if (localStorage.getItem("theme") == 'color') localStorage.setItem("theme", "light");
    else localStorage.setItem("theme", "color");
    window.location.reload();
}

function leftbar_hover() {
    const El = document.querySelectorAll('.leftbar');
    if (
            window.getComputedStyle(El[0]).width[0] == '1' &&
            !El[0].innerHTML.includes("聊天")
    ) {
        El[0].innerHTML = `
            <div class="leftbar_item"></div>
            <a href="/gogu/message.html">
                <div class="leftbar_item" style="width: 90%;">
                    <div class="leftbar_text">
                        <img src="/gogu/image/message.svg" style="height: 22px; width: 22px;">
                        <div style="height: 100%; display: inline;">
                            <div style="height: 100%; display: table-cell; vertical-align: middle;">&nbsp;&nbsp;聊天</div>
                        </div>
                    </div>
                </div>
            </a>
            <a href="/gogu/article.html">
                <div class="leftbar_item" style="width: 90%;">
                    <div class="leftbar_text">
                        <img src="/gogu/image/article.svg" style="height: 22px; width: 22px;">
                        <div style="height: 100%; display: inline">
                            <div style="height: 100%; display: table-cell; vertical-align: middle;">&nbsp;&nbsp;文章</div>
                        </div>
                    </div>
                </div>
            </a>
            <a href="/gogu/page.html">
                <div class="leftbar_item" style="width: 90%;">
                    <div class="leftbar_text">
                        <img src="/gogu/image/page.svg" style="height: 22px; width: 22px;">
                        <div style="height: 100%; display: inline">
                            <div style="height: 100%; display: table-cell; vertical-align: middle;">&nbsp;&nbsp;页面</div>
                        </div>
                    </div>
                </div>
            </a>
            <a href="/gogu/whisper.html">
                <div class="leftbar_item" style="width: 90%;">
                    <div class="leftbar_text">
                        <img src="/gogu/image/whisper.svg" style="height: 22px; width: 22px;">
                        <div style="height: 100%; display: inline">
                            <div style="height: 100%; display: table-cell; vertical-align: middle;">&nbsp;&nbsp;即将推出</div>
                        </div>
                    </div>
                </div>
            </a>
            <div class="leftbar_item" style="width: 90%;">
                <div style="height: 1px; width: 90%; background-color: #e0e0e0;"></div>
            </div>
            <div class="leftbar_item" style="width: 90%;">
                <h6>相关链接<h6>
            </div>
            <a href="/gogu/article.html?id=-1000000000000000000">
                <div class="leftbar_item" style="width: 90%">
                    <div class="leftbar_text">
                        <div style="height: 100%; display: inline">
                            <div style="height: 100%; display: table-cell; vertical-align: middle;">关于咯咕</div>
                        </div>
                    </div>
                </div>
            </a>
            <a href="https://www.luogu.com.cn/user/1202669">
                <div class="leftbar_item" style="width: 90%">
                    <div class="leftbar_text">
                        <div style="height: 100%; display: inline">
                            <div style="height: 100%; display: table-cell; vertical-align: middle;">关于 Gary0</div>
                        </div>
                    </div>
                </div>
            </a>
        `;
    }
}

function leftbar_not_hover() {
    const El = document.querySelectorAll('.leftbar');
    El[0].innerHTML = `
        <div class="leftbar_item"></div>
        <div class="leftbar_item">
            <div class="leftbar_text">
                <img src="/gogu/image/message.svg" style="height: 22px; width: 22px;">
            </div>
        </div>
        <div class="leftbar_item">
            <div class="leftbar_text">
                <img src="/gogu/image/article.svg" style="height: 22px; width: 22px;">
            </div>
        </div>
        <div class="leftbar_item">
            <div class="leftbar_text">
                <img src="/gogu/image/page.svg" style="height: 22px; width: 22px;">
            </div>
        </div>
        <div class="leftbar_item">
            <div class="leftbar_text">
                <img src="/gogu/image/whisper.svg" style="height: 22px; width: 22px;">
            </div>
        </div>
    `;
}

function write_path(name, url) {
    const El = document.getElementById('path');
    El.innerHTML += `
        <div class="topbar_item" style="width: auto;">/</div>
        <a href=${url}>
            <div class="topbar_item">
                <div class="topbar_text">${name}</div>
            </div>
        </a>
    `;
}


document.write(`
    <!--ul>
        <li><a href="https://www.luogu.com.cn/user/1202669">Gary0</a></li>
        <li><a href="/gogu/message.html">聊天</a></li>
        <li><a href="/gogu/article.html">文章</a></li>
        <li><a href="/gogu/page.html"><button style="height: 15px; padding: 2px;">NEW!</button>页面</a></li>
        <li><a href="/gogu/prikey.html">我的</a></li>
        <div style="position: fixed; right: 0;">
            <li style="position: float;"><a href="javascript:change_theme()">主题</a></li>
            <li style="position: float;"><a href="javascript:sign_out()" style="color: red;">登出</a></li>
        </div>
    </ul-->
    <link rel="shortcut icon" href="/gogu/image/favicon.ico">
    <div class="topbar" id="mainbar">
        <div class="topbar_item">
            <a href="/gogu/index.html">
                <img src="/gogu/image/icon.svg" alt="图标" style="height: 55px; width: 55px;">
            </a>
        </div>
        <div class="topbar_item" id="path" style="width: auto;">
            <a href="/gogu/index.html">
                <div class="topbar_item">
                    <div class="topbar_text">咯咕</div>
                </div>
            </a>
        </div>
        
    </div>
    <div class="leftbar" onmousemove="leftbar_hover()" onmouseleave="leftbar_not_hover()"></div>
    <br>
`);
if (localStorage.getItem('name') != null)
    document.getElementById('mainbar').innerHTML += `
    <div class="topbar_item" style="width: auto; position: fixed; top: 0px; right: 0px;">
        <div class="topbar_item" style="width: auto;">
            <a href="/gogu/prikey.html">
                <div class="topbar_text">查看我的 priKey</div>
            </a>
        </div>
        <div class="topbar_item" style="width: auto;">
            <a href="javascript:sign_out()">
                <div class="topbar_text" style="color: red;">登出</div>
            </a>
        </div>
    </div>
    `;
leftbar_not_hover();
/*if (localStorage.getItem("theme") == 'light') document.write(`<link rel="stylesheet" href="/gogu/css/style_light.css">`);
else if (localStorage.getItem("theme") == 'color') document.write(`<link rel="stylesheet" href="/gogu/css/style_color.css">`);
else document.write(`<link rel="stylesheet" href="/gogu/css/style_dark.css">`);*/

document.write(`<link rel="stylesheet" href="/gogu/css/style_light.css">`);