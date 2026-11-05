function normalizePath(p) { try { p = decodeURIComponent(p); } catch (_) {} return p.replace(/index\.html$/, "").replace(/\/$/, "") || "/"; }
var baseurl = document.querySelector('meta[name="baseurl"]').content;

document.addEventListener('DOMContentLoaded', function(){
    // Init theme
    let currentTheme = localStorage.getItem('theme') || 'dark';
    let isDarkMode = false;

    if (currentTheme === 'dark'){
        isDarkMode = true;
        const themeIcons = document.querySelectorAll(".ico-dark, .ico-light");

        themeIcons.forEach((ico) => {
            ico.classList.add('active');
        });
    }
    else {
        isDarkMode = false;
    }

    // navigation (mobile)
    var siteNav = document.querySelector('#navigation');
    var siteContact = document.querySelector('#contact');
    var menuButton = document.querySelector("#btn-nav");

    menuButton.addEventListener('click', function() {
        if (menuButton.classList.toggle('nav-open')) {
            siteNav.classList.add('nav-open');
            siteContact.classList.add('contact-open');
        } else {
            siteNav.classList.remove('nav-open');
            siteContact.classList.remove('contact-open');
        }
    });

    document.querySelectorAll('[data-category-toggle]').forEach(link => {
        const item = link.closest('li');
        if (normalizePath(location.pathname).startsWith(normalizePath(link.getAttribute('href')))) item.classList.add('active');
        link.setAttribute('aria-expanded', item.classList.contains('active'));
        link.addEventListener('click', event => { event.preventDefault(); const open = item.classList.toggle('active'); link.setAttribute('aria-expanded', open); const button = item.querySelector('.nav-list-expander'); if (button) button.setAttribute('aria-pressed', open); });
    });
    // Match destinations by URL, independently of display labels.
    const currentPath = normalizePath(location.pathname);
    document.querySelectorAll('#navigation .nav-list-link').forEach(link => {
        const destination = normalizePath(link.getAttribute('href'));
        const matches = destination === currentPath ||
            (!destination.endsWith('.html') && destination !== '/' && currentPath.startsWith(destination + '/'));
        if (!matches) return;
        if (!link.hasAttribute('data-category-toggle')) {
            link.parentElement.classList.add('selected');
            if (destination === currentPath) link.setAttribute('aria-current', 'page');
        }
        let parent = link.closest('li');
        while (parent) {
            if (parent.querySelector(':scope > .nav-list')) parent.classList.add('active');
            parent = parent.parentElement.closest('li');
        }
    });

    // navigation (toogle sub-category)
    document.addEventListener('click', function(e){
        var target = e.target;

        while (target && !(target.classList && target.classList.contains('nav-list-expander'))) {
            target = target.parentNode;
        }

        if (target) {
            e.preventDefault();
            var nav_item = target.parentNode;
            const open = nav_item.parentNode.classList.toggle('active');
            target.setAttribute('aria-pressed', open);
            const link = nav_item.querySelector('[data-category-toggle]');
            if (link) link.setAttribute('aria-expanded', open);
        }
    });

    // Change Datk/Light Theme
    const themeButton = document.querySelectorAll(".btn-brightness");
    const innerContent = document.querySelector('main');

    themeButton.forEach((btn) => {
        btn.addEventListener('click', function() {
            const moonIcons = document.querySelectorAll(".ico-dark");
            const sunIcons = document.querySelectorAll(".ico-light");
            const codeblocks = innerContent != null ? innerContent.querySelectorAll('pre') : null;

            moonIcons.forEach((ico) => {
                ico.classList.toggle('active');
            });

            sunIcons.forEach((ico) => {
                ico.classList.toggle('active');
            });

            document.body.classList.toggle('dark-theme');

            if (isDarkMode){
                localStorage.setItem('theme', 'default');
                // Disable highlighter dark color theme
                if (codeblocks) {
                    Array.from(codeblocks).forEach(function (codeblock){
                        codeblock.classList.remove('pre-dark');
                    });
                }

                changeGiscusTheme('light');
                isDarkMode = false;
            }
            else {
                localStorage.setItem('theme', 'dark');
                // Disable highlighter default color theme
                if (codeblocks) {
                    Array.from(codeblocks).forEach(function (codeblock){
                        codeblock.classList.add('pre-dark');
                    });
                }

                changeGiscusTheme('noborder_gray');
                isDarkMode = true;
            }
        });
    });

    function changeGiscusTheme(theme) {
        const iframe = document.querySelector('iframe.giscus-frame');
        if (!iframe) return;

        const message = {
            setConfig: {
                theme: theme
            }
        };

        iframe.contentWindow.postMessage({ giscus: message }, 'https://giscus.app');
    }

    // Expandable toolbar search uses the existing results interface.
    document.querySelectorAll('.toolbar-search').forEach(form => {
        const input = form.querySelector('input');
        form.addEventListener('submit', event => {
            event.preventDefault();
            if (!input.value.trim()) { input.focus(); return; }
            const search = document.getElementById('search');
            const target = document.getElementById('search-input');
            search.classList.add('active');
            target.value = input.value.trim();
            target.dispatchEvent(new KeyboardEvent('keyup', { bubbles:true }));
            target.focus();
        });
        input.addEventListener('keydown', event => {
            if (event.key === 'Escape') { input.value = ''; input.blur(); }
        });
    });

    // search box
    const searchButton = document.querySelectorAll(".btn-search");
    const cancelButton = document.querySelector('#btn-clear');
    const searchPage = document.querySelector("#search");

    if (searchButton) {
        searchButton.forEach((btn) => {
            btn.addEventListener('click', function() {
                searchPage.classList.add('active');
                document.getElementById("search-input").focus();
            });
        });
    }

    if (searchPage) {
        searchPage.addEventListener('click', function(event) {
            const searchBar = document.querySelector(".search-box");
            var target = event.target;

            if (searchBar.contains(target))
                return;

            searchPage.classList.remove('active');
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            document.getElementById('btn-clear').style.display = 'none';
            document.getElementById('search-input').value = "";

            Array.from(document.querySelectorAll('.result-item')).forEach(function (item) {
                item.remove();
            });
        });
    }
});

