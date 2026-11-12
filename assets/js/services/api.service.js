
import { API_URL } from "../config/api.js";

export async function obtenerProductos() {
    const respuesta = await fetch(
        `${API_URL}?accion=listarProductos`
    );

    if (!respuesta.ok) {
        throw new Error("Error de comunicación con el servidor.");
    }

    const datos = await respuesta.json();

    if (!datos.success) {
        throw new Error(datos.mensaje || "Error al consultar productos.");
    }

    return datos.productos;
}
