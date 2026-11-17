document.addEventListener('DOMContentLoaded', function () {

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

    const modalConfirmar = document.getElementById('modalConfirmarEliminar');
    const modalConfirmarTexto = document.getElementById('modalConfirmarTexto');
    const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
    const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');

    let accionEliminar = null;

    function abrirConfirmarEliminar(nombre, callback) {
        if (!modalConfirmar) {
            if (confirm(`¿Eliminar "${nombre}"?`)) callback();
            return;
        }
        modalConfirmarTexto.textContent = `Se eliminará "${nombre}". Esta acción no se puede deshacer.`;
        accionEliminar = callback;
        modalConfirmar.showModal();
    }

    btnCancelarEliminar?.addEventListener('click', () => {
        accionEliminar = null;
        modalConfirmar.close();
    });

    btnConfirmarEliminar?.addEventListener('click', () => {
        if (typeof accionEliminar === 'function') accionEliminar();
        accionEliminar = null;
        modalConfirmar.close();
    });

    modalConfirmar?.addEventListener('click', (e) => {
        const rect = modalConfirmar.getBoundingClientRect();
        const fuera =
            e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top || e.clientY > rect.bottom;
        if (fuera) {
            accionEliminar = null;
            modalConfirmar.close();
        }
    });

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
            tablaGlobal,
            alGuardar
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
        let filaEditando = null;

        const tituloModal = modal.querySelector('.modal-title');

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

        window.__leerArchivoActivo = leerArchivo;

        dropzone.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            inputImagen.click();
        });

        inputImagen.addEventListener('click', (e) => e.stopPropagation());

        if (!inputImagen.dataset.listenerActivo) {
            inputImagen.dataset.listenerActivo = "1";
            inputImagen.addEventListener('change', (e) => {
                e.stopPropagation();
                if (inputImagen.files && inputImagen.files[0] && window.__leerArchivoActivo) {
                    window.__leerArchivoActivo(inputImagen.files[0]);
                }
            });
        }

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
            leerArchivo(e.dataTransfer.files[0]);
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
                await iniciarStream(camarasDisponibles[indiceCamaraActual]?.deviceId);
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

        function cerrarModal() {
            detenerCamara();
            modal.close();
            filaEditando = null;
        }

        btnCerrar.addEventListener('click', cerrarModal);
        btnCancelar.addEventListener('click', cerrarModal);

        modal.addEventListener('click', (e) => {
            if (e.target.closest('.imagen-seccion') || e.target === inputImagen) return;
            const rect = modal.getBoundingClientRect();
            const fuera =
                e.clientX < rect.left || e.clientX > rect.right ||
                e.clientY < rect.top || e.clientY > rect.bottom;
            if (fuera) cerrarModal();
        });

        modalCamara.addEventListener('click', (e) => {
            const rect = modalCamara.getBoundingClientRect();
            const fuera =
                e.clientX < rect.left || e.clientX > rect.right ||
                e.clientY < rect.top || e.clientY > rect.bottom;
            if (fuera) {
                detenerCamara();
                modalCamara.close();
            }
        });

        btnAgregar.addEventListener('click', () => {
            form.reset();
            form.classList.remove('was-validated');
            quitarImagen();
            filaEditando = null;
            if (tituloModal) {
                tituloModal.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Agregar';
            }
            modal.showModal();
        });

        modal.__editar = (datosOriginales, filaNode) => {
            filaEditando = filaNode;
            form.reset();
            form.classList.remove('was-validated');
            quitarImagen();
            if (tituloModal) {
                tituloModal.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar';
            }
            if (typeof datosOriginales.__rellenar === 'function') {
                datosOriginales.__rellenar();
            }
            if (datosOriginales.imagen) {
                mostrarImagen(datosOriginales.imagen);
            }
            modal.showModal();
        };

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const datos = datosAlGuardar(imagenData);

            const camposObligatorios = Object.keys(datos).filter(k => k !== 'imagen' && k !== 'fotoHTML' && k !== '__rellenar');
            const valido = camposObligatorios.every(k => {
                const v = datos[k];
                return v !== null && v !== undefined && String(v).trim() !== '';
            });

            if (!valido) {
                form.classList.add('was-validated');
                alert('Completa todos los campos obligatorios.');
                return;
            }

            const tabla = window[tablaGlobal];
            if (tabla) {
                if (filaEditando) {
                    const nro = tabla.row(filaEditando).data()[0];
                    tabla.row(filaEditando).data(datos.fila(nro)).draw(false);
                    filaEditando = null;
                } else {
                    const nro = tabla.rows().count() + 1;
                    tabla.row.add(datos.fila(nro)).draw(false);
                }
            }

            if (typeof alGuardar === 'function') {
                alGuardar(datos);
            }

            form.reset();
            form.classList.remove('was-validated');
            quitarImagen();
            modal.close();
        });
    }

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
                    peso: document.getElementById('prodPeso').value || '0',
                    unidad: document.getElementById('prodUnidad').value || '-',
                    cantidadPeso: document.getElementById('prodCantidadPeso').value || '0',
                    precio: document.getElementById('prodPrecio').value,
                    imagen: imagen
                };
                const fotoHTML = imagen
                    ? `<img src="${imagen}" alt="${datos.nombre}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">`
                    : `<span style="color:#6b7c8f;font-size:11px;">Sin foto</span>`;

                return {
                    ...datos,
                    fotoHTML,
                    __rellenar: () => {
                        document.getElementById('prodNombre').value = datos.nombre;
                        document.getElementById('prodProveedor').value = datos.proveedor;
                        document.getElementById('prodCantidad').value = datos.cantidad;
                        document.getElementById('prodEstado').value = datos.estado;
                        document.getElementById('prodMinimo').value = datos.minimo;
                        document.getElementById('prodPeso').value = datos.peso;
                        document.getElementById('prodUnidad').value = datos.unidad;
                        document.getElementById('prodCantidadPeso').value = datos.cantidadPeso;
                        document.getElementById('prodPrecio').value = datos.precio;
                    },
                    fila: (nro) => [nro, fotoHTML, datos.nombre, datos.proveedor, datos.cantidad,
                        datos.estado, datos.minimo, datos.peso, datos.unidad, datos.cantidadPeso,
                        datos.precio, botonesHTML]
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
                const diasPedido = [...document.querySelectorAll('#diasPedido input:checked')].map(i => i.value).join(', ');
                const datos = {
                    nombre: document.getElementById('provNombre').value.trim(),
                    preventista: document.getElementById('provPreventista').value.trim(),
                    telefono: document.getElementById('provTelefono').value.trim(),
                    direccion: document.getElementById('provDireccion').value.trim(),
                    diasPedido: diasPedido,
                    diasEntrega: document.getElementById('provDiasEntrega').value,
                    cantidadMinima: document.getElementById('provCantidadMinima').value,
                    unidad: document.getElementById('provUnidad').value,
                    productos: document.getElementById('provProductos').value.trim(),
                    imagen: imagen
                };
                const fotoHTML = imagen
                    ? `<img src="${imagen}" alt="${datos.nombre}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">`
                    : `<span style="color:#6b7c8f;font-size:11px;">Sin foto</span>`;
                const cantidadMinimaHTML = datos.cantidadMinima
                    ? `${datos.cantidadMinima} ${datos.unidad}`
                    : '';

                return {
                    ...datos,
                    fotoHTML,
                    __rellenar: () => {
                        document.getElementById('provNombre').value = datos.nombre;
                        document.getElementById('provPreventista').value = datos.preventista;
                        document.getElementById('provTelefono').value = datos.telefono;
                        document.getElementById('provDireccion').value = datos.direccion;
                        document.getElementById('provDiasEntrega').value = datos.diasEntrega;
                        document.getElementById('provCantidadMinima').value = datos.cantidadMinima;
                        document.getElementById('provUnidad').value = datos.unidad || 'Unidad';
                        const dias = (datos.diasPedido || '').split(',').map(s => s.trim());
                        document.querySelectorAll('#diasPedido input').forEach(inp => {
                            inp.checked = dias.includes(inp.value);
                        });
                        document.getElementById('provProductos').value = datos.productos;
                    },
                    fila: (nro) => [nro, fotoHTML, datos.nombre, datos.preventista, datos.telefono,
                        datos.diasPedido, datos.diasEntrega, cantidadMinimaHTML, datos.direccion,
                        datos.productos, botonesHTML]
                };
            }
        });
    }

    window.__configurarAccionesInventario = (contenedor, cache) => {
        contenedor.querySelectorAll('.accion-editar').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                const producto = cache[id];
                if (!producto) return;
                const filaNode = btn.closest('tr');
                const datos = {
                    nombre: producto.nombre || '',
                    proveedor: producto.proveedor || '',
                    cantidad: producto.stock || '',
                    estado: producto.estado || '',
                    minimo: producto.stock_minimo || '',
                    peso: producto.peso || '',
                    unidad: producto.unidad || '',
                    cantidadPeso: producto.cantidad_peso || '',
                    precio: producto.precio || '',
                    imagen: producto.foto || null,
                    __rellenar: () => {
                        document.getElementById('prodNombre').value = producto.nombre || '';
                        document.getElementById('prodProveedor').value = producto.proveedor || '';
                        document.getElementById('prodCantidad').value = producto.stock || '';
                        document.getElementById('prodEstado').value = producto.estado || '';
                        document.getElementById('prodMinimo').value = producto.stock_minimo || '';
                        document.getElementById('prodPeso').value = producto.peso || '';
                        document.getElementById('prodUnidad').value = producto.unidad || '';
                        document.getElementById('prodCantidadPeso').value = producto.cantidad_peso || '';
                        document.getElementById('prodPrecio').value = producto.precio || '';
                    }
                };
                const modal = document.getElementById('modalAgregarProducto');
                if (modal && modal.__editar) modal.__editar(datos, filaNode);
            });
        });

        contenedor.querySelectorAll('.accion-eliminar').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                const producto = cache[id];
                const filaNode = btn.closest('tr');
                abrirConfirmarEliminar(producto?.nombre || 'producto', () => {
                    window.tablaInventario.row(filaNode).remove().draw(false);
                });
            });
        });
    };

    window.__configurarAccionesProveedores = (contenedor, cache) => {
        contenedor.querySelectorAll('.accion-editar').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                const proveedor = cache[id];
                if (!proveedor) return;
                const filaNode = btn.closest('tr');
                const datos = {
                    nombre: proveedor.nombre || '',
                    preventista: proveedor.contacto || '',
                    telefono: proveedor.telefono || '',
                    direccion: proveedor.direccion || '',
                    diasPedido: proveedor.dias_pedido || '',
                    diasEntrega: proveedor.dias_entrega || '',
                    cantidadMinima: proveedor.cantidad_minima || '',
                    unidad: proveedor.unidad || 'Unidad',
                    productos: proveedor.productos || '',
                    imagen: proveedor.foto || null,
                    __rellenar: () => {
                        document.getElementById('provNombre').value = proveedor.nombre || '';
                        document.getElementById('provPreventista').value = proveedor.contacto || '';
                        document.getElementById('provTelefono').value = proveedor.telefono || '';
                        document.getElementById('provDireccion').value = proveedor.direccion || '';
                        document.getElementById('provDiasEntrega').value = proveedor.dias_entrega || '';
                        document.getElementById('provCantidadMinima').value = proveedor.cantidad_minima || '';
                        document.getElementById('provUnidad').value = proveedor.unidad || 'Unidad';
                        const dias = (proveedor.dias_pedido || '').split(',').map(s => s.trim());
                        document.querySelectorAll('#diasPedido input').forEach(inp => {
                            inp.checked = dias.includes(inp.value);
                        });
                        document.getElementById('provProductos').value = proveedor.productos || '';
                    }
                };
                const modal = document.getElementById('modalAgregarProveedor');
                if (modal && modal.__editar) modal.__editar(datos, filaNode);
            });
        });

        contenedor.querySelectorAll('.accion-eliminar').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                const proveedor = cache[id];
                const filaNode = btn.closest('tr');
                abrirConfirmarEliminar(proveedor?.nombre || 'proveedor', () => {
                    window.tablaProveedores.row(filaNode).remove().draw(false);
                });
            });
        });
    };
});
