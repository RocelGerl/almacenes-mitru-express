document.addEventListener('DOMContentLoaded', function () {

    function configurarModal(opciones) {
        const {
            modal,
            form,
            btnAgregar,
            btnCerrar,
            btnCancelar,
            dropzone,
            inputImagen,
            imagenPreview,
            btnAbrirCamara,
            datosAlGuardar,
            tablaGlobal
        } = opciones;

        if (!modal || !form || !btnAgregar) return;

        const modalCamara = document.getElementById('modalCamara');
        const video = document.getElementById('videoCamara');
        const canvas = document.getElementById('canvasCamara');
        const overlay = document.getElementById('camaraOverlay');
        const btnCapturar = document.getElementById('btnCapturarFoto');
        const btnCerrarCamara = document.getElementById('cerrarCamara');
        const btnCambiarCamara = document.getElementById('btnCambiarCamara');

        let imagenData = null;
        let streamActual = null;
        let camarasDisponibles = [];
        let indiceCamaraActual = 0;

        function mostrarImagen(src) {
            imagenPreview.innerHTML = `
                <img src="${src}" alt="Imagen">
                <button type="button" class="btn-quitar-imagen" id="btnQuitarImagen" title="Quitar imagen">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;
            imagenPreview.classList.add('tiene-imagen');
            imagenData = src;
            document.getElementById('btnQuitarImagen').addEventListener('click', (e) => {
                e.stopPropagation();
                quitarImagen();
            });
        }

        function quitarImagen() {
            imagenData = null;
            imagenPreview.classList.remove('tiene-imagen');
            imagenPreview.innerHTML = `
                <div class="placeholder-icono"><i class="fa-regular fa-image"></i></div>
                <div class="placeholder-texto">Sin imagen<br>seleccionada</div>
                <button type="button" class="btn-quitar-imagen" id="btnQuitarImagen" title="Quitar imagen">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;
            document.getElementById('btnQuitarImagen').addEventListener('click', (e) => {
                e.stopPropagation();
                quitarImagen();
            });
            inputImagen.value = '';
        }

        function leerArchivo(file) {
            if (!file || !file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => mostrarImagen(e.target.result);
            reader.readAsDataURL(file);
        }

        dropzone.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            inputImagen.click();
        });

        inputImagen.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        inputImagen.addEventListener('change', (e) => {
            e.stopPropagation();
            if (inputImagen.files && inputImagen.files[0]) {
                leerArchivo(inputImagen.files[0]);
            }
        });

        ['dragenter', 'dragover'].forEach(ev => {
            dropzone.addEventListener(ev, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('arrastrando');
            });
        });

        ['dragleave', 'drop'].forEach(ev => {
            dropzone.addEventListener(ev, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('arrastrando');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            leerArchivo(file);
        });

        async function cargarCamaras() {
            try {
                const dispositivos = await navigator.mediaDevices.enumerateDevices();
                camarasDisponibles = dispositivos.filter(d => d.kind === 'videoinput');
                btnCambiarCamara.disabled = camarasDisponibles.length < 2;
            } catch (err) {
                console.error(err);
                btnCambiarCamara.disabled = true;
            }
        }

        async function iniciarStream(deviceId) {
            if (streamActual) {
                streamActual.getTracks().forEach(t => t.stop());
                streamActual = null;
            }
            const constraints = {
                audio: false,
                video: deviceId
                    ? { deviceId: { exact: deviceId }, width: { ideal: 1280 } }
                    : { facingMode: 'environment', width: { ideal: 1280 } }
            };
            streamActual = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = streamActual;
        }

        async function abrirCamara() {
            overlay.style.display = 'flex';
            overlay.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Iniciando cámara...';
            modalCamara.showModal();
            try {
                await cargarCamaras();
                const deviceId = camarasDisponibles[indiceCamaraActual]?.deviceId;
                await iniciarStream(deviceId);
                overlay.style.display = 'none';
            } catch (err) {
                overlay.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> No se pudo acceder a la cámara';
                console.error(err);
            }
        }

        function detenerCamara() {
            if (streamActual) {
                streamActual.getTracks().forEach(t => t.stop());
                streamActual = null;
            }
            video.srcObject = null;
        }

        btnAbrirCamara.addEventListener('click', (e) => {
            e.stopPropagation();
            indiceCamaraActual = 0;
            abrirCamara();
        });

        btnCambiarCamara.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (camarasDisponibles.length < 2) return;

            indiceCamaraActual = (indiceCamaraActual + 1) % camarasDisponibles.length;
            overlay.style.display = 'flex';
            overlay.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cambiando cámara...';

            try {
                await iniciarStream(camarasDisponibles[indiceCamaraActual].deviceId);
                overlay.style.display = 'none';
            } catch (err) {
                overlay.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> No se pudo cambiar de cámara';
                console.error(err);
            }
        });

        btnCapturar.addEventListener('click', () => {
            if (!streamActual) return;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            detenerCamara();
            modalCamara.close();
            mostrarImagen(dataUrl);
        });

        btnCerrarCamara.addEventListener('click', () => {
            detenerCamara();
            modalCamara.close();
        });

        modalCamara.addEventListener('close', detenerCamara);

        btnAgregar.addEventListener('click', () => {
            form.reset();
            form.classList.remove('was-validated');
            quitarImagen();
            modal.showModal();
        });

        function cerrarModal() {
            detenerCamara();
            modal.close();
        }

        btnCerrar.addEventListener('click', cerrarModal);
        btnCancelar.addEventListener('click', cerrarModal);

        modal.addEventListener('click', (e) => {
            if (e.target.closest('.imagen-seccion') || e.target === inputImagen) {
                return;
            }
            const rect = modal.getBoundingClientRect();
            const fuera =
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom;
            if (fuera) cerrarModal();
        });

        modalCamara.addEventListener('click', (e) => {
            const rect = modalCamara.getBoundingClientRect();
            const fuera =
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom;
            if (fuera) {
                detenerCamara();
                modalCamara.close();
            }
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const datos = datosAlGuardar(imagenData);

            const valido = Object.keys(datos).every(k => {
                if (k === 'imagen') return true;
                return datos[k] !== null && datos[k] !== undefined && datos[k] !== '';
            });

            if (!valido) {
                form.classList.add('was-validated');
                return;
            }

            const tabla = window[tablaGlobal];
            if (tabla) {
                const nro = tabla.rows().count() + 1;
                const fila = tabla.row.add(datos.fila(nro)).draw(false).node();

                if (datos.onEditar) {
                    fila.querySelector('.accion-editar')?.addEventListener('click', () => {
                        datos.onEditar(fila);
                    });
                }
                if (datos.onEliminar) {
                    fila.querySelector('.accion-eliminar')?.addEventListener('click', () => {
                        datos.onEliminar(fila);
                    });
                }
            }

            form.reset();
            form.classList.remove('was-validated');
            quitarImagen();
            modal.close();
        });

        return { mostrarImagen, quitarImagen };
    }

    const inputImagen = document.getElementById('inputImagen');

    const botonesHTML = `
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

    const modalProducto = document.getElementById('modalAgregarProducto');
    if (modalProducto) {
        configurarModal({
            modal: modalProducto,
            form: document.getElementById('formAgregarProducto'),
            btnAgregar: document.getElementById('btnAgregarProducto'),
            btnCerrar: document.getElementById('cerrarModalProducto'),
            btnCancelar: document.getElementById('cancelarModalProducto'),
            dropzone: document.getElementById('dropzoneProducto'),
            inputImagen: inputImagen,
            imagenPreview: document.getElementById('imagenPreviewProducto'),
            btnAbrirCamara: document.getElementById('btnAbrirCamaraProducto'),
            tablaGlobal: 'tablaInventario',
            datosAlGuardar: (imagen) => {
                const datos = {
                    nombre: document.getElementById('prodNombre').value.trim(),
                    proveedor: document.getElementById('prodProveedor').value.trim(),
                    cantidad: document.getElementById('prodCantidad').value,
                    estado: document.getElementById('prodEstado').value,
                    minimo: document.getElementById('prodMinimo').value,
                    peso: document.getElementById('prodPeso').value,
                    unidad: document.getElementById('prodUnidad').value,
                    cantidadPeso: document.getElementById('prodCantidadPeso').value,
                    precio: document.getElementById('prodPrecio').value,
                    imagen: imagen
                };
                const fotoHTML = imagen
                    ? `<img src="${imagen}" alt="${datos.nombre}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">`
                    : `<span style="color:#6b7c8f;font-size:11px;">Sin foto</span>`;

                return {
                    ...datos,
                    fotoHTML,
                    fila: (nro) => [nro, fotoHTML, datos.nombre, datos.proveedor, datos.cantidad,
                        datos.estado, datos.minimo, datos.peso, datos.unidad, datos.cantidadPeso,
                        datos.precio, botonesHTML],
                    onEditar: (fila) => {
                        document.getElementById('prodNombre').value = datos.nombre;
                        document.getElementById('prodProveedor').value = datos.proveedor;
                        document.getElementById('prodCantidad').value = datos.cantidad;
                        document.getElementById('prodEstado').value = datos.estado;
                        document.getElementById('prodMinimo').value = datos.minimo;
                        document.getElementById('prodPeso').value = datos.peso;
                        document.getElementById('prodUnidad').value = datos.unidad;
                        document.getElementById('prodCantidadPeso').value = datos.cantidadPeso;
                        document.getElementById('prodPrecio').value = datos.precio;
                        if (imagen) window[tabla].onEditarImg?.(imagen);
                        window.tablaInventario.row(fila).remove().draw(false);
                        modalProducto.showModal();
                    },
                    onEliminar: (fila) => {
                        if (confirm(`¿Eliminar el producto "${datos.nombre}"?`)) {
                            window.tablaInventario.row(fila).remove().draw(false);
                        }
                    }
                };
            }
        });
    }

    const modalProveedor = document.getElementById('modalAgregarProveedor');
    if (modalProveedor) {
        configurarModal({
            modal: modalProveedor,
            form: document.getElementById('formAgregarProveedor'),
            btnAgregar: document.getElementById('btnAgregarProveedor'),
            btnCerrar: document.getElementById('cerrarModal'),
            btnCancelar: document.getElementById('cancelarModal'),
            dropzone: document.getElementById('dropzone'),
            inputImagen: inputImagen,
            imagenPreview: document.getElementById('imagenPreview'),
            btnAbrirCamara: document.getElementById('btnAbrirCamara'),
            tablaGlobal: 'tablaProveedores',
            datosAlGuardar: (imagen) => {
                const datos = {
                    nombre: document.getElementById('provNombre').value.trim(),
                    preventista: document.getElementById('provPreventista').value.trim(),
                    telefono: document.getElementById('provTelefono').value.trim(),
                    direccion: document.getElementById('provDireccion').value.trim(),
                    diasPedido: document.getElementById('provDiasPedido').value.trim(),
                    diasEntrega: document.getElementById('provDiasEntrega').value.trim(),
                    cantidadMinima: document.getElementById('provCantidadMinima').value,
                    productos: document.getElementById('provProductos').value.trim(),
                    imagen: imagen
                };
                const fotoHTML = imagen
                    ? `<img src="${imagen}" alt="${datos.nombre}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">`
                    : `<span style="color:#6b7c8f;font-size:11px;">Sin foto</span>`;

                return {
                    ...datos,
                    fotoHTML,
                    fila: (nro) => [nro, fotoHTML, datos.nombre, datos.preventista, datos.telefono,
                        datos.diasPedido, datos.diasEntrega, datos.cantidadMinima, datos.direccion,
                        datos.productos, botonesHTML],
                    onEditar: (fila) => {
                        document.getElementById('provNombre').value = datos.nombre;
                        document.getElementById('provPreventista').value = datos.preventista;
                        document.getElementById('provTelefono').value = datos.telefono;
                        document.getElementById('provDireccion').value = datos.direccion;
                        document.getElementById('provDiasPedido').value = datos.diasPedido;
                        document.getElementById('provDiasEntrega').value = datos.diasEntrega;
                        document.getElementById('provCantidadMinima').value = datos.cantidadMinima;
                        document.getElementById('provProductos').value = datos.productos;
                        window.tablaProveedores.row(fila).remove().draw(false);
                        modalProveedor.showModal();
                    },
                    onEliminar: (fila) => {
                        if (confirm(`¿Eliminar al proveedor "${datos.nombre}"?`)) {
                            window.tablaProveedores.row(fila).remove().draw(false);
                        }
                    }
                };
            }
        });
    }
});