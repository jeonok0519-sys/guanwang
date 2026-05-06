document.addEventListener('DOMContentLoaded', function() {
    initCarousel();
    initMobileMenu();
    initCategoryFilter();
    initImageGallery();
    initPagination();
});

function initCarousel() {
    const banners = [
        {
            title: '给毛孩子最好的关爱',
            subtitle: '精选全球优质宠物用品，为爱宠提供健康舒适的生活体验',
            image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=cute%20pets%20with%20pet%20supplies%20warm%20lighting%20cozy%20atmosphere&image_size=landscape_4_3'
        },
        {
            title: '春季新品限时特惠',
            subtitle: '全场宠物用品低至5折起，限时抢购',
            image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=spring%20pet%20products%20promotion%20colorful%20fresh%20style&image_size=landscape_4_3'
        },
        {
            title: '宠物营养专家推荐',
            subtitle: '科学配比，营养均衡，让爱宠健康成长',
            image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=pet%20nutrition%20food%20premium%20quality%20healthy&image_size=landscape_4_3'
        }
    ];

    const bannerTitle = document.querySelector('.banner-title');
    const bannerSubtitle = document.querySelector('.banner-subtitle');
    const bannerImage = document.querySelector('.banner-image');
    const indicators = document.querySelectorAll('.carousel-indicator');
    let currentIndex = 0;

    function updateBanner(index) {
        if (bannerTitle) bannerTitle.textContent = banners[index].title;
        if (bannerSubtitle) bannerSubtitle.textContent = banners[index].subtitle;
        if (bannerImage) bannerImage.src = banners[index].image;
        
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentIndex = index;
            updateBanner(currentIndex);
        });
    });

    setInterval(() => {
        currentIndex = (currentIndex + 1) % banners.length;
        updateBanner(currentIndex);
    }, 5000);
}

function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });

        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        });
    }
}

function initCategoryFilter() {
    const categoryItems = document.querySelectorAll('.category-item');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function initImageGallery() {
    const thumbnails = document.querySelectorAll('.detail-image-thumb');
    const mainImage = document.querySelector('.detail-image-main');

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            thumbnails.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            if (mainImage) {
                mainImage.src = thumb.src;
            }
        });
    });
}

function initPagination() {
    const paginationItems = document.querySelectorAll('.pagination-item');
    
    paginationItems.forEach(item => {
        item.addEventListener('click', () => {
            paginationItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

document.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        }
    }
});