
import { obtenerProductos } from "./services/api.service.js";

document.addEventListener("DOMContentLoaded", cargarInventario);

async function cargarInventario() {
    const cuerpo = document.querySelector("#tablaInventario tbody");

    try {
        cuerpo.innerHTML = `
            <tr>
                <td colspan="13">Cargando productos...</td>
            </tr>
        `;

        const productos = await obtenerProductos();

        const filas = productos.map((producto, indice) => [
            indice + 1,
            "Sin imagen",
            escaparHTML(producto.nombre),
            escaparHTML(producto.proveedor),
            escaparHTML(producto.marca),
            escaparHTML(producto.stock),
            escaparHTML(producto.estado),
            escaparHTML(producto.stock_minimo),
            "-",
            escaparHTML(producto.unidad),
            "-",
            escaparHTML(producto.precio),
            "-"
        ]);

        if (DataTable.isDataTable("#tablaInventario")) {
            new DataTable("#tablaInventario").destroy();
        }

        cuerpo.innerHTML = "";

        new DataTable("#tablaInventario", {
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

        console.log("Productos cargados:", productos);

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
