document.addEventListener('DOMContentLoaded', function () {
    new DataTable('#tablaProveedores');
    new DataTable('#tablaInventario');
});

new DataTable('#tablaProveedores', {
    scrollX: true,
    language: {
        url: 'https://cdn.datatables.net/plug-ins/2.3.3/i18n/es-ES.json',
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ registros",
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior"
        }
    }
});

new DataTable('#tablaInventario', {
    scrollX: true,
    language: {
        url: 'https://cdn.datatables.net/plug-ins/2.3.3/i18n/es-ES.json',
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ registros",
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior"
        }
    }
});



