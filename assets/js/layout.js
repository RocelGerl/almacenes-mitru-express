document.addEventListener('DOMContentLoaded', async () => {
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
    const navbarPlaceholder = document.getElementById('navbar-placeholder');

    try {
        if (sidebarPlaceholder) {
            const res = await fetch('components/sidebar.html');
            sidebarPlaceholder.innerHTML = await res.text();
        }

        if (navbarPlaceholder) {
            const res = await fetch('components/navbar.html');
            navbarPlaceholder.innerHTML = await res.text();
        }

        const paginaActual = window.location.pathname.split('/').pop() || 'dashboard.html';
        document.querySelectorAll('.cuerpo-sidebar li[data-page]').forEach(li => {
            if (li.dataset.page === paginaActual) {
                li.style.backgroundColor = 'var(--azul-secundario)';
                li.style.borderLeft = '3px solid var(--celeste)';
            }
        });

        const links = document.querySelectorAll('a[href$=".html"]');
        links.forEach(link => {
            const url = link.getAttribute('href');
            if (url && !url.startsWith('http')) {
                const prefetch = document.createElement('link');
                prefetch.rel = 'prefetch';
                prefetch.href = url;
                document.head.appendChild(prefetch);
            }
        });

        document.dispatchEvent(new Event('layoutListo'));
    } catch (err) {
        console.error('Error cargando componentes:', err);
    }
});

