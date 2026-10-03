(function(){
    var t = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'light' ? '#faf7f2' : '#0d1117');
})();
