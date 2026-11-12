
import { API_URL } from "/assets/js/config/api.js";

export async function verificarConexion() {
    try {
        const respuesta = await fetch(API_URL);
        const datos = await respuesta.json();

        return datos;
    } catch (error) {
        console.error("Error al conectar con la API:", error);

        return {
            success: false,
            mensaje: "No se pudo conectar con el servidor."
        };
    }
}
