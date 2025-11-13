const md = window.markdownit();
md.use(window.texmath.use(window.katex), {
    engine: window.katex,
    delimiters: 'dollars',
    katexOptions: {macros: {"\\RR": "\\mathbb{R}"}}
});

if (localStorage.getItem("name") == null) window.location.replace("/signup.html");

document.getElementById('upload').addEventListener('change', function () {
    var file = this.files[0];
    if (file) {
        document.getElementById("container").innerHTML += `<p id="uploading">上传中...</p>`;
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener('load', async function () {
            var dataURL = this.result;
            var svgCode = '<svg xmlns="http://www.w3.org/2000/svg" height="40px" width="40px" xmlns:xlink="http://www.w3.org/1999/xlink"><image xlink:href="' + dataURL + '" height="40px" width="40px"/></svg>';
            try {
                const supabase = getClient();
                const messageId = -Date.now();
                const messageInfo = svgCode;
                const {data, error} = await supabase
                    .from('images')
                    .insert([
                        {
                            id: messageId,
                            info: messageInfo
                        }]);
                if (error) {
                    alert('错误：' + error.message);
                } else {
                    alert('上传成功');
                    document.getElementById("uploading").innerHTML = `<a target="_blank" href="/view-image.html?id=${messageId}">链接</a>`;
                }
            } catch (error) {
                alert('错误：' + error.message);
            }
        });
    }
});