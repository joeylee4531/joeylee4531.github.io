document.addEventListener('DOMContentLoaded', function(){
    var innerContent = document.querySelector('main');
    let currentTheme = localStorage.getItem('theme') || 'dark';

    // tocbot
    var headings = innerContent.querySelectorAll('h1:not([data-toc-exclude]), h2:not([data-toc-exclude])');
    var prevHead;

    const tocBorad = document.querySelector(".toc-board");
    
    if (tocBorad) {
    Array.from(headings).forEach(function(heading){
        let tocItem = document.createElement("li");
        tocItem.classList.add("toc-list-item");

        let itemLink = document.createElement("a");
        itemLink.classList.add("toc-link");
        itemLink.id = "toc-id-" + heading.textContent;
        itemLink.textContent = heading.dataset.tocTitle || heading.textContent;

        tocItem.append(itemLink);

        itemLink.addEventListener('click', function(){
            if (heading.dataset.tocTop === 'true') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                heading.scrollIntoView({ behavior: 'smooth' });
            }
        });

        if (heading.tagName == 'H1'){
            itemLink.classList.add("node-name--H1");
            prevHead = tocItem;
            tocBorad.append(tocItem);
        }
        else {
            itemLink.classList.add("node-name--H2");

            if (prevHead == undefined) {
                tocBorad.append(tocItem);
                return;
            }

            let subList = prevHead.querySelector('ol');

            if (!subList){
                subList = document.createElement("ol");
                subList.classList.add("toc-list");
                prevHead.append(subList);
            }

            subList.append(tocItem);
        }
    });

    const tocLinks = Array.from(tocBorad.querySelectorAll('.toc-link'));
    let activeIndex = -1;
    let scrollFrame = null;

    function updateActiveSection() {
        scrollFrame = null;
        let nextIndex = 0;
        const page = document.scrollingElement;
        const remainingScroll = Math.max(0, page.scrollHeight - page.clientHeight - page.scrollTop);
        const bottomProgress = Math.max(0, 1 - remainingScroll / window.innerHeight);
        const readingLine = window.innerHeight * (0.2 + 0.8 * bottomProgress);

        for (let index = 0; index < headings.length; index++) {
            if (headings[index].getBoundingClientRect().top > readingLine) break;
            nextIndex = index;
        }



        if (nextIndex === activeIndex) return;
        if (activeIndex >= 0) {
            tocLinks[activeIndex].classList.remove('is-active-link');
            tocLinks[activeIndex].removeAttribute('aria-current');
        }
        tocLinks[nextIndex].classList.add('is-active-link');
        tocLinks[nextIndex].setAttribute('aria-current', 'location');
        activeIndex = nextIndex;

        const activeBounds = tocLinks[nextIndex].getBoundingClientRect();
        const boardBounds = tocBorad.getBoundingClientRect();
        if (tocBorad.clientHeight > 0 && tocBorad.scrollHeight > tocBorad.clientHeight) {
            if (activeBounds.top < boardBounds.top) {
                tocBorad.scrollTop += activeBounds.top - boardBounds.top;
            } else if (activeBounds.bottom > boardBounds.bottom) {
                tocBorad.scrollTop += activeBounds.bottom - boardBounds.bottom;
            }
        }
    }

    function scheduleActiveSectionUpdate() {
        if (scrollFrame === null) {
            scrollFrame = window.requestAnimationFrame(updateActiveSection);
        }
    }

    if (tocLinks.length > 0) {
        updateActiveSection();
        window.addEventListener('scroll', scheduleActiveSectionUpdate, { passive: true });
        window.addEventListener('resize', scheduleActiveSectionUpdate);
        window.addEventListener('load', scheduleActiveSectionUpdate);
    }

    }

    // link (for hover effect)
    var links = innerContent.querySelectorAll('a:not(.related-item a)');

    links.forEach((link) => {
        link.setAttribute('data-content', link.innerText);
    });

    // Tag EventListener
    const searchPage = document.querySelector("#search");

    document.querySelectorAll('.tag-box .tag').forEach(function(tagButton){
        tagButton.addEventListener('click', function() {
            const contentID = tagButton.getAttribute('contentID');
            const inpuxBox = document.getElementById('search-input');
            searchPage.classList.add('active');

            inpuxBox.value = contentID;
            inpuxBox.dispatchEvent(new KeyboardEvent('keyup'));
        });
    });

    // Move to Top
    if (document.querySelector('.thumbnail')){
        const arrowButton = document.querySelector('.top-arrow');

        setInterval(function(){
            var scrollPos = document.documentElement.scrollTop;
    
            if (scrollPos < 512){
                arrowButton.classList.remove('arrow-open');
            }
            else {
                arrowButton.classList.add('arrow-open');
            }
        }, 1000);

        arrowButton.addEventListener('click', function(){
            window.scroll({top:0, behavior:'smooth'});
        });
    }

    // Code highlighter
    if (currentTheme === 'dark'){
        // Disable highlighter default color theme
        Array.from(innerContent.querySelectorAll('pre')).forEach(function (codeblock){
            codeblock.classList.add('pre-dark');
        });
    }
});

window.addEventListener('load', function(){
    // Page Hits
    const pageHits = document.getElementById('page-hits');

    if (pageHits) {
        const goatcounterCode = pageHits.getAttribute('usercode');
        const requestURL = 'https://' 
            + goatcounterCode 
            + '.goatcounter.com/counter/' 
            + encodeURIComponent(location.pathname) 
            + '.json';

        var resp = new XMLHttpRequest();
        resp.open('GET', requestURL);
        resp.onerror = function() { pageHits.innerText = "0"; };
        resp.onload = function() { pageHits.innerText = JSON.parse(this.responseText).count; };
        resp.send();
    }

    // Highlighter
    hljs.highlightAll();

    // Disable code highlights to the plaintext codeblocks
    document.querySelectorAll('.language-text, .language-plaintext').forEach(function(codeblock){
        codeblock.querySelectorAll('.hljs-keyword, .hljs-meta, .hljs-selector-tag').forEach(function($){
            $.outerHTML = $.innerHTML;
        });
    });

    // code clipboard copy button
    async function copyCode(block) {
        let code = block.querySelector("code");
        let text = code.innerText;
      
        await navigator.clipboard.writeText(text);
    }

    let blocks = document.querySelectorAll("pre");

    blocks.forEach((block) => {
        // only add button if browser supports Clipboard API
        if (navigator.clipboard) {
            let clip_btn = document.createElement("button");
            let clip_img = document.createElement("svg");

            clip_btn.setAttribute('title', "Copy Code");
            clip_img.ariaHidden = true;

            block.appendChild(clip_btn);
            clip_btn.appendChild(clip_img);

            clip_btn.addEventListener("click", async () => {
                await copyCode(block, clip_btn);
            });
        }
    });

    // Giscus IMetadataMessage event handler
    function handleMessage(event) {
        if (event.origin !== 'https://giscus.app') return;
        if (!(typeof event.data === 'object' && event.data.giscus)) return;
        
        const giscusData = event.data.giscus;
        const commentCount = document.getElementById('num-comments');

        if (giscusData && giscusData.hasOwnProperty('discussion')) {
            commentCount.innerText = giscusData.discussion.totalCommentCount;
        }
        else {
            commentCount.innerText = '0';
        }
    }
        
    window.addEventListener('message', handleMessage);
});

