// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuBtn.innerHTML = navMenu.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });
    
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
}

// Form Validation Class
class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;
        this.inputs = this.form.querySelectorAll('input, select, textarea');
        this.init();
    }
    
    init() {
        this.inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.validateField(input));
        });
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';
        
        const existingMessage = field.parentNode.querySelector('.validation-message');
        if (existingMessage) existingMessage.remove();
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'This field is required';
        }
        
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Enter a valid email address';
            }
        }
        
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                isValid = false;
                message = 'Enter a valid phone number';
            }
        }
        
        field.classList.remove('valid', 'error');
        if (value && isValid) {
            field.classList.add('valid');
        } else if (!isValid) {
            field.classList.add('error');
            const messageEl = document.createElement('div');
            messageEl.className = 'validation-message show';
            messageEl.textContent = message;
            field.parentNode.appendChild(messageEl);
        }
        
        return isValid;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        let isFormValid = true;
        this.inputs.forEach(input => {
            if (!this.validateField(input)) isFormValid = false;
        });
        
        if (!isFormValid) {
            alert('Please fix the errors in the form');
            return;
        }
        
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
        submitBtn.disabled = true;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert('Thank you! Your request has been submitted. We will contact you within 24 hours.');
            this.form.reset();
            this.inputs.forEach(input => input.classList.remove('valid', 'error'));
        } catch (error) {
            alert('An error occurred. Please call us at +234 901 876 5432');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

// Package Booking Buttons
document.querySelectorAll('.package-book-btn').forEach(button => {
    button.addEventListener('click', function() {
        const packageName = this.getAttribute('data-package');
        const packagePrice = this.getAttribute('data-price');
        
        if (sessionStorage) {
            sessionStorage.setItem('selectedPackage', packageName);
            sessionStorage.setItem('selectedPrice', packagePrice);
        }
        
        this.innerHTML = '<span class="spinner"></span> Redirecting...';
        this.disabled = true;
        
        setTimeout(() => {
            window.location.href = 'booking.html';
        }, 500);
    });
});

// Load selected package on booking page
const packageSelect = document.getElementById('package');
if (packageSelect && sessionStorage) {
    const selectedPackage = sessionStorage.getItem('selectedPackage');
    if (selectedPackage) {
        for (let option of packageSelect.options) {
            if (option.text.includes(selectedPackage)) {
                option.selected = true;
                break;
            }
        }
        sessionStorage.removeItem('selectedPackage');
        sessionStorage.removeItem('selectedPrice');
    }
}

// Newsletter Form
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = this.querySelector('#newsletterEmail').value;
        if (!email) {
            alert('Please enter your email address');
            return;
        }
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner"></span> Subscribing...';
        submitBtn.disabled = true;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Successfully subscribed! Check your email for updates.');
            this.reset();
        } catch (error) {
            alert('Subscription failed. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.closest('.faq-item');
        faqItem.classList.toggle('active');
    });
});

// Scroll Animations
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.highlight-card, .service-card, .package-card, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

// Set active navigation
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
        link.classList.add('active');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Initialize forms
document.addEventListener('DOMContentLoaded', () => {
    new FormValidator('bookingForm');
    new FormValidator('contactForm');
});

// Spinner CSS
const style = document.createElement('style');
style.textContent = `
    .spinner {
        display: inline-block;
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 0.8s linear infinite;
        margin-right: 8px;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .validation-message {
        font-size: 12px;
        color: #ef4444;
        margin-top: 5px;
    }
`;
document.head.appendChild(style);
