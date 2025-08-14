// Modern Tab Navigation System
document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Function to switch tabs
    function switchTab(targetTab) {
        // Remove active class from all buttons and contents
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
        const activeContent = document.getElementById(targetTab);
        
        if (activeButton && activeContent) {
            activeButton.classList.add('active');
            activeContent.classList.add('active');
            
            // Scroll to the top of the page smoothly
            window.scrollTo({ 
                top: 0, 
                behavior: 'smooth' 
            });
            
            // Update URL hash without scrolling
            history.pushState(null, null, `#${targetTab}`);
        }
    }
    
    // Add click event listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
    
    // Handle initial page load with hash
    function handleInitialHash() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            switchTab(hash);
        } else {
            // Default to about tab
            switchTab('about');
        }
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', handleInitialHash);
    
    // Initialize on page load
    handleInitialHash();
    
    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add loading animation for external links
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', function(e) {
            // Optional: Add loading state or analytics tracking
            console.log('External link clicked:', this.href);
        });
    });
    
    // Add keyboard navigation for tabs
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    switchTab('about');
                    break;
                case '2':
                    e.preventDefault();
                    switchTab('resume');
                    break;
                case '3':
                    e.preventDefault();
                    switchTab('portfolio');
                    break;
                case '4':
                    e.preventDefault();
                    switchTab('pong');
                    break;
            }
        }
    });
    
    // Add intersection observer for animations (optional enhancement)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    document.querySelectorAll('.portfolio-item, .experience-item, .skill-category').forEach(el => {
        observer.observe(el);
    });

    // Professional Mode Toggle
    const professionalModeBtn = document.getElementById('professionalModeBtn');
    const body = document.body;
    const pongTab = document.querySelector('[data-tab="pong"]');
    const pongContent = document.getElementById('pong');
    
    // Function to toggle professional mode elements
    function toggleProfessionalMode(isActive) {
        if (isActive) {
            // Hide pong tab and content
            if (pongTab) pongTab.style.display = 'none';
            if (pongContent) pongContent.style.display = 'none';
            
            // If currently on pong tab, switch to about tab
            const currentTab = document.querySelector('.tab-button.active');
            if (currentTab && currentTab.getAttribute('data-tab') === 'pong') {
                switchTab('about');
            }
        } else {
            // Show pong tab
            if (pongTab) pongTab.style.display = '';
            
            // Restore pong content display behavior
            if (pongContent) {
                // If pong tab is currently active, show the content
                if (pongContent.classList.contains('active')) {
                    pongContent.style.display = 'block';
                } else {
                    // Reset display style to default (will be controlled by CSS)
                    pongContent.style.display = '';
                }
            }
        }
    }
    
    // Check if professional mode is saved in localStorage
    const isProfessionalMode = localStorage.getItem('professionalMode') === 'true';
    
    if (isProfessionalMode) {
        body.classList.add('professional-mode');
        professionalModeBtn.classList.add('active');
        professionalModeBtn.innerHTML = '<i class="fas fa-briefcase"></i><span>Professional Mode</span>';
        toggleProfessionalMode(true);
    }
    
    // Toggle professional mode
    professionalModeBtn.addEventListener('click', function() {
        body.classList.toggle('professional-mode');
        const isActive = body.classList.contains('professional-mode');
        
        if (isActive) {
            professionalModeBtn.classList.add('active');
            professionalModeBtn.innerHTML = '<i class="fas fa-briefcase"></i><span>Professional Mode</span>';
            localStorage.setItem('professionalMode', 'true');
        } else {
            professionalModeBtn.classList.remove('active');
            professionalModeBtn.innerHTML = '<i class="fas fa-palette"></i><span>Creative Mode</span>';
            localStorage.setItem('professionalMode', 'false');
        }
        
        toggleProfessionalMode(isActive);
    });
});
