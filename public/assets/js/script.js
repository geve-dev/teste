// 1. Obter o formulário pelo ID
const form = document.getElementById('contact-form');
const statusDiv = document.getElementById('form-status');
const statusTitle = statusDiv?.querySelector('.status-title');
const statusMessage = statusDiv?.querySelector('.status-message');
const statusIcon = statusDiv?.querySelector('.status-icon i');
const statusProgress = statusDiv?.querySelector('.status-progress');

function showStatus(type, title, message, iconClass) {
    if (!statusDiv) return;
    statusDiv.hidden = false;
    statusDiv.style.display = 'block';
    statusDiv.classList.remove('success', 'error', 'loading');
    statusDiv.classList.add(type);
    if (statusTitle) statusTitle.textContent = title;
    if (statusMessage) statusMessage.textContent = message;
    if (statusIcon) {
        statusIcon.className = iconClass;
    }
    if (type === 'loading') {
        if (statusProgress) statusProgress.style.display = 'block';
    } else {
        if (statusProgress) statusProgress.style.display = 'none';
    }
}

function hideStatus(delay = 6000) {
    if (!statusDiv) return;
    setTimeout(() => {
        statusDiv.style.display = 'none';
        statusDiv.hidden = true;
    }, delay);
}

// Submit on Enter in textarea
const messageInput = document.getElementById('message');
if (messageInput) {
    messageInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            form.requestSubmit();
        }
    });
}

// 2. Adicionar o Listener para o evento de submit
form.addEventListener("submit", async function (event) {
    event.preventDefault(); // Impede o envio padrão (que te levaria para a tela do Formspree)

    showStatus('loading', 'Enviando', 'Enviando sua mensagem... Aguarde.', 'fa-solid fa-circle-notch fa-spin');

    const data = new FormData(form); // Cria um objeto com os dados do formulário
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
        params.append(key, value);
    }
    // Renomeia 'message' -> 'mensagem' para compatibilidade com o backend
    if (params.has('message')) {
        params.set('mensagem', params.get('message'));
        params.delete('message');
    }

    try {
        // 3. Enviar os dados para o Formspree usando Fetch API
        const response = await fetch(event.target.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json'
            },
            body: params.toString()
        });

        if (response.ok) {
            // 4. Se o envio for bem-sucedido
            showStatus('success', 'Mensagem enviada', '✅ Recebi sua mensagem! Em breve retorno o contato.', 'fa-solid fa-check');
            form.reset(); // Limpa os campos do formulário
            hideStatus(5000);
        } else {
            // 5. Se houver um erro no envio (ex: campos inválidos, limite de envio)
            let responseData = {};
            try { responseData = await response.json(); } catch { }
            const errorMsg = responseData.error || 'Ocorreu um erro no envio. Tente novamente mais tarde.';
            showStatus('error', 'Falha no envio', `❌ ${errorMsg}`, 'fa-solid fa-triangle-exclamation');
        }
    } catch (error) {
        // 6. Se houver um erro de rede (conexão)
        showStatus('error', 'Erro de conexão', '❌ Verifique sua conexão com a internet e tente novamente.', 'fa-solid fa-wifi');
        console.error('Erro de rede:', error);
    }
});


// Reveal on scroll using IntersectionObserver
const revealOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px', // start a bit before fully in view
    threshold: 0.1
};

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.getAttribute('data-delay');
            if (delay) el.style.setProperty('--delay', `${parseInt(delay, 20)}ms`);
            el.classList.add('show');
            observer.unobserve(el);
        }
    });
}, revealOptions);

document.querySelectorAll('.reveal').forEach((el) => {
    // ensure initial hidden state if loaded mid-page
    el.classList.remove('show');
    revealObserver.observe(el);
});

// 3D tilt hover for skill cards (no HTML changes required)
(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover) return;

    const cards = document.querySelectorAll('.skill, .card');
    const maxTilt = 15; // degrees
    const baseLift = -5; // px

    cards.forEach((card) => {
        let raf = null;
        let rx = 0, ry = 0;

        function apply() {
            card.style.transform = `translateY(${baseLift}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
            raf = null;
        }

        function onEnter() {
            // start with base lift
            card.style.transition = 'transform 150ms ease, box-shadow 150ms ease';
            card.style.transform = `translateY(${baseLift}px)`;
        }

        function onMove(e) {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);  // -1 .. 1
            const dy = (e.clientY - cy) / (rect.height / 2); // -1 .. 1
            ry = dx * maxTilt;      // left/right => rotateY
            rx = -dy * maxTilt;     // up/down    => rotateX
            if (!raf) raf = requestAnimationFrame(apply);
        }

        function onLeave() {
            card.style.transition = 'transform 250ms ease, box-shadow 150ms ease';
            card.style.transform = '';
        }

        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
    });
})();

// Theme Switcher
(() => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggle?.querySelector('i');
    const homeIcon = document.querySelector('.gv-icon .perfil1');
    const defaultHomeIconSrc = 'assets/imgs/gv-icon1.png';
    const purpleHomeIconSrc = 'assets/imgs/gv-icon-purple.png';
    const codeIcon = document.querySelector('.gv-icon .code');
    const defaultCodeIconSrc = 'assets/imgs/code-icon.png';
    const purpleCodeIconSrc = 'assets/imgs/code-icon-purple.png';

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        if (icon) icon.className = 'fa-solid fa-sun';
        if (homeIcon) homeIcon.src = purpleHomeIconSrc;
        if (codeIcon) codeIcon.src = purpleCodeIconSrc;
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            const isLight = body.classList.contains('light-theme');

            // Update icon
            if (icon) {
                icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            }

            // Update home GV and code icons based on theme
            if (homeIcon) {
                homeIcon.src = isLight ? purpleHomeIconSrc : defaultHomeIconSrc;
            }
            if (codeIcon) {
                codeIcon.src = isLight ? purpleCodeIconSrc : defaultCodeIconSrc;
            }

            // Save preference
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('.nav-links li a');

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-xmark');
            }
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-xmark');
                }
            });
        });
    }
})();