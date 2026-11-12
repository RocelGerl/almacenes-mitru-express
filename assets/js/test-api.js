
import { verificarConexion } from "/assets/js/services/api.service.js";

async function probarAPI() {
    console.log("Comprobando conexión con Google Sheets...");

    const resultado = await verificarConexion();

    console.log("Respuesta de la API:", resultado);

    if (resultado.success) {
        console.log("CONEXIÓN EXITOSA");
        console.log("Base de datos:", resultado.baseDatos);
        console.log("Hojas:", resultado.hojas);
    } else {
        console.error("ERROR DE CONEXIÓN:", resultado.mensaje);
    }
}

probarAPI();
