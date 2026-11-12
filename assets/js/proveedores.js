
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
            "-"
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
