const md = window.markdownit();
md.use(window.texmath.use(window.katex), {
    engine: window.katex,
    delimiters: 'dollars',
    katexOptions: {macros: {"\\RR": "\\mathbb{R}"}}
});

if (localStorage.getItem("name") == null) window.location.replace("/gogu/signup.html");

document.getElementById('upload').addEventListener('change', function () {
    var file = this.files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener('load', async function () {
            var dataURL = this.result;
            var svgCode = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><image xlink:href="' + dataURL + '"/></svg>';
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
                        }
                    ]);
                if (error) {
                    alert('错误：' + error.message);
                } else {
                    alert('上传成功');
                    document.getElementById("svg-src").href="/gogu/view-image.html?id=" + messageId;
                }
            } catch (error) {
                alert('错误：' + error.message);
            }
        });
    }
});