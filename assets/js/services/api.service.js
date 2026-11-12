
import { API_URL } from "/assets/js/config/api.js";

export async function obtenerProductos() {
    try {
        const respuesta = await fetch(
            `${API_URL}?accion=listarProductos`
        );

        if (!respuesta.ok) {
            throw new Error("Error de comunicación con el servidor.");
        }

        const datos = await respuesta.json();

        console.log("Respuesta de Google Sheets:", datos);

        if (!datos.success) {
            throw new Error(
                datos.mensaje || "Error al consultar productos."
            );
        }

        if (!Array.isArray(datos.productos)) {
            console.error("La propiedad productos no existe:", datos);
            throw new Error("La API no está devolviendo la lista de productos.");
        }

        return datos.productos;

    } catch (error) {
        console.error("Error en obtenerProductos():", error);
        throw error;
    }
}
