// const hamburguesa = document.getElementById("hamburguesa");
const date = new Date();
const fecha = document.getElementById("fecha");
const hora = document.getElementById("hora");
let caja = document.querySelector(".cajas");
const datos = [
    {
        icono: "fa-solid fa-clipboard-list",
        nro: 125,
        nombre: "Pedidos Totales",
        indice: "+12"
    },
    {
        icono: "fa-solid fa-boxes-stacked",
        nro: 845,
        nombre: "Productos en Stock",
        indice: "+5"
    },
    {
        icono: "fa-solid fa-triangle-exclamation",
        nro: 12,
        nombre: "Stock Bajo",
        indice: "-2"
    },
    {
        icono: "fa-solid fa-cart-shopping",
        nro: 24850,
        nombre: "Compras del Mes",
        indice: "+12"
    }
]

const MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];


function actualizarFechaHora() {
    const ahora = new Date();

    const dia = ahora.getDate();
    const mes = MESES[ahora.getMonth()];
    const anio = ahora.getFullYear();

    const horas = String(ahora.getHours()).padStart(2, "0");
    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const segundos = String(ahora.getSeconds()).padStart(2, "0");

    fecha.textContent =
        `${dia} de ${mes} de ${anio}`;

    hora.textContent =
        `${horas}:${minutos}:${segundos}`;
}

actualizarFechaHora();
setInterval(actualizarFechaHora, 1000);

datos.forEach(d => {
    caja.innerHTML += `
    <div class="caja">            
    <i class="${d.icono}"></i>
    <div class="valores">
        <h2>${d.nro}</h2> 
        <p>${d.nombre}</p>
        <span>${d.indice}%</span>
    </div>
    <div class="ola-estadistica"></div>
     </div>
    `
});