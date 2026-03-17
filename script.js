// Mobile Menu Toggle with improved accessibility
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        const isExpanded = navMenu.classList.contains('active');
        navMenu.classList.toggle('active');
        mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        mobileMenuBtn.innerHTML = !isExpanded 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });
    
    // Close menu when clicking a link
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            mobileMenuBtn.focus();
        }
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
        // Add validation on blur and input
        this.inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                this.validateField(input);
                if (input.tagName === 'TEXTAREA') {
                    this.updateCharCount(input);
                }
            });
        });
        
        // Add character counter for textareas
        this.form.querySelectorAll('textarea').forEach(textarea => {
            if (!textarea.parentNode.querySelector('.char-counter')) {
                const counter = document.createElement('div');
                counter.className = 'char-counter';
                textarea.parentNode.appendChild(counter);
                this.updateCharCount(textarea);
            }
        });
        
        // Handle form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';
        
        // Remove existing validation message
        const existingMessage = field.parentNode.querySelector('.validation-message');
        if (existingMessage) existingMessage.remove();
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'This field is required';
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }
        
        // Phone validation (international format)
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                isValid = false;
                message = 'Please enter a valid phone number';
            }
        }
        
        // Date validation
        if (field.type === 'date') {
            if (value) {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (field.id === 'departureDate' && selectedDate < today) {
                    isValid = false;
                    message = 'Departure date cannot be in the past';
                }
                
                // Check return date is after departure date
                if (field.id === 'returnDate' && value) {
                    const departureDate = document.getElementById('departureDate');
                    if (departureDate && departureDate.value) {
                        const returnDate = new Date(value);
                        const depDate = new Date(departureDate.value);
                        if (returnDate <= depDate) {
                            isValid = false;
                            message = 'Return date must be after departure date';
                        }
                    }
                }
            } else if (field.hasAttribute('required')) {
                isValid = false;
                message = 'Please select a date';
            }
        }
        
        // Update field classes
        field.classList.remove('valid', 'error');
        if (value) {
            if (isValid) {
                field.classList.add('valid');
            } else {
                field.classList.add('error');
                
                // Add validation message
                const messageEl = document.createElement('div');
                messageEl.className = 'validation-message show';
                messageEl.setAttribute('role', 'alert');
                messageEl.textContent = message;
                field.parentNode.appendChild(messageEl);
            }
        }
        
        return isValid;
    }
    
    updateCharCount(textarea) {
        const counter = textarea.parentNode.querySelector('.char-counter');
        if (!counter) return;
        
        const maxLength = textarea.getAttribute('maxlength') || 500;
        const currentLength = textarea.value.length;
        const remaining = maxLength - currentLength;
        
        counter.textContent = `${currentLength}/${maxLength} characters`;
        counter.classList.remove('warning', 'danger');
        
        if (remaining < 50) {
            counter.classList.add('warning');
        }
        if (remaining < 10) {
            counter.classList.add('danger');
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        let isFormValid = true;
        this.inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            this.showMessage('Please fix the errors in the form', 'error');
            
            // Scroll to first error
            const firstError = this.form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }
        
        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
        submitBtn.disabled = true;
        
        try {
            // Get form data
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            
            // Simulate API call (replace with actual fetch)
            await this.submitForm(data);
            
            this.showMessage('Thank you! Your request has been submitted successfully. We will contact you within 24 hours.', 'success');
            this.form.reset();
            
            // Reset validation classes
            this.inputs.forEach(input => {
                input.classList.remove('valid', 'error');
            });
            
            // Remove character counters
            this.form.querySelectorAll('.char-counter').forEach(counter => {
                counter.textContent = '';
            });
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('An error occurred. Please try again or call us directly at +234 901 876 5432.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    async submitForm(data) {
        // Replace this with your actual API endpoint
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success (replace with actual fetch)
                resolve({ success: true });
                
                // For actual implementation:
                /*
                fetch('https://your-api-endpoint.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => resolve(data))
                .catch(error => reject(error));
                */
            }, 2000);
        });
    }
    
    showMessage(text, type) {
        // Remove any existing messages
        const existingMessage = this.form.querySelector('.success-message, .error-message');
        if (existingMessage) existingMessage.remove();
        
        const messageEl = document.createElement('div');
        messageEl.className = type === 'success' ? 'success-message' : 'error-message';
        messageEl.setAttribute('role', 'alert');
        messageEl.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${text}`;
        
        this.form.insertBefore(messageEl, this.form.firstChild);
        
        // Auto-hide success message after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageEl.remove();
            }, 5000);
        }
    }
}

// Email protection function
function protectEmail() {
    document.querySelectorAll('.email-protect').forEach(el => {
        const user = el.dataset.user;
        const domain = el.dataset.domain;
        if (user && domain) {
            const email = `${user}@${domain}`;
            el.innerHTML = `<a href="mailto:${email}">${email}</a>`;
        }
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form validators
    new FormValidator('bookingForm');
    new FormValidator('contactForm');
    new FormValidator('newsletterForm');
    
    // Protect email addresses
    protectEmail();
    
    // Package booking buttons
    document.querySelectorAll('.package-book-btn').forEach(button => {
        button.addEventListener('click', function() {
            const packageName = this.getAttribute('data-package');
            const packagePrice = this.getAttribute('data-price');
            
            // Check if sessionStorage is available
            if (window.sessionStorage) {
                try {
                    sessionStorage.setItem('selectedPackage', packageName);
                    sessionStorage.setItem('selectedPrice', packagePrice);
                } catch (e) {
                    console.warn('SessionStorage not available:', e);
                }
            }
            
            // Show loading effect
            this.innerHTML = '<span class="spinner"></span> Redirecting...';
            this.disabled = true;
            
            setTimeout(() => {
                window.location.href = 'booking.html';
            }, 500);
        });
    });
    
    // Initialize package selection on booking page
    const packageSelect = document.getElementById('package');
    if (packageSelect && window.sessionStorage) {
        try {
            const selectedPackage = sessionStorage.getItem('selectedPackage');
            
            if (selectedPackage) {
                for (let option of packageSelect.options) {
                    if (option.text.includes(selectedPackage)) {
                        option.selected = true;
                        option.dispatchEvent(new Event('blur'));
                        break;
                    }
                }
                sessionStorage.removeItem('selectedPackage');
                sessionStorage.removeItem('selectedPrice');
            }
        } catch (e) {
            console.warn('Error accessing sessionStorage:', e);
        }
    }
    
    // Scroll animations with Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
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
    
    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.closest('.faq-item');
            const isActive = faqItem.classList.contains('active');
            
            // Optional: Close all other FAQs
            // document.querySelectorAll('.faq-item').forEach(item => {
            //     item.classList.remove('active');
            // });
            
            // Toggle current FAQ
            faqItem.classList.toggle('active');
            
            // Update ARIA attributes
            const expanded = faqItem.classList.contains('active');
            button.setAttribute('aria-expanded', expanded);
        });
        
        // Initialize ARIA attributes
        button.setAttribute('aria-expanded', 'false');
    });
    
    // Set active navigation based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Lazy load images
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.loading = 'lazy';
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }
});

// Newsletter Form Handling
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = this.querySelector('#newsletterEmail').value;
        const consent = this.querySelector('#newsletterConsent').checked;
        
        if (!consent) {
            alert('Please agree to receive newsletters');
            return;
        }
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner"></span> Subscribing...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.setAttribute('role', 'status');
            successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Successfully subscribed! Check your email for confirmation.';
            
            const existingMsg = this.querySelector('.success-message, .error-message');
            if (existingMsg) existingMsg.remove();
            
            this.appendChild(successMsg);
            this.reset();
            
            setTimeout(() => successMsg.remove(), 5000);
            
        } catch (error) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.setAttribute('role', 'alert');
            errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Subscription failed. Please try again.';
            
            const existingMsg = this.querySelector('.success-message, .error-message');
            if (existingMsg) existingMsg.remove();
            
            this.appendChild(errorMsg);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Search functionality for 404 page
function searchWebsite() {
    const query = document.getElementById('searchInput')?.value;
    if (query) {
        // Redirect to search results page or show message
        alert(`Search functionality coming soon! For now, please use our navigation menu or contact us directly to find information about "${query}".`);
    }
}

// Handle video loading errors
const heroVideo = document.getElementById('heroVideo');
if (heroVideo) {
    heroVideo.addEventListener('error', function() {
        console.warn('Video failed to load, using fallback image');
        this.style.display = 'none';
    });
}

// Service worker registration for offline capability (optional)
if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.warn('Service worker registration failed:', error);
        });
    });
}

// Add skip link for accessibility
const skipLink = document.createElement('a');
skipLink.href = '#main-content';
skipLink.className = 'skip-link';
skipLink.textContent = 'Skip to main content';
document.body.insertBefore(skipLink, document.body.firstChild);