function searchPost(pages){
    document.getElementById('search-input').addEventListener('keyup', function() {
        var keyword = this.value.toLowerCase();
        var matchedPosts = [];
        const searchResults = document.getElementById('search-result');
        const prevResults = document.querySelector(".result-item");
    
        if (keyword.length > 0) {
            searchResults.style.display = 'block';
            document.getElementById('btn-clear').style.display = 'block';
        } else {
            searchResults.style.display = 'none';
            document.getElementById('btn-clear').style.display = 'none';
        }
        
        Array.from(document.querySelectorAll('.result-item')).forEach(function (item) {
            item.remove();
        });
    
        for (var i = 0; i < pages.length; i++) {
            var post = pages[i];
    
            if (post.title === 'Home' && post.type == 'category') continue;
    
            if (post.title.toLowerCase().indexOf(keyword) >= 0
            || post.path.toLowerCase().indexOf(keyword) >= 0
            || post.tags.toLowerCase().indexOf(keyword) >= 0){
                matchedPosts.push(post);
            }
        }
    
        if (matchedPosts.length === 0) {
            insertItem('<span class="description">There is no search result.</span>');

            return;
        } 
    
        matchedPosts.sort(function (a, b) {
            if (a.type == 'category') return 1;
    
            return -1;
        });
    
        for (var i = 0; i < matchedPosts.length; i++) {
            var highlighted_path = highlightKeyword(matchedPosts[i].path, keyword);
    
            if (highlighted_path === '')
                highlighted_path = "Home";
    
            if (matchedPosts[i].type === 'post'){
                var highlighted_title = highlightKeyword(matchedPosts[i].title, keyword);
                var highlighted_tags = highlightKeyword(matchedPosts[i].tags, keyword);
    
                if (highlighted_tags === '')
                    highlighted_tags = "none";

                insertItem('<a href="' +
                    matchedPosts[i].url +
                    '"><table><thead><tr><th><svg class="ico-book"></svg></th><th>' + highlighted_title +  
                    '</th></tr></thead><tbody><tr><td><svg class="ico-folder"></svg></td><td>' + highlighted_path +
                    '</td></tr><tr><td><svg class="ico-tags"></svg></td><td>' + highlighted_tags +
                    '</td></tr><tr><td><svg class="ico-calendar"></svg></td><td>' + matchedPosts[i].date +
                    '</td></tr></tbody></table></a>'
                );
            }
            else {
                insertItem('<a href="' +
                    matchedPosts[i].url +
                    '"><table><thead><tr><th><svg class="ico-folder"></svg></th><th>' + highlighted_path + 
                    '</th></tr></thead></table></a>'
                );
            }
        }

        function insertItem(inner_html){
            let contents = document.createElement("li");
            contents.classList.add("result-item");
            contents.innerHTML = inner_html;
            searchResults.append(contents);
        }
    });

    function highlightKeyword(txt, keyword) {
        var index = txt.toLowerCase().lastIndexOf(keyword);
    
        if (index >= 0) { 
            out = txt.substring(0, index) + 
                "<span class='highlight'>" + 
                txt.substring(index, index+keyword.length) + 
                "</span>" + 
                txt.substring(index + keyword.length);
            return out;
        }
    
        return txt;
    }
}
