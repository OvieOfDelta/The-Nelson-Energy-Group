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

        // Carousel functionality
        let currentSlide = 0;
        const slides = document.querySelectorAll('.carousel-slide');
        const dots = document.querySelectorAll('.carousel-dot');

        function showSlide(index) {
            if (index >= slides.length) {
                currentSlide = 0;
            } else if (index < 0) {
                currentSlide = slides.length - 1;
            } else {
                currentSlide = index;
            }

            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));

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

        // ── Backend URL (used for newsletter only) ────────────────────────────────
        // After deploying to Render/Railway, replace this with your live backend URL
        // Example: 'https://nelson-energy-api.onrender.com'
        const BACKEND_URL = 'https://nelson-energy-backend.onrender.com';


        // ── Contact / Booking Form (via Formspree) ────────────────────────────────
        async function handleSubmit(event) {
            event.preventDefault();

            const form       = document.getElementById('contactForm');
            const submitBtn  = form.querySelector('button[type="submit"]');
            const successMsg = document.getElementById('successMessage');

            submitBtn.disabled    = true;
            submitBtn.textContent = 'Sending...';
            successMsg.style.display = 'none';

            try {
                const response = await fetch('https://formspree.io/f/xeedarnv', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: new FormData(form),   // sends all named fields automatically
                });

                if (response.ok) {
                    successMsg.style.display = 'block';
                    form.reset();
                    successMsg.scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => { successMsg.style.display = 'none'; }, 5000);
                } else {
                    const result = await response.json();
                    const msg = result.errors
                        ? result.errors.map(e => e.message).join(', ')
                        : 'Something went wrong. Please try again.';
                    alert(msg);
                }
            } catch (err) {
                alert('Network error. Please check your connection and try again.');
            } finally {
                submitBtn.disabled    = false;
                submitBtn.textContent = 'Submit Request';
            }

            return false;
        }


        // ── Newsletter Popup ──────────────────────────────────────────────────────
        function openNewsletter() {
            document.getElementById('newsletterOverlay').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeNewsletter() {
            document.getElementById('newsletterOverlay').classList.remove('active');
            document.body.style.overflow = '';
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

            success.style.display = 'none';
            error.style.display   = 'none';

            btn.disabled            = true;
            btnText.style.display   = 'none';
            btnLoader.style.display = 'inline';

            try {
                const response = await fetch(`${BACKEND_URL}/api/newsletter`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email }),
                });

                const result = await response.json();

                if (response.ok) {
                    success.style.display = 'block';
                    success.textContent   = result.message === 'already_subscribed'
                        ? "✅ You're already subscribed — we'll keep you posted!"
                        : "✅ You're in! Welcome to the Nelson Energy Group community.";

                    document.getElementById('newsletterForm').reset();
                    localStorage.setItem('newsletterSubscribed', 'true');

                    setTimeout(() => {
                        document.getElementById('newsletterOverlay').classList.remove('active');
                        document.body.style.overflow = '';
                    }, 3000);
                } else {
                    error.style.display = 'block';
                }
            } catch (err) {
                error.style.display = 'block';
            } finally {
                btn.disabled            = false;
                btnText.style.display   = 'inline';
                btnLoader.style.display = 'none';
            }
        }
