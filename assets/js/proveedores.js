
import { obtenerProveedores } from "/assets/js/services/api.service.js";

document.addEventListener("DOMContentLoaded", cargarProveedores);

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

        console.log("Proveedores recibidos:", proveedores);

        const filas = proveedores.map((proveedor, indice) => [
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
            `
            <div class="acciones-tabla">
                <button type="button" class="btn-accion btn-editar" data-id="${proveedor.id}" title="Editar">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" class="btn-accion btn-eliminar" data-id="${proveedor.id}" data-nombre="${escaparHTML(proveedor.nombre)}" title="Borrar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            `
        ]);

        if (DataTable.isDataTable("#tablaProveedores")) {
            new DataTable("#tablaProveedores").destroy();
        }

        cuerpo.innerHTML = "";

        new DataTable("#tablaProveedores", {
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

        console.log("Proveedores cargados:", proveedores.length);

    } catch (error) {
        console.error("Error al cargar proveedores:", error);

        cuerpo.innerHTML = `
            <tr>
                <td colspan="11">Error al cargar los proveedores.</td>
            </tr>
        `;
    }
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

let inventario = [];
let productosSeleccionados = [];

async function cargarInventario() {
    try {
        const res = await fetch('/api/inventario');
        inventario = await res.json();
        renderProductos(inventario);
    } catch (e) {
        console.error('No se pudo cargar inventario', e);
    }
}

function renderProductos(lista) {
    const cont = document.getElementById('productosLista');
    if (!cont) return;
    cont.innerHTML = lista.map(p => `
        <div class="producto-item ${productosSeleccionados.includes(p.nombre) ? 'seleccionado' : ''}"
             data-nombre="${p.nombre}">${p.nombre}</div>
    `).join('');
    cont.querySelectorAll('.producto-item').forEach(el => {
        el.addEventListener('click', () => toggleProducto(el.dataset.nombre));
    });
}

function toggleProducto(nombre) {
    const i = productosSeleccionados.indexOf(nombre);
    if (i >= 0) productosSeleccionados.splice(i, 1);
    else productosSeleccionados.push(nombre);
    document.getElementById('provProductos').value = productosSeleccionados.join(', ');
    renderProductos(inventario);
    renderChipsProductos();
}

function renderChipsProductos() {
    const cont = document.getElementById('productosSeleccionados');
    if (!cont) return;
    cont.innerHTML = productosSeleccionados.map(n => `
        <span class="chip-producto">${n}
            <button type="button" data-nombre="${n}"><i class="fa-solid fa-xmark"></i></button>
        </span>
    `).join('');
    cont.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => toggleProducto(b.dataset.nombre));
    });
}

document.getElementById('buscarProducto')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    renderProductos(inventario.filter(p => p.nombre.toLowerCase().includes(q)));
});

document.getElementById('tablaProveedores')?.addEventListener('click', async e => {
    const btnEdit = e.target.closest('.btn-editar');
    const btnDel = e.target.closest('.btn-eliminar');
    if (btnEdit) {
        const res = await fetch(`/api/proveedores/${btnEdit.dataset.id}`);
        if (res.ok) abrirModalEditar(await res.json());
    }
    if (btnDel) {
        if (!confirm(`¿Eliminar al proveedor "${btnDel.dataset.nombre}"?`)) return;
        const res = await fetch(`/api/proveedores/${btnDel.dataset.id}`, { method: 'DELETE' });
        if (res.ok) cargarProveedores();
    }
});

function abrirModalEditar(prov) {
    document.getElementById('provNombre').value = prov.nombre || '';
    document.getElementById('provPreventista').value = prov.contacto || '';
    document.getElementById('provTelefono').value = prov.telefono || '';
    document.getElementById('provDireccion').value = prov.direccion || '';
    document.getElementById('provDiasEntrega').value = prov.dias_entrega || '';
    document.getElementById('provCantidadMinima').value = prov.cantidad_minima || '';
    document.getElementById('provUnidad').value = prov.unidad || 'Unidad';

    const dias = (prov.dias_pedido || '').split(',').map(s => s.trim());
    document.querySelectorAll('#diasPedido input').forEach(inp => {
        inp.checked = dias.includes(inp.value);
    });

    productosSeleccionados = (prov.productos || '').split(',').map(s => s.trim()).filter(Boolean);
    document.getElementById('provProductos').value = productosSeleccionados.join(', ');
    renderChipsProductos();
    renderProductos(inventario);

    document.querySelector('#modalAgregarProveedor .modal-title').innerHTML =
        '<i class="fa-solid fa-pen-to-square"></i> Editar Proveedor';
    document.getElementById('modalAgregarProveedor').dataset.id = prov.id;
    document.getElementById('modalAgregarProveedor').showModal();
}

document.addEventListener('DOMContentLoaded', cargarInventario);
