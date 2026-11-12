document.addEventListener('DOMContentLoaded', async () => {
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    const preloader = document.getElementById('preloader');
    const tiempoMinimo = 700; 

    const inicioCarga = Date.now();

    if (!sidebarPlaceholder && !navbarPlaceholder) {
        if (preloader) preloader.classList.add('oculto');
        return;
    }

    try {
        const peticiones = [];
        if (sidebarPlaceholder) peticiones.push(fetch('/pages/components/sidebar.html'));
        if (navbarPlaceholder) peticiones.push(fetch('/pages/components/navbar.html'));

        const respuestas = await Promise.all(peticiones);

        if (sidebarPlaceholder) {
            sidebarPlaceholder.innerHTML = await respuestas[0].text();
        }
        if (navbarPlaceholder) {
            const index = sidebarPlaceholder ? 1 : 0;
            navbarPlaceholder.innerHTML = await respuestas[index].text();
        }

        const paginaActual = window.location.pathname.split('/').pop() || 'dashboard.html';
        document.querySelectorAll('.cuerpo-sidebar li[data-page]').forEach(li => {
            if (li.dataset.page === paginaActual) {
                li.style.backgroundColor = 'var(--azul-secundario)';
                li.style.borderLeft = '3px solid var(--celeste)';
            }
        });

        document.dispatchEvent(new Event('layoutListo'));

        const tiempoTranscurrido = Date.now() - inicioCarga;
        
        const tiempoRestante = Math.max(0, tiempoMinimo - tiempoTranscurrido);

        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('oculto');
                document.body.classList.remove('cargando');
            }
        }, tiempoRestante);

    } catch (err) {
        console.error('Error cargando layout:', err);
        if (preloader) {
            preloader.classList.add('oculto');
            document.body.classList.remove('cargando');
        }
    }
});