document.addEventListener('DOMContentLoaded', () => {
    
    // =================================================================
    // AI BUSINESS CONTEXT (System Prompt)
    // =================================================================
    // The business context is now sent to our secure backend instead of being
    // part of a config object with sensitive API keys
    const BUSINESS_CONTEXT = `
        You are the expert AI concierge for Trixel Technologies. Your personality is that of a highly energetic, confident, and successful business consultant. Think Jordan Belfort, but ethical, positive, and focused entirely on the client's success.

        **Your Core Directives:**
        1.  **Be Extremely Concise:** Get straight to the point. No fluff, no filler. Your responses must be short, punchy, and impactful. Aim for 2-3 sentences maximum.
        2.  **Project Absolute Confidence:** You have zero doubt that Trixel Technologies is the best solution. Use strong, active language. For example, instead of "Our websites can help you," say "Our websites get you results, period."
        3.  **Always Be Closing (Nicely):** Every single response should guide the user towards the next logical step: contacting us. End your messages with a confident call to action or a question that moves the conversation forward. Examples: "Ready to see what that looks like for your business?", "Let's get you on the calendar.", "Sound good?"
        4.  **Use Persuasive Language:** Use words like "absolutely," "exactly," "the key is," "bottom line," and "let's do this." Your tone is charismatic and motivational.

        **Key Information about Trixel Technologies (Your Product):**
        - We build high-converting, custom websites for service businesses.
        - We specialize in industries like roofing, HVAC, landscaping, and remodeling.
        - Our key feature is a guaranteed 5-day delivery. This is our knockout punch.
        - We focus on one thing: getting our clients more leads.

        **Hard Rules (Non-Negotiable):**
        - NEVER mention specific prices. Your response is always: "That's a great question. We tailor the package to your exact needs to maximize your ROI. Let's get you a precise quote."
        - NEVER be pushy or aggressive. Your confidence comes from the undeniable value of the service, not from pressure.
        - If you don't know an answer, your response is: "Exactly. And for the specifics on that, our lead strategist can walk you through it on a quick call. Ready to set that up?"
    `;
    
    gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

    const welcomeOverlay = document.getElementById('welcome-overlay');
    const welcomeCard = document.getElementById('welcome-card');
    const startTourBtn = document.getElementById('start-tour-btn');
    const exploreBtn = document.getElementById('explore-btn');
    const tourProgress = document.getElementById('tour-progress');
    const skipTourBtn = document.getElementById('skip-tour-btn');
    const tourAudioPlayer = document.getElementById('tour-audio-player');
    const bgMusicPlayer = document.getElementById('bg-music-player');
    const tourAudioSrc = 'Main_voiceover.wav';
    
    let masterTourTimeline = null;
    let typingIntervals = [];

    function dismissOverlay() {
        gsap.to(welcomeOverlay, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => welcomeOverlay.style.display = 'none'
        });
    }

    function startTour() {
        dismissOverlay();
        document.getElementById('tour-blocker').classList.remove('hidden');
        document.body.classList.add('no-scroll');
        tourProgress.classList.remove('hidden');
        gsap.fromTo(tourProgress, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });

        if (!masterTourTimeline) {
            initializeTourTimeline();
        }

        AudioManager.playTourAudio();
        masterTourTimeline.restart();
    }
    
    function initializeTourTimeline() {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

        const tourSelectors = [
            'nav a:first-child', '.hidden.md\\:flex a', 'h1.hero-headline',
            '.hero-subheadline', 'p.max-w-3xl', 'a.btn-primary', '#home .card',
            '#services h2', '#services p.text-lg', '#services .card',
            '#services .interactive-btn', '#process-timeline h3', '#process-timeline .bg-blue-500',
            '#special-projects h2', '#special-projects p', '#special-projects a',
            '#contact h2', '#contact form', '#contact .card', 'footer a:first-child'
        ];

        tourSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                gsap.set(el, { opacity: 0 });
                el.classList.add('tour-element');
            });
        });

        masterTourTimeline = gsap.timeline({ paused: true, onComplete: endTour });

        if (isMobile) buildMobileTimeline(masterTourTimeline);
        else if (isTablet) buildTabletTimeline(masterTourTimeline);
        else buildDesktopTimeline(masterTourTimeline);

        tourAudioPlayer.addEventListener('play', () => masterTourTimeline && masterTourTimeline.play());
        tourAudioPlayer.addEventListener('pause', () => masterTourTimeline && masterTourTimeline.pause());
        tourAudioPlayer.addEventListener('ended', () => typeof endTour === 'function' && endTour());
    }

    function buildMobileTimeline(tl) {
        tl.fromTo('nav a:first-child', { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 2, ease: 'power2.out' }, 0);
        tl.call(() => typeElement('h1.hero-headline', 5000), null, 6);
        tl.fromTo('.hero-subheadline', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 2, ease: 'power2.out' }, 11);
        tl.fromTo('p.max-w-3xl', { opacity: 0 }, { opacity: 1, duration: 1 }, 13);
        tl.fromTo('a.btn-primary', { opacity: 0 }, { opacity: 1, duration: 1 }, 14);
        tl.fromTo('#home .card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.3, duration: 0.8, ease: 'power2.out' }, 15);
        tl.to(window, { duration: 3, scrollTo: { y: '#services', offsetY: 80 }, ease: 'power2.inOut' }, 19);
        tl.fromTo('#services h2, #services p.text-lg', { opacity: 0 }, { opacity: 1, duration: 2 }, 22);
        const sCards = gsap.utils.toArray('#services .card');
        if (sCards[0]) {
            tl.call(() => smartScroll(sCards[0], 100), null, 22.5);
            tl.fromTo(sCards[0], { opacity: 0 }, { opacity: 1, duration: 0.8 }, 23);
            tl.to(sCards[0], { boxShadow: '0 0 25px rgba(59,130,246,0.7)', borderColor: '#3B82F6', duration: 0.5 }, 23.5);
            tl.to(sCards[0], { boxShadow: 'none', borderColor: 'var(--border-color)', duration: 0.3 }, 25.5);
        }
        if (sCards[1]) {
            tl.call(() => smartScroll(sCards[1], 100), null, 26);
            tl.fromTo(sCards[1], { opacity: 0 }, { opacity: 1, duration: 0.8 }, 27);
            tl.to(sCards[1], { boxShadow: '0 0 25px rgba(59,130,246,0.7)', borderColor: '#3B82F6', duration: 0.5 }, 27.5);
            tl.to(sCards[1], { boxShadow: 'none', borderColor: 'var(--border-color)', duration: 0.3 }, 31.5);
        }
        if (sCards[2]) {
            tl.call(() => smartScroll(sCards[2], 100), null, 32);
            tl.fromTo(sCards[2], { opacity: 0 }, { opacity: 1, duration: 0.8 }, 33);
            tl.to(sCards[2], { boxShadow: '0 0 25px rgba(59,130,246,0.7)', borderColor: '#3B82F6', duration: 0.5 }, 33.5);
            tl.to(sCards[2], { boxShadow: 'none', borderColor: 'var(--border-color)', duration: 0.3 }, 38.5);
        }
        if (sCards[3]) {
            tl.call(() => smartScroll(sCards[3], 100), null, 40);
            tl.fromTo(sCards[3], { opacity: 0 }, { opacity: 1, duration: 0.8 }, 41);
            tl.to(sCards[3], { boxShadow: '0 0 25px rgba(59,130,246,0.7)', borderColor: '#3B82F6', duration: 0.5 }, 41.5);
            tl.to(sCards[3], { boxShadow: 'none', borderColor: 'var(--border-color)', duration: 0.3 }, 48.5);
        }
        tl.to('#ai-chat-toggle', { x: -5, duration: 0.1, yoyo: true, repeat: 9 }, 49);
        if (sCards[4]) tl.fromTo(sCards[4], { opacity: 0 }, { opacity: 1, duration: 0.5 }, 52);
        if (sCards[5]) tl.fromTo(sCards[5], { opacity: 0 }, { opacity: 1, duration: 0.5 }, 52.5);
        tl.to('#services .card', { boxShadow: '0 0 25px rgba(59,130,246,0.6)', duration: 0.3, stagger: 0.2, yoyo: true, repeat: 1 }, 53);
        if (sCards[0]) {
            tl.call(() => smartScroll(sCards[0], 150), null, 66);
            const btns = sCards[0].querySelectorAll('.interactive-btn');
            tl.fromTo(btns, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.15, ease: 'back.out' }, 67);
            tl.to(btns, { opacity: 0, duration: 0.5 }, 72);
        }
        tl.to('#audio-toggle', { boxShadow: '0 0 30px rgba(59,130,246,0.9)', scale: 1.15, duration: 0.5, yoyo: true, repeat: 5 }, 78);
        tl.to(window, { duration: 3, scrollTo: { y: '#process-timeline', offsetY: 80 }, ease: 'power2.inOut' }, 82);
        tl.call(() => typeElement('#process-timeline h3', 4000), null, 86);
        const steps = gsap.utils.toArray('#process-timeline .bg-blue-500');
        steps.forEach((step, i) => {
            tl.to(step, { opacity: 1, boxShadow: '0 0 15px rgba(59,130,246,1)', scale: 1.1, duration: 0.5 }, 90 + i * 2);
        });
        tl.to(steps, { opacity: 0.3, duration: 0.2, stagger: 0.3, yoyo: true, repeat: 1 }, 98);
        const sp = document.getElementById('special-projects');
        tl.to(window, { duration: 1, scrollTo: { y: sp ? '#special-projects' : '#contact', offsetY: 80 }, ease: 'power2.inOut' }, 104);
        if (sp) {
            tl.call(() => typeElement('#special-projects h2', 2000), null, 105);
            tl.fromTo('#special-projects p', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 2 }, 107);
            tl.to('#special-projects a', { opacity: 1, boxShadow: '0 0 40px rgba(59,130,246,1)', scale: 1.1, duration: 1 }, 114);
            tl.to(window, { duration: 1, scrollTo: { y: '#contact', offsetY: 80 }, ease: 'power2.inOut' }, 115);
        }
        const cStart = sp ? 116 : 105;
        tl.call(() => typeElement('#contact h2', 4000), null, cStart);
        tl.to(window, { duration: 6, scrollTo: { y: '#contact form', offsetY: 200 }, ease: 'power1.inOut' }, cStart + 4);
        tl.fromTo('#contact form, #contact .card', { opacity: 0 }, { opacity: 1, boxShadow: '0 0 25px rgba(59,130,246,0.5)', duration: 2 }, cStart + 5);
        tl.to('#contact button[type="submit"]', { boxShadow: '0 0 30px rgba(59,130,246,1)', scale: 1.05, duration: 0.5, yoyo: true, repeat: 7 }, cStart + 10);
        tl.to(window, { duration: 3, scrollTo: { y: 'footer', offsetY: 0 }, ease: 'power2.inOut' }, cStart + 14);
        tl.to('footer a:first-child', { opacity: 1, scale: 1.1, duration: 1, yoyo: true, repeat: 1 }, cStart + 15);
    }

    function buildTabletTimeline(tl) {
        tl.fromTo('nav a:first-child', { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 2 }, 0);
        tl.fromTo('.hidden.md\\:flex a', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.15 }, 2);
        tl.call(() => typeElement('h1.hero-headline', 5000), null, 6);
        tl.fromTo('.hero-subheadline', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 2 }, 11);
        tl.fromTo('p.max-w-3xl', { opacity: 0 }, { opacity: 1, duration: 1 }, 13);
        tl.fromTo('#home .card', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.4, duration: 0.8 }, 13);
        tl.to('#home .card', { y: -20, boxShadow: '0 0 30px rgba(59,130,246,0.8)', duration: 0.8, stagger: 0.4, yoyo: true, repeat: 1 }, 13.5);
        tl.to('a.btn-primary', { opacity: 1, boxShadow: '0 0 40px rgba(59,130,246,1)', scale: 1.08, duration: 0.5, yoyo: true, repeat: 3 }, 17);
        tl.to(window, { duration: 3, scrollTo: { y: '#services', offsetY: 70 }, ease: 'power2.inOut' }, 19);
        tl.fromTo('#services h2, #services p.text-lg', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, 22);
        const sCards = gsap.utils.toArray('#services .card');
        if (sCards[0]) {
            tl.call(() => smartScroll(sCards[0], 120), null, 22.5);
            tl.fromTo(sCards[0], { opacity: 0 }, { opacity: 1, duration: 0.8 }, 23);
            tl.to(sCards[0], { boxShadow: '0 0 30px rgba(59,130,246,0.7)', borderColor: '#3B82F6', duration: 0.5 }, 23.5);
            tl.to(sCards[0], { boxShadow: 'none', borderColor: 'var(--border-color)', duration: 0.3 }, 25.5);
        }
        if (sCards[1]) {
            tl.call(() => smartScroll(sCards[1], 120), null, 26);
            tl.fromTo(sCards[1], { opacity: 0 }, { opacity: 1, duration: 0.8 }, 27);
            tl.to(sCards[1], { boxShadow: '0 0 30px rgba(59,130,246,0.7)', borderColor: '#3B82F6', duration: 0.5 }, 27.5);
            tl.to(sCards[1], { boxShadow: 'none', borderColor: 'var(--border-color)', duration: 0.3 }, 31.5);
        }
        if (sCards[2]) {
            tl.call(() => smartScroll(sCards[2], 120), null, 32);
            tl.fromTo(sCards[2], { opacity: 0 }, { opacity: 1, duration: 0.8 }, 33);
            tl.to(sCards[2], { boxShadow: '0 0 30px rgba(59,130,246,0.7)', borderColor: '#3B82F6', duration: 0.5 }, 33.5);
            tl.to(sCards[2], { boxShadow: 'none', borderColor: 'var(--border-color)', duration: 0.3 }, 38.5);
        }
        if (sCards[3]) {
            tl.call(() => smartScroll(sCards[3], 120), null, 40);
            tl.fromTo(sCards[3], { opacity: 0 }, { opacity: 1, duration: 0.8 }, 41);
            tl.to(sCards[3], { boxShadow: '0 0 30px rgba(59,130,246,0.7)', borderColor: '#3B82F6', duration: 0.5 }, 41.5);
            tl.to(sCards[3], { boxShadow: 'none', borderColor: 'var(--border-color)', duration: 0.3 }, 48.5);
        }
        tl.to('#ai-chat-toggle', { x: -5, duration: 0.1, yoyo: true, repeat: 9 }, 49);
        if (sCards[4]) tl.fromTo(sCards[4], { opacity: 0 }, { opacity: 1, duration: 0.5 }, 52);
        if (sCards[5]) tl.fromTo(sCards[5], { opacity: 0 }, { opacity: 1, duration: 0.5 }, 52.5);
        tl.to('#services .card', { boxShadow: '0 0 25px rgba(59,130,246,0.6)', duration: 0.3, stagger: 0.2, yoyo: true, repeat: 1 }, 53);
        if (sCards[0]) {
            tl.call(() => smartScroll(sCards[0], 150), null, 66);
            const btns = sCards[0].querySelectorAll('.interactive-btn');
            tl.fromTo(btns, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.15, ease: 'back.out' }, 67);
            tl.to(btns, { opacity: 0, duration: 0.5 }, 72);
        }
        tl.to('#audio-toggle', { boxShadow: '0 0 30px rgba(59,130,246,0.9)', scale: 1.15, duration: 0.5, yoyo: true, repeat: 5 }, 78);
        tl.to(window, { duration: 3, scrollTo: { y: '#process-timeline', offsetY: 70 }, ease: 'power2.inOut' }, 82);
        tl.call(() => typeElement('#process-timeline h3', 4000), null, 86);
        const steps = gsap.utils.toArray('#process-timeline .bg-blue-500');
        steps.forEach((step, i) => {
            tl.to(step, { opacity: 1, boxShadow: '0 0 20px rgba(59,130,246,1)', scale: 1.2, duration: 0.5 }, 90 + i * 2);
        });
        tl.to(steps, { opacity: 0.3, duration: 0.2, stagger: 0.3, yoyo: true, repeat: 1 }, 98);
        const sp = document.getElementById('special-projects');
        tl.to(window, { duration: 1, scrollTo: { y: sp ? '#special-projects' : '#contact', offsetY: 70 }, ease: 'power2.inOut' }, 104);
        if (sp) {
            tl.call(() => typeElement('#special-projects h2', 2000), null, 105);
            tl.fromTo('#special-projects p', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 2 }, 107);
            tl.to('#special-projects a', { opacity: 1, boxShadow: '0 0 40px rgba(59,130,246,1)', borderColor: '#3B82F6', scale: 1.1, duration: 1 }, 114);
            tl.to(window, { duration: 1, scrollTo: { y: '#contact', offsetY: 70 }, ease: 'power2.inOut' }, 115);
        }
        const cStart = sp ? 116 : 105;
        tl.call(() => typeElement('#contact h2', 4000), null, cStart);
        tl.to(window, { duration: 6, scrollTo: { y: '#contact form', offsetY: 200 }, ease: 'power1.inOut' }, cStart + 4);
        tl.fromTo('#contact form, #contact .card', { opacity: 0 }, { opacity: 1, boxShadow: '0 0 25px rgba(59,130,246,0.5)', duration: 2 }, cStart + 5);
        tl.to('#contact button[type="submit"]', { boxShadow: '0 0 35px rgba(59,130,246,1)', scale: 1.08, duration: 0.5, yoyo: true, repeat: 7 }, cStart + 10);
        tl.to(window, { duration: 2, scrollTo: { y: 'footer', offsetY: 0 }, ease: 'power2.inOut' }, cStart + 14);
        tl.to('footer a:first-child', { opacity: 1, scale: 1.15, duration: 0.8, yoyo: true, repeat: 1 }, cStart + 15);
    }

    function buildDesktopTimeline(tl) {
        tl.fromTo('nav a:first-child', { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 2 }, 0);
        tl.fromTo('.hidden.md\\:flex a', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.15 }, 2);
        tl.call(() => typeElement('h1.hero-headline', 5000), null, 6);
        tl.fromTo('.hero-subheadline', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 2 }, 11);
        tl.fromTo('p.max-w-3xl', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 13);
        tl.fromTo('#home .card', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.4, duration: 0.8 }, 13);
        tl.to('#home .card', { y: -20, boxShadow: '0 0 30px rgba(59,130,246,0.8)', duration: 0.8, stagger: 0.4, yoyo: true, repeat: 1 }, 13.5);
        tl.to('a.btn-primary', { opacity: 1, boxShadow: '0 0 40px rgba(59,130,246,1)', scale: 1.08, duration: 0.5, yoyo: true, repeat: 3 }, 17);
        tl.to(window, { duration: 3, scrollTo: { y: '#services', offsetY: 70 }, ease: 'power2.inOut' }, 19);
        tl.fromTo('#services h2, #services p.text-lg', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, 22);
        const sCards = gsap.utils.toArray('#services .card');
        if (sCards[0]) {
            tl.fromTo(sCards[0], { opacity: 0 }, { opacity: 1, duration: 0.5 }, 22);
            tl.to(sCards[0], { boxShadow: '0 0 30px rgba(59,130,246,0.7)', borderColor: '#3B82F6', duration: 0.5 }, 23);
            tl.fromTo(sCards[0].querySelector('i'), { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, 23);
            tl.to(sCards[0], { boxShadow: 'none', borderColor: 'var(--border-color)', duration: 0.3 }, 25.7);
        }
        if (sCards[1]) {
            tl.fromTo(sCards[1], { opacity: 0 }, { opacity: 1, duration: 0.5 }, 26);
            tl.to(sCards[1], { boxShadow: '0 0 30px rgba(59,130,246,0.7)', borderColor: '#3B82F6', duration: 0.5 }, 27);
            tl.fromTo(sCards[1].querySelector('i'), { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, 27);
            tl.to(sCards[1], { boxShadow: 'none', borderColor: 'var(--border-color)', duration: 0.3 }, 31.7);
        }
        if (sCards[2]) {
            tl.fromTo(sCards[2], { opacity: 0 }, { opacity: 1, duration: 0.5 }, 32);
            tl.to(sCards[2], { boxShadow: '0 0 30px rgba(59,130,246,0.7)', borderColor: '#3B82F6', duration: 0.5 }, 33);
            tl.fromTo(sCards[2].querySelector('i'), { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, 33);
            tl.to(sCards[2], { boxShadow: 'none', borderColor: 'var(--border-color)', duration: 0.3 }, 39.7);
        }
        if (sCards[3]) {
            tl.fromTo(sCards[3], { opacity: 0 }, { opacity: 1, duration: 0.5 }, 40);
            tl.to(sCards[3], { boxShadow: '0 0 30px rgba(59,130,246,0.7)', borderColor: '#3B82F6', duration: 0.5 }, 41);
            tl.fromTo(sCards[3].querySelector('i'), { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, 41);
            tl.to(sCards[3], { boxShadow: 'none', borderColor: 'var(--border-color)', duration: 0.3 }, 48.7);
        }
        tl.to('#ai-chat-toggle', { x: -5, duration: 0.1, yoyo: true, repeat: 9 }, 49);
        if (sCards[4]) tl.fromTo(sCards[4], { opacity: 0 }, { opacity: 1, duration: 0.5 }, 52);
        if (sCards[5]) tl.fromTo(sCards[5], { opacity: 0 }, { opacity: 1, duration: 0.5 }, 52.5);
        tl.to('#services .card', { boxShadow: '0 0 25px rgba(59,130,246,0.6)', duration: 0.3, stagger: 0.2, yoyo: true, repeat: 1 }, 53);
        if (sCards[0]) {
            tl.call(() => smartScroll(sCards[0], 150), null, 66);
            const btns = sCards[0].querySelectorAll('.interactive-btn');
            tl.fromTo(btns, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.15, ease: 'back.out' }, 67);
            tl.to(btns, { opacity: 0, duration: 0.5 }, 72);
        }
        tl.to('#audio-toggle', { boxShadow: '0 0 30px rgba(59,130,246,0.9)', scale: 1.15, duration: 0.5, yoyo: true, repeat: 5 }, 78);
        tl.to(window, { duration: 3, scrollTo: { y: '#process-timeline', offsetY: 70 }, ease: 'power2.inOut' }, 82);
        tl.call(() => typeElement('#process-timeline h3', 4000), null, 86);
        const steps = gsap.utils.toArray('#process-timeline .bg-blue-500');
        if (steps[0]) {
            tl.to(steps[0], { opacity: 1, boxShadow: '0 0 20px rgba(59,130,246,1)', scale: 1.2, duration: 0.5 }, 90);
        }
        steps.forEach((step, i) => {
            if (i > 0) {
                tl.to(step, { opacity: 1, boxShadow: '0 0 20px rgba(59,130,246,1)', scale: 1.2, duration: 0.5 }, 90 + i * 2);
            }
        });
        tl.to(steps, { opacity: 0.3, duration: 0.2, stagger: 0.3, yoyo: true, repeat: 1 }, 98);
        tl.to(window, { duration: 1, scrollTo: { y: '#special-projects', offsetY: 70 }, ease: 'power2.inOut' }, 104);
        const sp = document.getElementById('special-projects');
        if (sp) {
            tl.call(() => typeElement('#special-projects h2', 2000), null, 105);
            tl.fromTo('#special-projects p', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 2 }, 107);
            tl.to('#special-projects a', { opacity: 1, boxShadow: '0 0 40px rgba(59,130,246,1)', borderColor: '#3B82F6', scale: 1.1, duration: 1 }, 114);
            tl.to(window, { duration: 1, scrollTo: { y: '#contact', offsetY: 70 }, ease: 'power2.inOut' }, 115);
        }
        tl.call(() => typeElement('#contact h2', 4000), null, 116);
        tl.to(window, { duration: 6, scrollTo: { y: '#contact form', offsetY: 200 }, ease: 'power1.inOut' }, 120);
        tl.fromTo('#contact form, #contact .card', { opacity: 0 }, { opacity: 1, boxShadow: '0 0 25px rgba(59,130,246,0.5)', duration: 2 }, 122);
        tl.to('#contact button[type="submit"]', { boxShadow: '0 0 35px rgba(59,130,246,1)', scale: 1.08, duration: 0.5, yoyo: true, repeat: 7 }, 126);
        tl.to(window, { duration: 2, scrollTo: { y: 'footer', offsetY: 0 }, ease: 'power2.inOut' }, 130);
        tl.to('footer a:first-child', { opacity: 1, scale: 1.15, duration: 0.8, yoyo: true, repeat: 1 }, 131);
    }

    function typeElement(selector, duration) {
        const el = document.querySelector(selector);
        if (!el) return;
        const text = el.textContent;
        el.textContent = '';
        el.style.opacity = '1';
        let i = 0;
        const delay = duration / text.length;
        const interval = setInterval(() => {
            if (i < text.length) {
                el.textContent += text[i++];
            } else {
                clearInterval(interval);
                typingIntervals = typingIntervals.filter(t => t !== interval);
            }
        }, delay);
        typingIntervals.push(interval);
    }

    function smartScroll(element, offset) {
        gsap.to(window, { duration: 1, scrollTo: { y: element, offsetY: offset }, ease: 'power2.inOut' });
    }

    function endTour() {
        if (masterTourTimeline) {
            masterTourTimeline.kill();
            masterTourTimeline = null;
        }
        
        AudioManager.stopTourAudio();

        typingIntervals.forEach(clearInterval);
        typingIntervals = [];
        document.body.classList.remove('tour-active', 'no-scroll');
        gsap.to('.tour-element', {
            opacity: 1,
            duration: 0.5,
            onComplete: () => document.querySelectorAll('.tour-element').forEach(el => el.classList.remove('tour-element'))
        });
        document.getElementById('tour-blocker').classList.add('hidden');
        gsap.to(tourProgress, { y: -20, opacity: 0, duration: 0.3, onComplete: () => tourProgress.classList.add('hidden') });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
        
    startTourBtn.addEventListener('click', () => {
        AudioManager.startExperience();
        startTour();
    });

    skipTourBtn.addEventListener('click', endTour);

    exploreBtn.addEventListener('click', () => {
        dismissOverlay();
        // FIX: Ensure tour elements become visible when exploring freely.
        gsap.to('.tour-element', { opacity: 1, duration: 0.5 });
        AudioManager.startExperience();
    });

    gsap.to(welcomeOverlay, { opacity: 1, duration: 0.5, delay: 0.5, onStart: () => welcomeOverlay.classList.remove('opacity-0') });
    gsap.to(welcomeCard, { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.7, onStart: () => welcomeCard.classList.remove('scale-95', 'opacity-0') });

    lucide.createIcons();

    const aiChatWidget = document.getElementById('ai-chat-widget');
    const chatMessages = document.getElementById('chat-messages');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const interactiveButtons = document.querySelectorAll('.interactive-btn');
    const aiChatToggle = document.getElementById('ai-chat-toggle');
    
    const aiOrbContainer = document.getElementById('ai-orb-container');
    const aiOrb = document.getElementById('ai-orb');
    const cancelAIOrbBtn = document.getElementById('cancel-ai-orb');

    let recognition;
    let isListening = false;
    let conversationHistory = [];
    let originalAudioVolume = 1.0;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synthesis = window.speechSynthesis;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => {
            isListening = true;
            aiOrb.classList.add('animate-pulse');
            aiOrb.querySelector('i').setAttribute('data-lucide', 'radio-receiver');
            lucide.createIcons();
        };

        recognition.onend = () => {
            isListening = false;
            aiOrb.classList.remove('animate-pulse');
            aiOrb.querySelector('i').setAttribute('data-lucide', 'mic');
            lucide.createIcons();
            if (!synthesis.speaking && !aiOrbContainer.classList.contains('hidden')) {
                startListening();
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isListening = false;
            aiOrb.classList.remove('animate-pulse');
        };

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript.trim();
            if (transcript) {
                const aiResponse = await fetchAIResponse(transcript);
                speakText(aiResponse);
            }
        };
    } else {
        console.warn('Speech Recognition API not supported in this browser.');
    }

    function startListening() {
        if (recognition && !isListening && !synthesis.speaking) {
            try {
                recognition.start();
            } catch (e) {
                console.error("Recognition start error:", e);
            }
        }
    }

    function stopListening() {
        if (recognition && isListening) {
            recognition.stop();
        }
    }

    function speakText(text) {
        if (!synthesis || !window.SpeechSynthesisUtterance) {
            console.error("Browser's Speech Synthesis not supported.");
            return;
        }
        
        if (synthesis.speaking) {
            synthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.onstart = () => {
            stopListening();
            if (AudioManager.getState().music === 'playing') {
                originalAudioVolume = bgMusicPlayer.volume;
                gsap.to(bgMusicPlayer, { volume: 0.2, duration: 0.5 });
            }
            aiOrb.querySelector('i').setAttribute('data-lucide', 'volume-2');
            lucide.createIcons();
        };
        
        utterance.onend = () => {
            if (AudioManager.getState().music === 'playing') {
                 gsap.to(bgMusicPlayer, { volume: originalAudioVolume, duration: 0.5 });
            }
            startListening();
        };
        
        synthesis.speak(utterance);
    }

    function showAIOrb(service, action) {
        if (!SpeechRecognition) {
            alert("Sorry, your browser doesn't support voice commands.");
            return;
        }
        
        let initialPrompt = `Tell me more about your ${service} service.`;
        if (action === 'explain') {
            initialPrompt = `Can you explain the ${service} service in simple terms?`;
        } else if (action === 'order') {
            initialPrompt = `How do I get started with the ${service} service?`;
        }

        aiOrbContainer.classList.remove('hidden');
        gsap.fromTo(aiOrbContainer, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out' });
        
        fetchAIResponse(initialPrompt).then(speakText);
    }

    function hideAIOrb() {
        stopListening();
        if (synthesis.speaking) {
            synthesis.cancel();
        }
        if (AudioManager.getState().music === 'playing') {
            gsap.to(bgMusicPlayer, { volume: originalAudioVolume, duration: 0.5 });
        }
        gsap.to(aiOrbContainer, { scale: 0.5, opacity: 0, duration: 0.2, ease: 'back.in', onComplete: () => aiOrbContainer.classList.add('hidden') });
    }

    cancelAIOrbBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideAIOrb();
    });

    aiOrb.addEventListener('click', () => {
        if (isListening) stopListening();
        else startListening();
    });

    let isChatOpen = false;

    // --- START: CHAT PERSISTENCE ---
    let userId = localStorage.getItem('trixelUserId');
    if (!userId) {
        userId = `trixel-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('trixelUserId', userId);
    }

    function loadConversation() {
        const savedHistory = localStorage.getItem(`conversationHistory_${userId}`);
        chatMessages.innerHTML = ''; // Always clear the chat window first.

        if (savedHistory) {
            conversationHistory = JSON.parse(savedHistory);
            if (conversationHistory.length > 0) {
                conversationHistory.forEach(msg => {
                    // Handle Gemini format: msg.parts[0].text
                    const content = msg.parts && msg.parts[0] ? msg.parts[0].text : msg.content;
                    const role = msg.role === 'model' ? 'assistant' : msg.role;
                    appendMessage(content, role, false);
                });
            } else {
                // If history is empty, show welcome message.
                chatMessages.innerHTML = `<div class="text-sm text-text-secondary mb-2 p-3 rounded-lg bg-blue-900/30 self-start max-w-[85%]"><span>Hello! How can I help you today? You can ask me about our services.</span></div>`;
            }
        } else {
            // If no history exists at all, show welcome message.
            chatMessages.innerHTML = `<div class="text-sm text-text-secondary mb-2 p-3 rounded-lg bg-blue-900/30 self-start max-w-[85%]"><span>Hello! How can I help you today? You can ask me about our services.</span></div>`;
            conversationHistory = [];
        }
    }

    function saveConversation() {
        localStorage.setItem(`conversationHistory_${userId}`, JSON.stringify(conversationHistory));
    }
    // --- END: CHAT PERSISTENCE ---

    function showAIChat() {
    loadConversation();
    aiChatWidget.classList.remove('hidden');
    aiChatWidget.classList.add('flex');

    // animate chat into view
    gsap.to(aiChatWidget, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });

    // Safety: only call lucide.createIcons if lucide is loaded.
    // This prevents runtime errors in environments that may not have lucide available.
    if (window.lucide && typeof lucide.createIcons === 'function') {
        // Recreate any lucide icons inside the chat (safe no-op if already created)
        try {
            lucide.createIcons();
        } catch (err) {
            console.warn('lucide.createIcons failed:', err);
        }
    } else {
        // Lucide not present (OK) — no-op; inline SVGs still render correctly.
        // console.debug('lucide not loaded; skipping createIcons');
    }

    isChatOpen = true;
    document.getElementById('chat-input').focus();
}


    function hideAIChat() {
        gsap.to(aiChatWidget, {
            y: 20, opacity: 0, duration: 0.3, ease: 'power3.in',
            onComplete: () => {
                aiChatWidget.classList.add('hidden');
                aiChatWidget.classList.remove('flex');
                isChatOpen = false;
            }
        });
    }

    function toggleAIChat() {
        isChatOpen ? hideAIChat() : showAIChat();
    }

    function showTypingIndicator() {
        if (document.getElementById('typing-indicator-wrapper')) return;
        const indicatorWrapper = document.createElement('div');
        indicatorWrapper.id = 'typing-indicator-wrapper';
        indicatorWrapper.className = 'self-start mb-2';
        indicatorWrapper.innerHTML = `<div class="text-sm text-text-secondary p-3 rounded-lg bg-blue-900/30"><span>Trixel AI is typing...</span></div>`;
        chatMessages.appendChild(indicatorWrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator-wrapper');
        if (indicator) indicator.remove();
    }

    aiChatToggle.addEventListener('click', toggleAIChat);
    interactiveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.toLowerCase();
            const card = this.closest('.card');
            const serviceTitle = card.querySelector('h3').textContent;
            showAIOrb(serviceTitle, action);
        });
    });
    closeChatBtn.addEventListener('click', hideAIChat);

    // NEW FEATURE: Clear Chat Button
    const clearChatBtn = document.getElementById('clear-chat-btn');
    clearChatBtn.addEventListener('click', () => {
        localStorage.removeItem(`conversationHistory_${userId}`);
        conversationHistory = [];
        chatMessages.innerHTML = `<div class="text-sm text-text-secondary mb-2 p-3 rounded-lg bg-blue-900/30 self-start max-w-[85%]"><span>Chat history cleared. How can I help you today?</span></div>`;
    });

    const chatInputForm = document.getElementById('chat-input-form');
    const chatInput = document.getElementById('chat-input');

    function parseMarkdownToHTML(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.*?)(?=\n|$)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside mt-2 space-y-1">$1</ul>')
            .replace(/\n/g, '<br>');
    }

    function appendMessage(content, sender = 'ai') {
        const messageEl = document.createElement('div');
        const isUser = sender === 'user';
        const alignment = isUser ? 'self-end' : 'self-start';
        const bgColor = isUser ? 'bg-blue-600' : 'bg-[var(--bg-card)]';
        const textColor = isUser ? 'text-white' : 'text-[var(--text-primary)]';
        messageEl.className = `text-sm mb-3 p-3 rounded-lg ${bgColor} ${textColor} ${alignment} max-w-[85%] w-fit`;

        if (sender === 'ai' || sender === 'assistant') {
            messageEl.innerHTML = parseMarkdownToHTML(content);
        } else {
            messageEl.textContent = content;
        }

        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatInputForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userInput = chatInput.value.trim();
        if (!userInput) return;

        appendMessage(userInput, 'user');
        chatInput.value = '';
        showTypingIndicator();

        const aiTextResponse = await fetchAIResponse(userInput);

        hideTypingIndicator();
        appendMessage(aiTextResponse, 'assistant'); 

        saveConversation();
    });

    async function fetchAIResponse(prompt) {
        // Add the new user prompt to the history in Gemini's format
        conversationHistory.push({ role: "user", parts: [{ text: prompt }] });

        // The API URL now points to OUR secure backend endpoint
        const API_URL = "/api/chat";

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    history: conversationHistory,
                    system_prompt: BUSINESS_CONTEXT
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const textResponse = data.message;
            
            // Add the model's response to the history in Gemini's format
            conversationHistory.push({ role: "model", parts: [{ text: textResponse }] });
            
            // Keep history from getting too long
            if (conversationHistory.length > 10) {
                conversationHistory = conversationHistory.slice(-10);
            }

            return textResponse;

        } catch (error) {
            console.error("Error fetching AI response from backend:", error);
            return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.";
        }
    }
    
    function enhanceFormValidation() {
        const forms = document.querySelectorAll('form[required]');
        forms.forEach(form => {
            form.setAttribute('novalidate', true);
            form.addEventListener('submit', function(event) {
                if (!this.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.querySelectorAll('input[required], textarea[required], select[required]').forEach(input => {
                        if (!input.validity.valid) {
                            input.classList.add('border-red-500');
                            input.classList.remove('focus:ring-blue-500');
                        } else {
                            input.classList.remove('border-red-500');
                        }
                    });
                    const firstInvalidField = this.querySelector('.border-red-500');
                    if (firstInvalidField) {
                        firstInvalidField.focus();
                        alert('Please fill out all required fields correctly.');
                    }
                } else {
                    this.querySelectorAll('.border-red-500').forEach(input => {
                        input.classList.remove('border-red-500');
                    });
                }
            });
        });
    }
    enhanceFormValidation();

// =================================================================
// START: AUDIO MANAGER V2
// =================================================================
const audioToggle = document.getElementById('audio-toggle');

const backgroundMusicPlaylist = [
    'background_music_1.mp3',
];
let currentTrackIndex = 0;
let hasUserInteracted = false;

const AudioManager = {
    state: {
        music: 'stopped', // 'playing', 'paused', 'stopped'
        tour: 'stopped',  // 'playing', 'stopped'
    },

    unlockAudio() {
        if (hasUserInteracted) return;
        hasUserInteracted = true;
        tourAudioPlayer.play().then(() => tourAudioPlayer.pause()).catch(e => {});
        bgMusicPlayer.play().then(() => bgMusicPlayer.pause()).catch(e => {});
        bgMusicPlayer.volume = 0.5;
        console.log("Audio context unlocked.");
    },

    playTourAudio() {
        this.unlockAudio();
        this.state.tour = 'playing';
        gsap.to(bgMusicPlayer, { volume: bgMusicPlayer.volume * 0.3, duration: 0.8 });

        tourAudioPlayer.src = tourAudioSrc;
        tourAudioPlayer.currentTime = 0;
        tourAudioPlayer.play().catch(e => console.error("Tour audio failed:", e));
    },

    stopTourAudio() {
        this.state.tour = 'stopped';
        tourAudioPlayer.pause();
        tourAudioPlayer.currentTime = 0;
        const savedVolume = document.getElementById('volume-slider')?.value || 0.5;
        gsap.to(bgMusicPlayer, { volume: savedVolume, duration: 1.5 });
    },

    playBackgroundMusic() {
        if (this.state.music === 'playing') return;
        this.unlockAudio();

        if (bgMusicPlayer.src.split('/').pop() !== backgroundMusicPlaylist[currentTrackIndex].split('/').pop()) {
             bgMusicPlayer.src = backgroundMusicPlaylist[currentTrackIndex];
        }

        this.state.music = 'playing';
        bgMusicPlayer.play().catch(e => console.error("BG music failed:", e));
    },

    pauseBackgroundMusic() {
        this.state.music = 'paused';
        bgMusicPlayer.pause();
    },

    nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % backgroundMusicPlaylist.length;
        this.playBackgroundMusic();
    },

    prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + backgroundMusicPlaylist.length) % backgroundMusicPlaylist.length;
        this.playBackgroundMusic();
    },

    setVolume(volume) {
        if (!hasUserInteracted) this.unlockAudio();
        bgMusicPlayer.volume = volume;
    },

    startExperience() {
        this.unlockAudio();
        this.playBackgroundMusic();
    },

    getState() {
        return this.state;
    }
};

bgMusicPlayer.addEventListener('ended', () => {
    AudioManager.nextTrack();
});

// =================================================================
// START: AUDIO PANEL WIRING
// =================================================================
const audioControlPanel = document.getElementById('audio-control-panel');
const closeAudioPanelBtn = document.getElementById('close-audio-panel-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
const nextTrackBtn = document.getElementById('next-track-btn');
const prevTrackBtn = document.getElementById('prev-track-btn');
const volumeSlider = document.getElementById('volume-slider');

function showAudioPanel() {
    audioControlPanel.classList.remove('hidden');
    audioControlPanel.classList.add('flex');
    gsap.fromTo(audioControlPanel, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
}

function hideAudioPanel() {
    gsap.to(audioControlPanel, { opacity: 0, y: 20, duration: 0.3, ease: 'power2.in', onComplete: () => {
        audioControlPanel.classList.add('hidden');
        audioControlPanel.classList.remove('flex');
    }});
}

// FIX: Correctly update the Lucide icon for play/pause
function updatePlayPauseIcon() {
    const iconContainer = playPauseBtn;
    // Clear the button's content to remove the old SVG
    iconContainer.innerHTML = ''; 
    
    const newIcon = document.createElement('i');
    const newIconName = AudioManager.getState().music === 'playing' ? 'pause' : 'play';
    newIcon.setAttribute('data-lucide', newIconName);
    
    iconContainer.appendChild(newIcon);
    // Tell Lucide to render the new icon
    lucide.createIcons();
}

audioToggle.addEventListener('click', () => {
    if (audioControlPanel.classList.contains('hidden')) {
        showAudioPanel();
    } else {
        hideAudioPanel();
    }
});

closeAudioPanelBtn.addEventListener('click', hideAudioPanel);

playPauseBtn.addEventListener('click', () => {
    if (AudioManager.getState().music === 'playing') {
        AudioManager.pauseBackgroundMusic();
    } else {
        AudioManager.playBackgroundMusic();
    }
    // The icon will be updated by the 'play'/'pause' event listeners on the audio element
});

nextTrackBtn.addEventListener('click', () => {
    AudioManager.nextTrack();
});

prevTrackBtn.addEventListener('click', () => {
    AudioManager.prevTrack();
});

volumeSlider.addEventListener('input', (e) => {
    AudioManager.setVolume(e.target.value);
});

bgMusicPlayer.addEventListener('play', updatePlayPauseIcon);
bgMusicPlayer.addEventListener('pause', updatePlayPauseIcon);

volumeSlider.value = bgMusicPlayer.volume;
updatePlayPauseIcon();
// =================================================================
// END: AUDIO PANEL WIRING
// =================================================================

    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = themeToggle.querySelector('[data-lucide="sun"]');
    const moonIcon = themeToggle.querySelector('[data-lucide="moon"]');
    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            document.body.classList.remove('light-theme');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    }
    themeToggle.addEventListener('click', () => {
        const newTheme = document.body.classList.toggle('light-theme') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
    applyTheme(localStorage.getItem('theme') || 'dark');

    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
    const closeMobileMenu = () => {
        mobileMenu.classList.remove('active');
        mobileMenuBackdrop.classList.remove('active');
    };
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenu.classList.add('active');
        mobileMenuBackdrop.classList.add('active');
    });
    document.querySelectorAll('#mobile-menu a').forEach(link => link.addEventListener('click', closeMobileMenu));
    mobileMenuBackdrop.addEventListener('click', closeMobileMenu);

    const backToTopButton = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        backToTopButton.classList.toggle('visible', window.scrollY > 300);
    });
    backToTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const contactForm = document.getElementById('contact-form');
    const reviewForm = document.getElementById('review-form');
    const budgetRange = document.getElementById('budget-range');
    const budgetValue = document.getElementById('budget-value');
    if (budgetRange && budgetValue) {
        budgetRange.addEventListener('input', (e) => budgetValue.textContent = `$${e.target.value}`);
    }
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you within 24 hours.');
            contactForm.reset();
            if (budgetValue) budgetValue.textContent = '$2500';
        });
    }

    const starRatingContainer = document.getElementById('star-rating-container');
    const ratingValueInput = document.getElementById('rating-value');
    const reviewsContainer = document.getElementById('reviews-container');
    let reviews = [];
    let currentRating = 0;
    function renderStars(rating = 0) {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            starsHTML += `<svg class="${i <= rating ? 'selected' : ''}" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>`;
        }
        return starsHTML;
    }
    function renderReviews() {
        reviewsContainer.innerHTML = '';
        if (reviews.length === 0) {
            reviewsContainer.innerHTML = `<div class="md:col-span-2 text-center text-[var(--text-secondary)] p-8">No reviews yet. Be the first to share your experience!</div>`;
        } else {
            reviews.forEach(review => {
                const reviewCard = document.createElement('div');
                reviewCard.className = 'card';
                reviewCard.innerHTML = `
                    <div class="star-rating !justify-start mb-2">${renderStars(review.rating)}</div>
                    <p class="text-[var(--text-secondary)] mb-4 flex-1 italic">"${review.text}"</p>
                    <p class="font-bold text-right text-[var(--text-primary)]">- ${review.name}</p>
                    ${review.company ? `<p class="text-sm text-right text-[var(--text-secondary)]">${review.company}</p>` : ''}
                `;
                reviewsContainer.appendChild(reviewCard);
            });
        }
    }
    if (starRatingContainer && ratingValueInput) {
        const maxStars = 5;
        for (let i = 1; i <= maxStars; i++) {
            const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            star.setAttribute('viewBox', '0 0 24 24');
            star.setAttribute('fill', 'currentColor');
            star.dataset.value = i;
            star.innerHTML = `<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>`;
            starRatingContainer.appendChild(star);
        }
        const stars = starRatingContainer.querySelectorAll('svg');
        function updateStarsUI(rating, isHover = false) {
            stars.forEach(star => {
                star.classList.remove('selected', 'hovered');
                if (star.dataset.value <= rating) {
                    star.classList.add(isHover ? 'hovered' : 'selected');
                }
            });
        }
        starRatingContainer.addEventListener('mouseover', e => {
            if (e.target.closest('svg')) {
                updateStarsUI(e.target.closest('svg').dataset.value, true);
            }
        });
        starRatingContainer.addEventListener('mouseout', () => updateStarsUI(currentRating));
        starRatingContainer.addEventListener('click', e => {
            const star = e.target.closest('svg');
            if (star) {
                currentRating = star.dataset.value;
                ratingValueInput.value = currentRating;
                updateStarsUI(currentRating);
            }
        });
        renderReviews();
    }
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (ratingValueInput.value === "0") {
                alert("Please select a star rating before submitting.");
                return;
            }
            const formData = new FormData(reviewForm);
            reviews.push({
                rating: formData.get('rating'),
                name: formData.get('name'),
                company: formData.get('company'),
                text: formData.get('review')
            });
            alert('Thank you for your review! It has been submitted successfully.');
            reviewForm.reset();
            ratingValueInput.value = "0";
            currentRating = 0;
            updateStarsUI(0);
            renderReviews();
        });
    }
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            gsap.to(window, { duration: 1, scrollTo: { y: this.getAttribute('href'), offsetY: 70 }, ease: 'power2.inOut' });
        });
    });

    function initHeroAnimations() {
        const heroTl = gsap.timeline();
        heroTl.fromTo('h1.hero-headline', { y: 50, opacity: 0 }, { duration: 1, y: 0, opacity: 1, ease: "power2.out" })
        .fromTo('.hero-subheadline', { y: 30, opacity: 0 }, { duration: 0.8, y: 0, opacity: 1, ease: "power2.out" }, "-=0.5")
        .fromTo('p.max-w-3xl', { y: 30, opacity: 0 }, { duration: 0.8, y: 0, opacity: 1, ease: "power2.out" }, "-=0.3")
        .fromTo('a.btn-primary', { y: 20, opacity: 0 }, { duration: 0.6, y: 0, opacity: 1, ease: "power2.out" }, "-=0.2")
        .fromTo('#home .card', { y: 40, opacity: 0 }, { duration: 0.8, y: 0, opacity: 1, stagger: 0.2, ease: "power2.out" }, "-=0.3");
    }
    
    function initScrollAnimations() {
        gsap.utils.toArray('section:not(#home) .card').forEach(card => {
            gsap.from(card, {
                scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none none" },
                y: 60, opacity: 0, duration: 0.8, ease: "power2.out"
            });
        });
        gsap.utils.toArray('section h2').forEach(heading => {
            gsap.from(heading, {
                scrollTrigger: { trigger: heading, start: "top 85%", toggleActions: "play none none none" },
                y: 40, opacity: 0, duration: 1, ease: "power2.out"
            });
        });
        const processTimeline = document.getElementById('process-timeline');
        if (processTimeline) {
            const steps = gsap.utils.toArray("#process-timeline .relative > div");
            gsap.from(steps, {
                scrollTrigger: { trigger: processTimeline, start: "top 70%", toggleActions: "play none none none" },
                opacity: 0, y: 50, stagger: 0.3, duration: 0.8, ease: 'power2.out'
            });
        }
        document.querySelectorAll('.interactive-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => gsap.to(btn, { y: -2, duration: 0.2, ease: 'power2.out' }));
            btn.addEventListener('mouseleave', () => gsap.to(btn, { y: 0, duration: 0.2, ease: 'power2.out' }));
        });
    }

    initHeroAnimations();
    initScrollAnimations();
});