import { obtenerProveedores } from "/assets/js/services/api.service.js";

document.addEventListener("DOMContentLoaded", cargarProveedores);

const proveedoresCache = [];

async function cargarProveedores() {
    const cuerpo = document.querySelector("#tablaProveedores tbody");

    if (!cuerpo) {
        console.error("No se encontró la tabla de proveedores.");
        return;
    }

    try {
        cuerpo.innerHTML = `
            <tr>
                <td colspan="11">Cargando proveedores...</td>
            </tr>
        `;

        const proveedores = await obtenerProveedores();

        proveedoresCache.length = 0;
        proveedores.forEach(p => proveedoresCache.push(p));

        const filas = proveedores.map((proveedor, indice) => {
            const id = indice;
            return [
                indice + 1,
                proveedor.foto
                    ? `<img src="${escaparHTML(proveedor.foto)}" width="40" height="40" style="object-fit:cover;border-radius:8px">`
                    : "Sin imagen",
                escaparHTML(proveedor.nombre),
                escaparHTML(proveedor.contacto),
                escaparHTML(proveedor.telefono),
                escaparHTML(proveedor.dias_pedido),
                escaparHTML(proveedor.dias_entrega),
                escaparHTML(proveedor.cantidad_minima),
                escaparHTML(proveedor.direccion),
                escaparHTML(proveedor.productos),
                crearBotones(id)
            ];
        });

        if (DataTable.isDataTable("#tablaProveedores")) {
            new DataTable("#tablaProveedores").destroy();
        }

        cuerpo.innerHTML = "";

        window.tablaProveedores = new DataTable("#tablaProveedores", {
            data: filas,
            scrollX: true,
            language: {
                url: "https://cdn.datatables.net/plug-ins/2.3.3/i18n/es-ES.json",
                search: "Buscar:",
                lengthMenu: "Mostrar _MENU_ registros",
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                paginate: {
                    first: "Primero",
                    last: "Último",
                    next: "Siguiente",
                    previous: "Anterior"
                },
                emptyTable: "No hay proveedores registrados"
            }
        });

        enlazarBotones(cuerpo);

    } catch (error) {
        console.error("Error al cargar proveedores:", error);
        cuerpo.innerHTML = `
            <tr>
                <td colspan="11">Error al cargar los proveedores.</td>
            </tr>
        `;
    }
}

function crearBotones(id) {
    return `
        <div style="display:flex;gap:6px;justify-content:center;">
            <button type="button" class="accion-editar" data-id="${id}" title="Editar"
                style="background:#fd9f21;color:white;border:none;border-radius:6px;padding:6px 8px;cursor:pointer;">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" class="accion-eliminar" data-id="${id}" title="Eliminar"
                style="background:#ce2a3a;color:white;border:none;border-radius:6px;padding:6px 8px;cursor:pointer;">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
}

function enlazarBotones(contenedor) {
    contenedor.querySelectorAll('.accion-editar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            const proveedor = proveedoresCache[id];
            if (!proveedor) return;

            const filaNode = btn.closest('tr');
            const datos = {
                nombre: proveedor.nombre || '',
                preventista: proveedor.contacto || '',
                telefono: proveedor.telefono || '',
                direccion: proveedor.direccion || '',
                diasPedido: proveedor.dias_pedido || '',
                diasEntrega: proveedor.dias_entrega || '',
                cantidadMinima: proveedor.cantidad_minima || '',
                unidad: proveedor.unidad || 'Unidad',
                productos: proveedor.productos || '',
                imagen: proveedor.foto || null,
                __rellenar: () => {
                    document.getElementById('provNombre').value = proveedor.nombre || '';
                    document.getElementById('provPreventista').value = proveedor.contacto || '';
                    document.getElementById('provTelefono').value = proveedor.telefono || '';
                    document.getElementById('provDireccion').value = proveedor.direccion || '';
                    document.getElementById('provDiasEntrega').value = proveedor.dias_entrega || '';
                    document.getElementById('provCantidadMinima').value = proveedor.cantidad_minima || '';
                    document.getElementById('provUnidad').value = proveedor.unidad || 'Unidad';
                    const dias = (proveedor.dias_pedido || '').split(',').map(s => s.trim());
                    document.querySelectorAll('#diasPedido input').forEach(inp => {
                        inp.checked = dias.includes(inp.value);
                    });
                    document.getElementById('provProductos').value = proveedor.productos || '';
                }
            };
            window.__editarFila(filaNode, datos);
        });
    });

    contenedor.querySelectorAll('.accion-eliminar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            const proveedor = proveedoresCache[id];
            const filaNode = btn.closest('tr');
            window.__eliminarFila(filaNode, proveedor?.nombre || 'proveedor');
        });
    });
}

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}
