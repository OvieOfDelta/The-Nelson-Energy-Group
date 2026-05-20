        // Mobile menu toggle
        function toggleMenu() {
            const nav = document.getElementById('mainNav');
            nav.classList.toggle('active');
        }

        function closeMenu() {
            const nav = document.getElementById('mainNav');
            nav.classList.remove('active');
        }

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const nav = document.getElementById('mainNav');
            const toggle = document.querySelector('.menu-toggle');
            
            if (!nav.contains(event.target) && !toggle.contains(event.target)) {
                nav.classList.remove('active');
            }
        });

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Form submission
        function handleSubmit(event) {
            event.preventDefault();
            
            // Show success message
            document.getElementById('successMessage').style.display = 'block';
            
            // Reset form
            document.getElementById('contactForm').reset();
            
            // Scroll to success message
            document.getElementById('successMessage').scrollIntoView({ behavior: 'smooth' });
            
            // Hide message after 5 seconds
            setTimeout(() => {
                document.getElementById('successMessage').style.display = 'none';
            }, 5000);
            
            return false;
        }

        // Carousel functionality
        let currentSlide = 0;
        const slides = document.querySelectorAll('.carousel-slide');
        const dots = document.querySelectorAll('.carousel-dot');

        function showSlide(index) {
            // Wrap around if out of bounds
            if (index >= slides.length) {
                currentSlide = 0;
            } else if (index < 0) {
                currentSlide = slides.length - 1;
            } else {
                currentSlide = index;
            }

            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });

            // Remove active from all dots
            dots.forEach(dot => {
                dot.classList.remove('active');
            });

            // Show current slide
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }

        function changeSlide(direction) {
            showSlide(currentSlide + direction);
        }

        function goToSlide(index) {
            showSlide(index);
        }

        // Auto-advance carousel every 5 seconds
        let autoSlideInterval = setInterval(() => {
            changeSlide(1);
        }, 5000);

        // Pause auto-advance on hover
        const carouselContainer = document.querySelector('.carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => {
                clearInterval(autoSlideInterval);
            });

            carouselContainer.addEventListener('mouseleave', () => {
                autoSlideInterval = setInterval(() => {
                    changeSlide(1);
                }, 5000);
            });
        }

        // ── Newsletter Popup ──────────────────────────────────────────
        // ⚙️  Replace these two values with your real Brevo credentials:
        const BREVO_API_KEY  = 'YOUR_BREVO_API_KEY_HERE';  // from Brevo → Account → API Keys
        const BREVO_LIST_ID  = 0;                           // your Brevo list ID (integer)

        function openNewsletter() {
            document.getElementById('newsletterOverlay').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeNewsletter() {
            document.getElementById('newsletterOverlay').classList.remove('active');
            document.body.style.overflow = '';
            // Remember the user dismissed it — don't show again this session
            sessionStorage.setItem('newsletterDismissed', 'true');
        }

        function closeNewsletterOnOverlay(event) {
            if (event.target === document.getElementById('newsletterOverlay')) {
                closeNewsletter();
            }
        }

        // Show popup after 5 seconds, unless already subscribed or dismissed
        window.addEventListener('load', function () {
            const alreadySubscribed = localStorage.getItem('newsletterSubscribed');
            const dismissed         = sessionStorage.getItem('newsletterDismissed');

            if (!alreadySubscribed && !dismissed) {
                setTimeout(openNewsletter, 5000);
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeNewsletter();
        });

        async function handleNewsletterSubmit(event) {
            event.preventDefault();

            const name      = document.getElementById('newsletterName').value.trim();
            const email     = document.getElementById('newsletterEmail').value.trim();
            const btn       = document.getElementById('newsletterSubmitBtn');
            const btnText   = document.getElementById('newsletterBtnText');
            const btnLoader = document.getElementById('newsletterBtnLoader');
            const success   = document.getElementById('newsletterSuccess');
            const error     = document.getElementById('newsletterError');

            // Reset messages
            success.style.display = 'none';
            error.style.display   = 'none';

            // Loading state
            btn.disabled        = true;
            btnText.style.display  = 'none';
            btnLoader.style.display = 'inline';

            try {
                const response = await fetch('https://api.brevo.com/v3/contacts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': BREVO_API_KEY
                    },
                    body: JSON.stringify({
                        email: email,
                        attributes: { FIRSTNAME: name },
                        listIds: [BREVO_LIST_ID],
                        updateEnabled: true   // update contact if email already exists
                    })
                });

                if (response.ok || response.status === 204) {
                    // Success
                    success.style.display = 'block';
                    document.getElementById('newsletterForm').reset();
                    localStorage.setItem('newsletterSubscribed', 'true');

                    // Auto-close popup after 3 seconds
                    setTimeout(() => {
                        document.getElementById('newsletterOverlay').classList.remove('active');
                        document.body.style.overflow = '';
                    }, 3000);
                } else {
                    const data = await response.json();
                    // Brevo returns 400 if contact already exists in the list
                    if (response.status === 400 && data.code === 'duplicate_parameter') {
                        success.style.display = 'block';
                        success.textContent   = '✅ You\'re already subscribed — we\'ll keep you posted!';
                        localStorage.setItem('newsletterSubscribed', 'true');
                        setTimeout(() => {
                            document.getElementById('newsletterOverlay').classList.remove('active');
                            document.body.style.overflow = '';
                        }, 3000);
                    } else {
                        error.style.display = 'block';
                    }
                }
            } catch (err) {
                error.style.display = 'block';
            } finally {
                btn.disabled           = false;
                btnText.style.display  = 'inline';
                btnLoader.style.display = 'none';
            }
        }
    