document.addEventListener('layoutListo', () => {
    const hamburguesa = document.getElementById('hamburguesa');
    const sidebar = document.querySelector('.sidebar');
    const btnUsuario = document.getElementById('btn-usuario');
    const menuUsuario = document.getElementById('menu-usuario');
    const chevronUsuario = document.getElementById('chevron-usuario');

    if (hamburguesa && sidebar) {
        hamburguesa.addEventListener('click', function () {
            sidebar.classList.toggle('sidebar-oculto');
        });
    }

    if (btnUsuario && menuUsuario) {
        btnUsuario.addEventListener('click', function (e) {
            e.stopPropagation();
            document.body.classList.toggle('menu-abierto');
        });

        document.addEventListener('click', function (e) {
            if (!menuUsuario.contains(e.target) && !btnUsuario.contains(e.target)) {
                document.body.classList.remove('menu-abierto');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                document.body.classList.remove('menu-abierto');
            }
        });
    }
});