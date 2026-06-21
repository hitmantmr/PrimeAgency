/* ==========================================
   PRIME AGENCY - FRONTEND INTERACTION LOGIC
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. NAVIGACIJA I GLATKO SKROLOVANJE (SINGLE-PAGE SCROLL) ---
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navbar = document.getElementById('navbar');

    function switchTab(targetId) {
        // Ukloni '#' sa početka ID-ja
        const cleanId = targetId.replace('#', '');
        if (!cleanId) return;

        const targetElement = document.getElementById(cleanId);
        if (!targetElement) return;

        // Izračunaj poziciju sa offsetom za sticky navbar (75px)
        const offset = 75;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = targetElement.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        // Zatvori mobilni meni
        if (menuToggle && navMenu) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }

        // Ako skrolujemo do kontakt forme, automatski fokusiraj polje za ime
        if (cleanId === 'kontakt') {
            setTimeout(() => {
                const nameInput = document.getElementById('name');
                if (nameInput) nameInput.focus();
            }, 800);
        }
    }

    // Animacija brojača za Rezultate (od 0 do ciljne vrednosti)
    let countersAnimated = false; // Osiguraj da se animiraju samo jednom
    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;
        
        const counters = document.querySelectorAll('.result-number');
        counters.forEach(counter => {
            counter.textContent = '0';
            const target = parseInt(counter.getAttribute('data-target'));
            if (isNaN(target)) return;
            const duration = 1500; // 1.5 sekundi
            const step = Math.ceil(target / 50);
            let current = 0;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = current;
                }
            }, 30);
        });
    }

    // --- 2. INTERSECTION OBSERVER ZA SCROLL REVEAL & BROJAČE ---
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Ako je to results-bar (ili sadrži brojače), pokreni ih
                if (entry.target.classList.contains('results-bar') || entry.target.querySelector('.result-number')) {
                    animateCounters();
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.12
    });

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // --- 3. SCROLL SPY ZA NAVBAR (AKTIVNI LINKOVI NA SKROL) & GLASSMORPHISM ---
    const sections = document.querySelectorAll('section.tab-panel, section.cta-section');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                if (!id) return;
                
                // Izbegni označavanje cta sekcije kao navigacije (preusmeri na kontakt)
                const targetId = id === 'cta-section' ? 'kontakt' : id;
                
                const allLinks = document.querySelectorAll('.nav-menu a, .sidebar-link');
                allLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && href.replace('#', '') === targetId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, {
        root: null,
        rootMargin: '-35% 0px -55% 0px',
        threshold: 0
    });

    sections.forEach(sec => {
        navObserver.observe(sec);
    });

    // Optimizovana detekcija skrola za glassmorphism efekat navbara preko IntersectionObserver-a
    const scrollSentinel = document.getElementById('scroll-sentinel');
    const scrollObserver = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    }, {
        root: null,
        threshold: 0
    });
    if (scrollSentinel) {
        scrollObserver.observe(scrollSentinel);
    }

    // Klik na linkove u navigacijama
    const allTabLinks = document.querySelectorAll('.nav-menu a, .logo, #nav-logo, .btn-nav-cta');
    allTabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                switchTab(href);
            }
        });
    });

    // Presretanje svih CTA dugmadi na sajtu za glatki skrol
    const ctaButtons = document.querySelectorAll('.hero-btns a, #calc-apply-btn, #cta-start-project-btn, .portfolio-link');
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                switchTab(href);
            }
        });
    });

    // --- 4. MOBILNA NAVIGACIJA ---
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // --- 3. FAQ HARMONIKA (ACCORDION) ---
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const faqAnswer = faqItem.querySelector('.faq-answer');
            const isOpen = faqItem.classList.contains('open');

            // Zatvori sve ostale FAQ stavke
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('open');
                const answer = item.querySelector('.faq-answer');
                if (answer) answer.style.maxHeight = null;
            });

            // Otvori trenutnu ako je bila zatvorena
            if (!isOpen) {
                faqItem.classList.add('open');
                faqAnswer.style.maxHeight = faqAnswer.scrollHeight + "px";
            }
        });
    });

    // --- 4. FILTRIRANJE PORTFOLIA ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Promeni aktivno dugme
            filterButtons.forEach(button => button.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // --- 5. INTERAKTIVNI KALKULATOR CENA ---
    const typeCards = document.querySelectorAll('.calc-type-card');
    const pagesRange = document.getElementById('pages-range');
    const pagesCount = document.getElementById('pages-count');
    const pagesSliderGroup = document.getElementById('pages-slider-group');
    const optionCheckboxes = document.querySelectorAll('.calc-options input[type="checkbox"]');
    
    // Summary polja
    const summaryType = document.getElementById('summary-type');
    const summaryPages = document.getElementById('summary-pages');
    const totalPriceEl = document.getElementById('total-price');
    const totalDaysEl = document.getElementById('total-days');
    const calcApplyBtn = document.getElementById('calc-apply-btn');

    // Kontakt forma polja za prenos
    const contactForm = document.getElementById('contact-form');
    const projectTypeSelect = document.getElementById('project-type');
    const calcDetailsContainer = document.getElementById('calc-details-container');
    const calcDetailsInput = document.getElementById('calc-details-input');
    const clearCalcBtn = document.getElementById('clear-calc-btn');

    let activeType = 'landing';
    let basePrice = 400;
    let baseDays = 7;

    // Funkcija za ažuriranje kalkulacije
    function updateCalculation() {
        let pagesVal = pagesRange ? parseInt(pagesRange.value) : 3;
        
        // Ako je landing, broj stranica je uvek 1 i sakrij slider
        if (activeType === 'landing') {
            if (pagesSliderGroup) {
                pagesSliderGroup.style.opacity = '0.3';
                pagesSliderGroup.style.pointerEvents = 'none';
            }
            pagesVal = 1;
            if (pagesCount) pagesCount.textContent = '1 (Fiksno)';
        } else {
            if (pagesSliderGroup) {
                pagesSliderGroup.style.opacity = '1';
                pagesSliderGroup.style.pointerEvents = 'auto';
            }
            if (pagesCount) pagesCount.textContent = pagesVal;
        }

        // Kalkulacija cene i dana
        let price = basePrice;
        let days = baseDays;

        // Dodatne stranice za business i ecommerce (+50€ po stranici preko 3)
        if (activeType !== 'landing' && pagesVal > 3) {
            const extraPages = pagesVal - 3;
            price += extraPages * 50;
            days += Math.ceil(extraPages * 0.5); // 1 dan na svake 2 stranice
        }

        // Dodatne opcije
        let activeOptionsList = [];
        optionCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const optPrice = parseInt(checkbox.getAttribute('data-price'));
                const optDays = parseInt(checkbox.getAttribute('data-days'));
                price += optPrice;
                days += optDays;
                
                // Ime opcije za izveštaj
                const labelText = checkbox.closest('.calc-checkbox-wrapper').querySelector('.option-title').textContent;
                activeOptionsList.push(labelText);
            }
        });

        // Ažuriranje prikaza u rezimeu
        let displayTypeLabel = 'Landing Stranica';
        if (activeType === 'business') displayTypeLabel = 'Poslovni Sajt';
        if (activeType === 'ecommerce') displayTypeLabel = 'E-Commerce Prodavnica';

        if (summaryType) summaryType.textContent = displayTypeLabel;
        if (summaryPages) summaryPages.textContent = activeType === 'landing' ? '1 strana' : `${pagesVal} strana`;
        if (totalPriceEl) totalPriceEl.textContent = `${price}€`;
        if (totalDaysEl) totalDaysEl.textContent = `${days} radnih dana`;

        // Čuvanje trenutnog stanja u data-atribute na Apply dugmetu radi lakšeg prenosa
        if (calcApplyBtn) {
            calcApplyBtn.setAttribute('data-calc-summary', JSON.stringify({
                tip: displayTypeLabel,
                stranica: activeType === 'landing' ? '1' : pagesVal.toString(),
                opcije: activeOptionsList,
                cena: `${price}€`,
                vreme: `${days} dana`
            }));
        }
    }

    // Eventovi na tip sajta
    typeCards.forEach(card => {
        card.addEventListener('click', () => {
            typeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            activeType = card.getAttribute('data-type');
            basePrice = parseInt(card.getAttribute('data-base-price'));
            baseDays = parseInt(card.getAttribute('data-base-days'));

            updateCalculation();
        });
    });

    // Eventovi na slideru i checkbox-ovima
    if (pagesRange) {
        pagesRange.addEventListener('input', updateCalculation);
    }
    optionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateCalculation);
    });

    // Inicijalno pokretanje kalkulatora
    if (totalPriceEl) {
        updateCalculation();
    }

    // Pokretanje projekta sa opcijama kalkulatora (klik na dugme)
    if (calcApplyBtn) {
        calcApplyBtn.addEventListener('click', () => {
            const dataStr = calcApplyBtn.getAttribute('data-calc-summary');
            if (dataStr) {
                const data = JSON.parse(dataStr);
                
                // Priprema opisa za kontakt formu
                let summaryText = `Tip sajta: ${data.tip} | Broj strana: ${data.stranica}\n`;
                if (data.opcije.length > 0) {
                    summaryText += `Opcije: ${data.opcije.join(', ')}\n`;
                }
                summaryText += `Procena: ${data.cena} (Rok: ${data.vreme})`;

                // Prenos u formu
                if (calcDetailsInput) calcDetailsInput.value = summaryText;
                if (calcDetailsContainer) calcDetailsContainer.style.display = 'block';

                // Automatska selekcija tipa projekta u select-u
                if (projectTypeSelect) {
                    if (activeType === 'landing') projectTypeSelect.value = 'landing';
                    else if (activeType === 'business') projectTypeSelect.value = 'business';
                    else if (activeType === 'ecommerce') projectTypeSelect.value = 'ecommerce';
                    else projectTypeSelect.value = 'custom';
                }

                // Fokusiranje i otvaranje kontakt taba
                switchTab('#kontakt');
            }
        });
    }

    // Uklanjanje opcija kalkulatora u formi
    if (clearCalcBtn) {
        clearCalcBtn.addEventListener('click', () => {
            if (calcDetailsInput) calcDetailsInput.value = '';
            if (calcDetailsContainer) calcDetailsContainer.style.display = 'none';
        });
    }

    // --- 6. PREMIUM 3D PARALLAX TILT ZA GLAVNI BROWSER MOCKUP ---
    const heroVisual = document.getElementById('hero-visual-container');
    const tiltMockup = document.getElementById('browser-tilt');

    if (heroVisual && tiltMockup) {
        let rect = null;
        let ticking = false;
        let mouseX = 0;
        let mouseY = 0;

        const updateTilt = () => {
            if (!rect) return;
            const x = mouseX - rect.left;
            const y = mouseY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Pomeraj u procentima (-1 do 1)
            const percentX = (x - centerX) / centerX;
            const percentY = (centerY - y) / centerY;
            
            // Rotacije za mockup - polazimo od default CSS rotacija (rotateY(-10deg) rotateX(6deg) rotateZ(1deg))
            const rotateX = 6 + (percentY * 6);   // od 0deg do 12deg
            const rotateY = -10 + (percentX * 8); // od -18deg do -2deg
            const rotateZ = 1;
            
            // Primena transformacije sa 3D dubinom
            tiltMockup.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale3d(1.02, 1.02, 1.02)`;
            
            ticking = false;
        };

        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if (!ticking) {
                requestAnimationFrame(updateTilt);
                ticking = true;
            }
        };

        const handleMouseEnter = () => {
            rect = heroVisual.getBoundingClientRect();
            tiltMockup.style.transition = 'none';
        };

        const handleMouseLeave = () => {
            rect = null;
            
            const transitionStyle = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            tiltMockup.style.transition = transitionStyle;
            // Vraćamo na originalne CSS 3D vrednosti
            tiltMockup.style.transform = 'rotateX(6deg) rotateY(-10deg) rotateZ(1deg) scale3d(1, 1, 1)';
        };

        // Omogućavamo tilt samo na većim ekranima gde se prikazuje 3D raspored
        if (window.innerWidth >= 992) {
            heroVisual.addEventListener('mousemove', handleMouseMove);
            heroVisual.addEventListener('mouseleave', handleMouseLeave);
            heroVisual.addEventListener('mouseenter', handleMouseEnter);
        }
    }

    // --- 7. SIMULACIJA SLANJA KONTAKT FORME ---
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('submit-btn');
            const formResponse = document.getElementById('form-response');
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Slanje u toku... <i class="fa-solid fa-spinner fa-spin"></i>';

            setTimeout(() => {
                contactForm.reset();
                if (calcDetailsContainer) calcDetailsContainer.style.display = 'none';
                if (calcDetailsInput) calcDetailsInput.value = '';
                
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Pošalji Upit <i class="fa-solid fa-paper-plane"></i>';

                if (formResponse) {
                    formResponse.className = 'form-response success';
                    formResponse.innerHTML = '<i class="fa-solid fa-circle-check"></i> Hvala vam! Vaš upit je uspešno poslat. Odgovorićemo vam u roku od 24 sata na navedeni email.';
                    
                    setTimeout(() => {
                        formResponse.style.display = 'none';
                    }, 8000);
                }

            }, 2000);
        });
    }

    // --- 8. LOGIKA ZA DUGME BESPLATNE KONSULTACIJE ---
    const consultationBtn = document.getElementById('consultation-cta-btn');
    if (consultationBtn) {
        consultationBtn.addEventListener('click', () => {
            // Postavi selekt na "custom" (Nešto drugo / Custom)
            if (projectTypeSelect) {
                projectTypeSelect.value = 'custom';
            }
            
            // Popuni opis upita sa napomenom za besplatnu konsultaciju
            if (calcDetailsInput) {
                calcDetailsInput.value = 'Upit za besplatnu konsultaciju. Klijent želi stručni savet i pomoć u odabiru najboljeg tipa veb-sajta za svoj biznis.';
            }
            
            // Prikaži kontejner sa detaljima
            if (calcDetailsContainer) {
                calcDetailsContainer.style.display = 'block';
            }
            
            // Prebaci na tab za Kontakt
            switchTab('#kontakt');
            
            // Fokusiraj na polje za ime radi lakšeg unosa
            const nameInput = document.getElementById('name');
            if (nameInput) nameInput.focus();
        });
    }
});
