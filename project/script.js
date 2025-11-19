// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav');
const header = document.querySelector('.header');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    
    // Animate hamburger menu
    const spans = menuToggle.querySelectorAll('span');
    if (nav.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'rotate(0) translate(0, 0)';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'rotate(0) translate(0, 0)';
    }
});

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'rotate(0) translate(0, 0)';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'rotate(0) translate(0, 0)';
    });
});

// Header scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Smooth Scrolling Function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const sectionTop = section.offsetTop - headerHeight;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

// Menu Filter Functionality
const menuFilter = document.getElementById('menu-filter');
const menuItems = document.querySelectorAll('.menu-item');

menuFilter.addEventListener('change', (e) => {
    const filterValue = e.target.value;
    
    menuItems.forEach(item => {
        const itemType = item.getAttribute('data-type');
        
        if (filterValue === 'all' || itemType === filterValue) {
            item.classList.remove('hidden');
            // Add fade-in animation
            item.style.animation = 'fadeIn 0.5s ease-in-out';
        } else {
            item.classList.add('hidden');
        }
    });
});

// Contact Form Validation
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Clear previous messages
    formMessage.style.display = 'none';
    formMessage.className = 'form-message';
    
    // Validation
    if (!name || !email || !message) {
        showFormMessage('Please fill all fields.', 'error');
        return;
    }
    
    if (!emailRegex.test(email)) {
        showFormMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    // Simulate form submission (replace with actual form submission logic)
    showFormMessage('Message sent!', 'success');
    
    // Reset form
    contactForm.reset();
});

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
    
    // Hide message after 3 seconds
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 3000);
}

// Add scroll effect to header - removed duplicate
// Modern scroll reveal animations with Intersection Observer
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll reveal
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .menu-item, .about-content, .contact-content');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        fadeInObserver.observe(el);
    });
});

// Enhanced add-to-order button functionality with ripple effect
document.querySelectorAll('.menu-item .btn-small').forEach(button => {
    button.addEventListener('click', (e) => {
        const menuItem = e.target.closest('.menu-item');
        const itemName = menuItem.querySelector('.menu-item-name').textContent;
        const itemPrice = menuItem.querySelector('.menu-item-price').textContent;
        
        // Enhanced visual feedback with success state
        const originalText = button.textContent;
        const originalBg = button.style.background;
        
        button.textContent = '✓ Added!';
        button.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = originalBg;
            button.style.transform = 'scale(1)';
        }, 1500);
        
        // TODO: Add actual cart functionality
        console.log(`Added ${itemName} (${itemPrice}) to order`);
    });
});

// Modern page load animation
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
    
    // Add smooth parallax effect to hero background
    const heroParallax = () => {
        const hero = document.querySelector('.hero-bg');
        if (hero) {
            const scrolled = window.pageYOffset;
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    };
    
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                heroParallax();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});