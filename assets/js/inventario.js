import { obtenerProductos } from "/assets/js/services/api.service.js";

document.addEventListener("DOMContentLoaded", cargarInventario);

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

        console.log("Productos recibidos:", productos);

        if (!Array.isArray(productos)) {
            throw new Error("obtenerProductos() no devolvió un arreglo.");
        }

        const botonesAcciones = `
            <div style="display:flex;gap:6px;justify-content:center;">
                <button type="button" class="accion-editar" title="Editar"
                    style="background:#fd9f21;color:white;border:none;border-radius:6px;padding:6px 8px;cursor:pointer;">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" class="accion-eliminar" title="Eliminar"
                    style="background:#ce2a3a;color:white;border:none;border-radius:6px;padding:6px 8px;cursor:pointer;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        const filas = productos.map((producto, indice) => [
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
            botonesAcciones
        ]);

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

        console.log("Productos cargados:", productos.length);

    } catch (error) {
        console.error("Error al cargar inventario:", error);

        cuerpo.innerHTML = `
            <tr>
                <td colspan="13">Error al cargar los productos.</td>
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
