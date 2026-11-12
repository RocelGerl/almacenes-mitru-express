const formulario = document.getElementById("formulario");
let usuario = document.getElementById("usuario");
let contrasena = document.getElementById("contrasena");
let boton = document.getElementById("submit");
let contador = 0;

let usuarios = [
    {
        usuario: "rocel",
        contrasena: "123",
        tipo: "admin"
    },
    {
        usuario: "daniela",
        contrasena: "123",
        tipo: "ayb"
    },
    {
        usuario: "andres",
        contrasena: "123",
        tipo: "operaciones"
    }
];

formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    if (usuario.value !== "" && contrasena.value !== "") {
        let encontrado = usuarios.find(u => u.usuario === usuario.value.trim().toLowerCase() && u.contrasena === contrasena.value);

        if (!encontrado) {
            contador++;
            if (contador >= 3) {
                alert("Demasiados intentos por hoy, ponte en contacto con tu jefe superior directo");
                usuario.value = "";
                contrasena.value = "";
                usuario.disabled = true;
                contrasena.disabled = true;
                boton.disabled = true;
                boton.style.cursor = "no-drop";
                contador = 0;
            } else {
                alert(`Credenciales Incorrectas, te quedan ${3 - contador} intentos`);
                usuario.value = "";
                contrasena.value = "";
                usuario.focus();
            }
        } else {
            if (encontrado.tipo === "admin") {
                window.location.href = "pages/dashboard.html";
            } else if (encontrado.tipo === "ayb") {
                alert("Bienvenido al panel de A&B");
            } else if (encontrado.tipo === "operaciones") {
                alert("Bienvenido al panel de Operaciones");
            } else {
                alert("No se encontro tu area de trabajo")
            }
        }
    } else {
        alert("Llena todos los campos")
    }
})