document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menü işlevselliği
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Menü linklerine tıklandığında menüyü kapat
    document.querySelectorAll('.nav-menu li a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Scroll olduğunda navbar'ı şeffaflaştır
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        } else {
            navbar.style.backgroundColor = 'var(--white)';
        }
    });

    // Blog post'larına hover efekti
    const posts = document.querySelectorAll('.post');
    posts.forEach(post => {
        post.addEventListener('mouseenter', () => {
            post.style.transform = 'translateY(-5px)';
            post.style.transition = 'transform 0.3s ease';
        });

        post.addEventListener('mouseleave', () => {
            post.style.transform = 'translateY(0)';
        });
    });

    // İletişim formu gönderimi
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Form verilerini alın
            const formData = new FormData(contactForm);
            const formObject = Object.fromEntries(formData);
            
            // Burada form verilerini işleyebilir veya bir API'ye gönderebilirsiniz
            console.log('Form verileri:', formObject);
            
            // Formu sıfırlayın ve kullanıcıya bilgi verin
            contactForm.reset();
            alert('Mesajınız gönderildi! En kısa sürede size dönüş yapılacaktır.');
        });
    }

    // Blog sayfasında tekil post yükleme
    if (window.location.pathname.includes('blog.html')) {
        loadSinglePost();
    }
    // Ana sayfada blog listesi yükleme
    else if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        loadBlogPosts();
    }
});

async function loadBlogPosts() {
    try {
        const posts = [
            'web-gelistirme-yolculugum',
            'yazilim-muhendisligi-egitimim'
        ];

        const blogContainer = document.querySelector('.blog-posts');
        if (!blogContainer) return;

        for (const postId of posts) {
            const response = await fetch(`posts/${postId}.md`);
            const markdown = await response.text();
            
            // Markdown meta verilerini ayır
            const [, frontMatter, content] = markdown.split('---');
            const meta = parseFrontMatter(frontMatter);

            const postElement = createPostElement(meta, content);
            blogContainer.appendChild(postElement);
        }
    } catch (error) {
        console.error('Blog posts yüklenirken hata:', error);
    }
}

function parseFrontMatter(frontMatter) {
    const meta = {};
    const lines = frontMatter.trim().split('\n');
    
    for (const line of lines) {
        const [key, ...value] = line.split(':');
        if (key && value) {
            meta[key.trim()] = value.join(':').trim();
        }
    }
    
    return meta;
}

function createPostElement(meta, content) {
    const article = document.createElement('article');
    article.className = 'post';
    
    article.innerHTML = `
        <img src="${meta.image}" alt="${meta.title}">
        <h2>${meta.title}</h2>
        <div class="post-meta">
            <span><i class="far fa-calendar"></i> ${meta.date}</span>
            <span><i class="far fa-user"></i> ${meta.author}</span>
        </div>
        <p>${meta.excerpt}</p>
        <a href="blog.html?post=${encodeURIComponent(meta.title.toLowerCase().replace(/ /g, '-'))}" class="read-more">
            Devamını Oku
        </a>
    `;
    
    return article;
}

async function loadSinglePost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    
    if (!postId) {
        console.log('Post ID bulunamadı');
        return;
    }

    try {
        console.log('Yüklenen post:', postId);
        const response = await fetch(`posts/${postId}.md`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const markdown = await response.text();
        console.log('Markdown içeriği:', markdown);
        
        if (!markdown.includes('---')) {
            throw new Error('Geçersiz markdown formatı');
        }
        
        const [, frontMatter, content] = markdown.split('---');
        
        if (!frontMatter || !content) {
            throw new Error('Markdown meta verileri veya içerik bulunamadı');
        }
        
        const meta = parseFrontMatter(frontMatter);
        const postContent = marked.parse(content);
        
        const postContainer = document.querySelector('.blog-content');
        if (postContainer) {
            postContainer.innerHTML = `
                <article class="post full-post">
                    <img src="${meta.image}" alt="${meta.title}">
                    <h1>${meta.title}</h1>
                    <div class="post-meta">
                        <span><i class="far fa-calendar"></i> ${meta.date}</span>
                        <span><i class="far fa-user"></i> ${meta.author}</span>
                    </div>
                    <div class="post-content">
                        ${postContent}
                    </div>
                </article>
            `;
        }
    } catch (error) {
        console.error('Blog post yüklenirken hata:', error);
        const postContainer = document.querySelector('.blog-content');
        if (postContainer) {
            postContainer.innerHTML = `
                <div class="error-message">
                    <h2>Blog yazısı yüklenemedi</h2>
                    <p>Hata detayı: ${error.message}</p>
                    <p>Lütfen daha sonra tekrar deneyin.</p>
                </div>
            `;
        }
    }
}
