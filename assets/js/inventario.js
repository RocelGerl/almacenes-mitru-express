import { obtenerProductos } from "/assets/js/services/api.service.js";

document.addEventListener("DOMContentLoaded", cargarInventario);

const productosCache = [];

async function cargarInventario() {
    const cuerpo = document.querySelector("#tablaInventario tbody");

    if (!cuerpo) {
        console.error("No se encontró el cuerpo de la tabla de inventario.");
        return;
    }

    try {
        cuerpo.innerHTML = `
            <tr>
                <td colspan="13">Cargando productos...</td>
            </tr>
        `;

        const productos = await obtenerProductos();

        if (!Array.isArray(productos)) {
            throw new Error("obtenerProductos() no devolvió un arreglo.");
        }

        productosCache.length = 0;
        productos.forEach(p => productosCache.push(p));

        const filas = productos.map((producto, indice) => {
            const id = indice;
            return [
                indice + 1,
                "Sin imagen",
                escaparHTML(producto.nombre),
                escaparHTML(producto.proveedor || "Sin proveedor"),
                escaparHTML(producto.marca || "Sin marca"),
                escaparHTML(producto.stock),
                escaparHTML(producto.estado),
                escaparHTML(producto.stock_minimo),
                "-",
                escaparHTML(producto.unidad),
                "-",
                `Bs ${Number(producto.precio || 0).toFixed(2)}`,
                crearBotones(id)
            ];
        });

        if (DataTable.isDataTable("#tablaInventario")) {
            new DataTable("#tablaInventario").destroy();
        }

        cuerpo.innerHTML = "";

        window.tablaInventario = new DataTable("#tablaInventario", {
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
                emptyTable: "No hay productos registrados"
            }
        });

        enlazarBotones(cuerpo);

    } catch (error) {
        console.error("Error al cargar inventario:", error);
        cuerpo.innerHTML = `
            <tr>
                <td colspan="13">Error al cargar los productos.</td>
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
            const producto = productosCache[id];
            if (!producto) return;

            const filaNode = btn.closest('tr');
            const datos = {
                nombre: producto.nombre || '',
                proveedor: producto.proveedor || '',
                cantidad: producto.stock || '',
                estado: producto.estado || '',
                minimo: producto.stock_minimo || '',
                peso: producto.peso || '',
                unidad: producto.unidad || '',
                cantidadPeso: producto.cantidad_peso || '',
                precio: producto.precio || '',
                imagen: producto.foto || null,
                __rellenar: () => {
                    document.getElementById('prodNombre').value = producto.nombre || '';
                    document.getElementById('prodProveedor').value = producto.proveedor || '';
                    document.getElementById('prodCantidad').value = producto.stock || '';
                    document.getElementById('prodEstado').value = producto.estado || '';
                    document.getElementById('prodMinimo').value = producto.stock_minimo || '';
                    document.getElementById('prodPeso').value = producto.peso || '';
                    document.getElementById('prodUnidad').value = producto.unidad || '';
                    document.getElementById('prodCantidadPeso').value = producto.cantidad_peso || '';
                    document.getElementById('prodPrecio').value = producto.precio || '';
                }
            };
            window.__editarFila(filaNode, datos);
        });
    });

    contenedor.querySelectorAll('.accion-eliminar').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            const producto = productosCache[id];
            const filaNode = btn.closest('tr');
            window.__eliminarFila(filaNode, producto?.nombre || 'producto');
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
