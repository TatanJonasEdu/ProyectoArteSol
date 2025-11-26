// frontend/js/main.js

document.addEventListener("DOMContentLoaded", async function() {
    
    // --- ======================================================= ---
    // --- 0. ¡CONFIGURACIÓN EPAYCO! ---
    // --- Llaves de prueba de ePayco ---
    // --- ======================================================= ---
    const EPAYCO_P_KEY = "733b8ceb8f1890ea3cd569b172eff1c2d7ae5603"; 
    const EPAYCO_P_CUST_ID = "1567880";


    // --- ======================================================= ---
    // --- 1. FUNCIONES GLOBALES DEL CARRITO (LOCALSTORAGE) ---
    // --- ======================================================= ---
    
    const CARRITO_KEY = 'artesolCarrito';

    /**
     * Obtiene el carrito desde localStorage.
     * @returns {Array} El array del carrito.
     */
    function getCarrito() {
        try {
            const carritoGuardado = localStorage.getItem(CARRITO_KEY);
            return carritoGuardado ? JSON.parse(carritoGuardado) : [];
        } catch (e) {
            console.error("Error al parsear el carrito, reseteando.", e);
            localStorage.setItem(CARRITO_KEY, '[]');
            return [];
        }
    }

    /**
     * Guarda el carrito en localStorage y actualiza el nav.
     * @param {Array} carrito El array del carrito a guardar.
     */
    function saveCarrito(carrito) {
        localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
        actualizarNavCarrito();
    }

    /**
     * Añade un producto al carrito.
     * @param {object} producto El producto a añadir.
     */
    function anadirAlCarrito(producto) {
        const carrito = getCarrito();
        const { id, nombre, precio, imagenUrl, cantidad } = producto;

        if (!id || !nombre || precio === undefined || !imagenUrl || !cantidad) {
            console.error("Producto inválido, no se puede añadir:", producto);
            return;
        }
        const productoExistenteIndex = carrito.findIndex(item => item.id === id);
        if (productoExistenteIndex > -1) {
            // Producto ya existe, actualizar cantidad
            carrito[productoExistenteIndex].cantidad += cantidad;
        } else {
            // Producto nuevo
            carrito.push({ id, nombre, precio, imagenUrl, cantidad });
        }
        saveCarrito(carrito);
        showToast("¡Producto añadido al carrito!");
    }

    // --- ======================================================= ---
    // --- 2. FUNCIONES DE AYUDA (HELPERS) ---
    // --- ======================================================= ---

    /**
     * Actualiza los indicadores del carrito en el <header>.
     */
    function actualizarNavCarrito() {
        // Esta función se llama después de cargar el header y cada vez que se actualiza el carrito
        const carrito = getCarrito();
        const cantidadEl = document.getElementById('nav-carrito-cantidad');
        const totalEl = document.getElementById('nav-carrito-total');

        if (!cantidadEl || !totalEl) {
            // El header aún no se ha cargado, no hacer nada
            return; 
        }

        const totalUnidades = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        const precioTotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

        // Actualizar la burbuja de cantidad
        cantidadEl.textContent = totalUnidades;
        cantidadEl.classList.toggle('hidden', totalUnidades === 0); // Muestra/oculta

        // Actualizar el precio total
        totalEl.textContent = `$${precioTotal.toLocaleString('es-CO')}`;
    }


    // --- VARIABLES DE ESTADO DE PAGINACIÓN ---
    let currentPage = 1;
    let totalPages = 1;
    const PRODUCTS_PER_PAGE = 20;

    // --- Cargar Componentes (Header/Footer) ---
    const cargarComponente = async (url, elementoId) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error al cargar " + url);
            const data = await response.text();
            const elemento = document.getElementById(elementoId);
            if (elemento) elemento.innerHTML = data;
        } catch (error) {
            console.error(`Error al cargar ${elementoId}:`, error);
        }
    };
    
    // --- Helper de Notificaciones ---
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-5 right-5 bg-oscuro text-white py-3 px-5 rounded-lg shadow-lg z-50 transition-opacity duration-300 ease-out opacity-0';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.replace('opacity-0', 'opacity-100'), 10);
        setTimeout(() => {
            toast.classList.replace('opacity-100', 'opacity-0');
            toast.addEventListener('transitionend', () => {
                if (document.body.contains(toast)) document.body.removeChild(toast);
            }, { once: true });
        }, 2500);
    }

    // --- ======================================================= ---
    // --- 3. DEFINICIÓN DE LÓGICA: TIENDA (tienda.html) ---
    // --- ======================================================= ---
    
    // --- Lógica de Tienda: Cargar Productos (CON PAGINACIÓN) ---
    async function cargarProductos(filters = {}, page = 1) {
        const productosGrilla = document.getElementById('productos-grilla');
        if (!productosGrilla) return; // Salir si no estamos en la página de tienda

        // CORRECCIÓN 1: URL ACTUALIZADA
        let urlApi = 'https://proyecto-arte-sol.vercel.app/api/productos';
        
        const params = new URLSearchParams();
        if (filters.searchTerm) params.append('search', filters.searchTerm);
        if (filters.category) params.append('category', filters.category);
        if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice);
        params.append('page', page);
        params.append('limit', PRODUCTS_PER_PAGE);
        urlApi += `?${params.toString()}`;
        
        productosGrilla.innerHTML = '<p class="col-span-full text-center text-gray-600">Cargando productos...</p>';

        try {
            const response = await fetch(urlApi);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const data = await response.json();
            if (data.msg) throw new Error(data.msg);
            
            const { productos, totalPages: newTotalPages, currentPage: newCurrentPage, totalProductos } = data;
            productosGrilla.innerHTML = ''; 

            if (productos.length === 0) {
                productosGrilla.innerHTML = '<p class="col-span-full text-center text-gray-600">No se encontraron productos.</p>';
            } else {
                productos.forEach(producto => {
                    const productoCardHtml = `
                    <div class="bg-gray-50 p-6 rounded-lg shadow-md flex flex-col justify-between h-full hover:shadow-xl transition-shadow duration-300">
                        <a href="producto-detalle.html?id=${producto._id}" class="block">
                            <img src="${producto.imagenUrl}" alt="${producto.nombre}" class="w-full h-48 object-cover rounded-md mb-4 shadow-sm">
                        </a>
                        <div class="flex-grow flex flex-col">
                            <h3 class="text-xl font-semibold text-oscuro mb-1">${producto.nombre}</h3>
                            <div class="flex items-center text-sm text-gray-600 mb-3">
                                ${producto.calificacionPromedio > 0 ? 
                                    '<span class="text-yellow-400">★</span>' + producto.calificacionPromedio.toFixed(1) : 'Sin calificar'} 
                                (${producto.totalResenas || 0} res.)
                            </div>
                            <p class="text-gray-700 text-sm mb-4 line-clamp-2">${producto.descripcion}</p>
                            <div class="mt-auto flex items-center justify-end">
                                <span class="text-rosa-vibrante text-2xl font-bold">$${producto.precio.toLocaleString('es-CO')}</span>
                            </div>
                        </div>
                        <div class="flex space-x-2 mt-4">
                            <a href="producto-detalle.html?id=${producto._id}" class="flex-1 bg-lila-suave text-oscuro py-2 px-3 rounded-full text-center text-sm font-semibold hover:bg-lila-oscuro transition duration-300 ease-in-out transform shadow-md hover:shadow-lg">Ver Más</a>
                            <button 
                                data-id="${producto._id}"
                                data-nombre="${producto.nombre.replace(/"/g, '&quot;')}"
                                data-precio="${producto.precio}"
                                data-imagen-url="${producto.imagenUrl}"
                                class="btn-add-to-cart flex-1 bg-verde-menta text-white py-2 px-3 rounded-full text-center text-sm font-semibold hover:bg-verde-oscuro transition duration-300 ease-in-out transform shadow-md hover:shadow-lg flex items-center justify-center">
                                <i class="fas fa-shopping-cart mr-1"></i> Añadir
                            </button>
                        </div>
                    </div>`;
                    productosGrilla.insertAdjacentHTML('beforeend', productoCardHtml);
                });
            }
            
            currentPage = newCurrentPage;
            totalPages = newTotalPages;
            actualizarControlesPaginacion(totalProductos);

            // Añadir listeners a los botones de "Añadir" de la tienda
            document.querySelectorAll('#productos-grilla .btn-add-to-cart').forEach(button => {
                button.addEventListener('click', (event) => {
                    const btn = event.currentTarget;
                    const productoParaCarrito = {
                        id: btn.dataset.id,
                        nombre: btn.dataset.nombre,
                        precio: parseFloat(btn.dataset.precio),
                        imagenUrl: btn.dataset.imagenUrl,
                        cantidad: 1
                    };
                    anadirAlCarrito(productoParaCarrito);
                });
            });

            if (productosGrilla) productosGrilla.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            console.error('Error al cargar productos:', error); 
            if (productosGrilla) productosGrilla.innerHTML = `<p class="col-span-full text-center text-red-500">Error: ${error.message}</p>`;
            const paginacionContainer = document.getElementById('paginacion-productos');
            if (paginacionContainer) paginacionContainer.style.display = 'none';
        }
    }

    // --- FUNCIÓN: Actualizar botones de paginación ---
    function actualizarControlesPaginacion(totalProductos) {
        const paginacionContainer = document.getElementById('paginacion-productos');
        const prevPageBtn = document.getElementById('prev-page-btn');
        const nextPageBtn = document.getElementById('next-page-btn');
        const pageInfo = document.getElementById('page-info');

        if (!paginacionContainer || !prevPageBtn || !nextPageBtn || !pageInfo) return;
        if (totalPages <= 1) {
            paginacionContainer.style.display = 'none';
            return;
        }
        paginacionContainer.style.display = 'flex';
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        prevPageBtn.disabled = (currentPage <= 1);
        nextPageBtn.disabled = (currentPage >= totalPages);
    }

    // --- FUNCIÓN: Obtener filtros actuales ---
    const getCurrentFilters = () => {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const minPriceFilter = document.getElementById('min-price-filter');
        const maxPriceFilter = document.getElementById('max-price-filter');

        const filters = {
            searchTerm: searchInput ? searchInput.value.trim() : '',
            category: categoryFilter ? categoryFilter.value : '',
            minPrice: minPriceFilter && minPriceFilter.value ? parseFloat(minPriceFilter.value) : undefined,
            maxPrice: maxPriceFilter && maxPriceFilter.value ? parseFloat(maxPriceFilter.value) : undefined,
        };
        return Object.fromEntries(
            Object.entries(filters).filter(([, value]) => 
                value !== '' && value !== undefined && !(typeof value === 'number' && isNaN(value)) 
            )
        );
    };

    // --- Aplicar/Limpiar filtros (resetea a página 1) ---
    const getAndApplyFilters = () => cargarProductos(getCurrentFilters(), 1);
    
    const clearAllFilters = () => {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const minPriceFilter = document.getElementById('min-price-filter');
        const maxPriceFilter = document.getElementById('max-price-filter');

        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (minPriceFilter) minPriceFilter.value = '';
        if (maxPriceFilter) maxPriceFilter.value = '';
        getAndApplyFilters();
    };

    // --- Cargar categorías ---
    async function populateCategories(selectedCategory = '') {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) return;
        try {
            // CORRECCIÓN 2: URL ACTUALIZADA
            const response = await fetch('https://proyecto-arte-sol.vercel.app/api/productos/categorias-unicas');
            if (!response.ok) throw new Error('Respuesta no ok del backend');
            const categories = await response.json();
            categoryFilter.innerHTML = '<option value="">Todas</option>'; 
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                categoryFilter.appendChild(option);
            });
            if (selectedCategory) categoryFilter.value = selectedCategory;
        } catch (error) {
            console.error("Error al poblar las categorías:", error); 
        }
        
        
    }

    

    // --- ======================================================= ---
    // --- 4. DEFINICIÓN DE LÓGICA: INICIO (index.html) ---
    // --- ======================================================= ---
    
    // --- FUNCIÓN PARA CARGAR PRODUCTOS ALEATORIOS EN LA GRILLA ---
    async function cargarProductosAleatoriosGrilla() {
        const productosGrilla = document.getElementById('productos-destacados-grilla');
        if (!productosGrilla) return;

        

        const urlApi = 'https://proyecto-arte-sol.vercel.app/api/productos/aleatorios?cantidad=3';
        productosGrilla.innerHTML = '<p class="col-span-4 text-center text-gray-600">Cargando productos...</p>';

        try {
            const response = await fetch(urlApi);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const productos = await response.json();
            productosGrilla.innerHTML = '';

            if (productos.length === 0) {
                productosGrilla.innerHTML = '<p class="col-span-4 text-center text-gray-600">No hay productos para mostrar.</p>';
                return;
            }

            productos.forEach(producto => {
                const calificacion = Math.round(producto.calificacionPromedio || 0); 
                const estrellasHtml = '<span class="text-yellow-500 text-lg">★</span>'.repeat(calificacion) +
                                      '<span class="text-gray-300 text-lg">★</span>'.repeat(5 - calificacion);
                const precioFormateado = producto.precio.toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0
                });

                // ESTA ES LA TARJETA DEL INDEX.HTML
                const productoHtml = `
                <div class="bg-white border border-suave rounded-2xl shadow-lg overflow-hidden flex flex-col justify-between hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
                    <a href="producto-detalle.html?id=${producto._id}" class="">
                        <img src="${producto.imagenUrl}" alt="${producto.nombre}" class="items-center justify-center bg-black h-[60vh] md:h-[40vh] w-full object-cover"> 
                    </a>
                    <div class="p-4 flex flex-col flex-grow">
                        <h3 class="font-bold text-lg mb-1 text-oscuro">${producto.nombre}</h3>
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex text-sm">
                                ${estrellasHtml}
                                <span class="text-sm text-gray-500 ml-2">(${producto.totalResenas || 0})</span>
                            </div>
                            <p class="text-3xl font-serif-delicado text-rosa-vibrante font-extrabold">${precioFormateado}</p>
                        </div>
                        <div class="flex space-x-2 mt-auto">
                            <a href="producto-detalle.html?id=${producto._id}" class="flex-1 bg-lila-suave text-oscuro py-2 px-3 rounded-full text-center text-sm font-semibold 
                                     hover:bg-lila-oscuro hover:scale-105 transition duration-300 ease-in-out transform shadow-md hover:shadow-lg">
                                Ver Más
                            </a>
                            <button 
                                data-id="${producto._id}"
                                data-nombre="${producto.nombre.replace(/"/g, '&quot;')}"
                                data-precio="${producto.precio}"
                                data-imagen-url="${producto.imagenUrl}"
                                class="btn-add-to-cart flex-1 bg-verde-menta text-white py-2 px-3 rounded-full text-center text-sm font-semibold 
                                         hover:bg-verde-oscuro hover:scale-105 transition duration-300 ease-in-out transform shadow-md hover:shadow-lg flex items-center justify-center">
                                <i class="fas fa-shopping-cart mr-1"></i> Añadir
                            </button>
                        </div>
                    </div>
                </div>`;
                productosGrilla.insertAdjacentHTML('beforeend', productoHtml);
            });

            // AÑADIR LISTENERS A ESTOS BOTONES
            document.querySelectorAll('#productos-destacados-grilla .btn-add-to-cart').forEach(button => {
                button.addEventListener('click', (event) => {
                    const btn = event.currentTarget;
                    const productoParaCarrito = {
                        id: btn.dataset.id,
                        nombre: btn.dataset.nombre,
                        precio: parseFloat(btn.dataset.precio),
                        imagenUrl: btn.dataset.imagenUrl,
                        cantidad: 1
                    };
                    anadirAlCarrito(productoParaCarrito);
                });
            });

        } catch (error) {
            console.error('Error al cargar productos aleatorios:', error);
            productosGrilla.innerHTML = '<p class="col-span-4 text-center text-red-500">Error al cargar productos.</p>';
        }
    }
    
    // --- OTRAS FUNCIONES DE INDEX.HTML ---
    async function inicializarCarruselHeroe() {
        const heroCarousel = document.getElementById('hero-carousel');
        if (!heroCarousel) return;

        if (typeof $ === 'undefined') {
            console.warn('jQuery no está cargado. El carrusel no funcionará.');
            return;
        }
        
        const $heroCarousel = $('#hero-carousel');
        const gifDuracion = 8000;
        
        $heroCarousel.slick({
             infinite: true, slidesToShow: 1, slidesToScroll: 1, autoplay: false,
             arrows: false, dots: false, fade: true, cssEase: 'linear', speed: 500
        });
        
        setTimeout(async () => {
            const urlApiProductos = 'https://proyecto-arte-sol.vercel.app/api/productos/aleatorios?cantidad=6';
            try {
                const response = await fetch(urlApiProductos);
                if (!response.ok) throw new Error('Error al cargar productos para el carrusel.');
                const productos = await response.json();
                $heroCarousel.slick('unslick'); 
                $heroCarousel.empty();
                
                if (productos.length === 0) {
                     $heroCarousel.append('<div class="carousel-slide flex items-center justify-center h-[60vh] md:h-[90vh] bg-gray-200 text-gray-700 text-xl">No hay productos para mostrar en el carrusel.</div>');
                } else {
                    productos.forEach(producto => {
                        const slideHtml = `
                        <div class="carousel-slide relative h-[50vh] md:h-[90vh]"> 
                            <a href="producto-detalle.html?id=${producto._id}" class="block w-full h-full">
                                <img src="${producto.imagenUrl}" alt="${producto.nombre}" class="w-full h-full object-cover">
                                <div class="absolute inset-0 flex items-center justify-center p-4 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    <span class="text-white text-3xl font-bold text-center">${producto.nombre}</span>
                                </div>
                            </a>
                        </div>`;
                        $heroCarousel.append(slideHtml); 
                    });
                }
                
                $heroCarousel.slick({
                     infinite: true, slidesToShow: 1, slidesToScroll: 1, autoplay: true, 
                     autoplaySpeed: 4000, arrows: true, dots: true, fade: false, 
                     cssEase: 'linear', speed: 500
                });
            } catch (error) {
                console.error('Error en el carrusel:', error);
                if($heroCarousel.hasClass('slick-initialized')) {
                    $heroCarousel.slick('unslick'); 
                }
                $heroCarousel.empty(); 
                $heroCarousel.append('<div class="carousel-slide flex items-center justify-center h-[60vh] md:h-[90vh] bg-red-100 text-red-700 text-xl">Error al cargar el carrusel.</div>');
            }
        }, gifDuracion);
    }
    
    // --- ======================================================= ---
    // --- 5. DEFINICIÓN DE LÓGICA: DETALLE (producto-detalle.html) ---
    // --- ======================================================= ---

    async function cargarDetalleProducto() {
        const detalleProductoContainer = document.getElementById('detalle-producto-container');
        if (!detalleProductoContainer) return; 
        
        const mensajeContainer = document.getElementById('mensaje-container');
        const mensajeTexto = document.getElementById('mensaje-texto');
        const productoImagen = document.getElementById('producto-imagen');
        const productoNombre = document.getElementById('producto-nombre');
        const productoCalificacionWrapper = document.getElementById('producto-calificacion-wrapper');
        const productoCalificacionEstrellas = document.getElementById('producto-calificacion-estrellas');
        const productoCalificacionTexto = document.getElementById('producto-calificacion-texto');
        const productoPrecio = document.getElementById('producto-precio');
        const productoDescripcion = document.getElementById('producto-descripcion');
        const addToCartBtn = document.getElementById('add-to-cart-btn');

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const productoId = urlParams.get('id');
            if (!productoId) throw new Error("No se especificó ID de producto.");

            const response = await fetch(`https://proyecto-arte-sol.vercel.app/api/productos/${productoId}`);
            if (!response.ok) throw new Error("Producto no encontrado.");
            const producto = await response.json();
            if (!producto || producto.activo === false) throw new Error("Producto no disponible.");

            // --- RELLENAR LOS CAMPOS ---
            document.title = `${producto.nombre} - Artesol`;
            if (productoImagen) {
                productoImagen.src = producto.imagenUrl;
                productoImagen.alt = producto.nombre;
            }
            if (productoNombre) productoNombre.textContent = producto.nombre;
            if (productoPrecio) productoPrecio.textContent = `$${producto.precio.toLocaleString('es-CO')}`;
            if (productoDescripcion) productoDescripcion.textContent = producto.descripcion;
            
            if (productoCalificacionWrapper) {
                if (producto.calificacionPromedio > 0) {
                    if (productoCalificacionEstrellas) productoCalificacionEstrellas.textContent = '★';
                    if (productoCalificacionTexto) productoCalificacionTexto.textContent = `${producto.calificacionPromedio.toFixed(1)} (${producto.totalResenas || 0} reseñas)`;
                } else {
                    productoCalificacionWrapper.innerHTML = '<span class="text-gray-500">Sin calificar</span>';
                }
            }

            // --- CONFIGURAR BOTÓN AÑADIR ---
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', (event) => {
                    const productoParaCarrito = {
                        id: producto._id,
                        nombre: producto.nombre,
                        precio: producto.precio,
                        imagenUrl: producto.imagenUrl,
                        cantidad: 1 
                    };
                    anadirAlCarrito(productoParaCarrito);
                });
            }

            if (mensajeContainer) mensajeContainer.classList.add('hidden');
            if (detalleProductoContainer) detalleProductoContainer.classList.remove('hidden');
            
            await cargarProductosRelacionados(producto.categoria, producto._id);

        } catch (error) {
            console.error("Error al cargar detalle:", error);
            if (mensajeTexto) {
                mensajeTexto.innerHTML = `<i class="fas fa-exclamation-circle text-red-500 mr-2"></i>Error: ${error.message}`;
                if (mensajeContainer) mensajeContainer.classList.remove('hidden');
            }
            if (detalleProductoContainer) detalleProductoContainer.classList.add('hidden');
        }
    }

    async function cargarProductosRelacionados(categoria, productoIdActual) {
        const relacionadosGrilla = document.getElementById('relacionados-grilla');
        if (!relacionadosGrilla) return;

        relacionadosGrilla.innerHTML = '<p class="col-span-4 text-center text-gray-600">Cargando productos...</p>';
        const urlApi = `https://proyecto-arte-sol.vercel.app/api/productos?category=${encodeURIComponent(categoria)}&limit=5`;

        try {
            const response = await fetch(urlApi);
            if (!response.ok) throw new Error('Error al cargar relacionados.');
            const data = await response.json();
            const productosFiltrados = data.productos
                .filter(p => p._id !== productoIdActual)
                .slice(0, 4);

            relacionadosGrilla.innerHTML = '';
            if (productosFiltrados.length === 0) {
                relacionadosGrilla.innerHTML = '<p class="col-span-4 text-center text-gray-600">No hay otros productos en esta categoría.</p>';
                return;
            }

            productosFiltrados.forEach(producto => {
                const calificacion = Math.round(producto.calificacionPromedio || 0); 
                const estrellasHtml = '<span class="text-yellow-500 text-lg">★</span>'.repeat(calificacion) +
                                      '<span class="text-gray-300 text-lg">★</span>'.repeat(5 - calificacion);

                const precioFormateado = producto.precio.toLocaleString('es-CO', {
                    style: 'currency', currency: 'COP', minimumFractionDigits: 0
                });

                const productoHtml = `
                <div class="bg-white border border-suave rounded-2xl shadow-lg overflow-hidden flex flex-col justify-between hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
                    <a href="producto-detalle.html?id=${producto._id}">
                        <img src="${producto.imagenUrl}" alt="${producto.nombre}" class="w-full h-48 object-cover">
                    </a>
                    <div class="p-4 flex flex-col flex-grow">
                        <h3 class="font-bold text-lg mb-1 text-oscuro">${producto.nombre}</h3>
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex text-sm">${estrellasHtml} <span class="text-sm text-gray-500 ml-2">(${producto.totalResenas || 0})</span></div>
                            <p class="text-3xl font-serif-delicado text-rosa-vibrante font-extrabold">${precioFormateado}</p>
                        </div>
                        <div class="flex space-x-2 mt-auto">
                            <a href="producto-detalle.html?id=${producto._id}" class="flex-1 bg-lila-suave text-oscuro py-2 px-3 rounded-full text-center text-sm font-semibold 
                                     hover:bg-lila-oscuro hover:scale-105 transition duration-300 ease-in-out transform shadow-md hover:shadow-lg">
                                Ver Más
                            </a>
                            <button 
                                data-id="${producto._id}"
                                data-nombre="${producto.nombre.replace(/"/g, '&quot;')}"
                                data-precio="${producto.precio}"
                                data-imagen-url="${producto.imagenUrl}"
                                class="btn-add-to-cart flex-1 bg-verde-menta text-white py-2 px-3 rounded-full text-center text-sm font-semibold 
                                         hover:bg-verde-oscuro hover:scale-105 transition duration-300 ease-in-out transform shadow-md hover:shadow-lg flex items-center justify-center">
                                <i class="fas fa-shopping-cart mr-1"></i> Añadir
                            </button>
                        </div>
                    </div>
                </div>`;
                relacionadosGrilla.insertAdjacentHTML('beforeend', productoHtml);
            });

            document.querySelectorAll('#relacionados-grilla .btn-add-to-cart').forEach(button => {
                button.addEventListener('click', (event) => {
                    const btn = event.currentTarget;
                    const productoParaCarrito = {
                        id: btn.dataset.id,
                        nombre: btn.dataset.nombre,
                        precio: parseFloat(btn.dataset.precio),
                        imagenUrl: btn.dataset.imagenUrl,
                        cantidad: 1
                    };
                    anadirAlCarrito(productoParaCarrito);
                });
            });

        } catch (error) {
            console.error('Error al cargar relacionados:', error);
            relacionadosGrilla.innerHTML = '<p class="col-span-4 text-center text-red-500">Error al cargar productos.</p>';
        }
    }

    // --- ======================================================= ---
    // --- 6. DEFINICIÓN DE LÓGICA: CARRITO (carrito.html) ---
    // --- ======================================================= ---
    
    function renderizarCarrito() {
        const carritoLista = document.getElementById('carrito-lista');
        if (!carritoLista) return; 

        const carrito = getCarrito();
        const mensaje = document.getElementById('carrito-mensaje');
        const subtotalEl = document.getElementById('carrito-subtotal');
        const totalEl = document.getElementById('carrito-total');
        const limpiarBtn = document.getElementById('limpiar-carrito-btn');
        const checkoutBtn = document.getElementById('checkout-btn');

        carritoLista.innerHTML = ''; 
        let subtotal = 0;

        if (carrito.length === 0) {
            if (mensaje) {
                mensaje.innerHTML = '<i class="fas fa-shopping-cart mr-2"></i> Tu carrito está vacío.';
                mensaje.classList.remove('hidden');
            }
            if (limpiarBtn) limpiarBtn.disabled = true;
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            if (mensaje) mensaje.classList.add('hidden');
            if (limpiarBtn) limpiarBtn.disabled = false;
            if (checkoutBtn) checkoutBtn.disabled = false;

            carrito.forEach(item => {
                const itemTotal = item.precio * item.cantidad;
                subtotal += itemTotal;

                const itemHtml = `
                <div class="grid grid-cols-2 md:grid-cols-5 gap-4 items-center border-b py-4">
                    <div class="col-span-2 flex items-center gap-4">
                        <a href="producto-detalle.html?id=${item.id}">
                            <img src="${item.imagenUrl}" alt="${item.nombre}" class="w-16 h-16 rounded-lg object-cover shadow-sm">
                        </a>
                        <div>
                            <h3 class="font-bold text-oscuro">${item.nombre}</h3>
                            <button data-id="${item.id}" class="carrito-remover-btn text-red-500 hover:text-red-700 text-sm font-semibold">
                                Eliminar
                            </button>
                        </div>
                    </div>
                    <p class="hidden md:block text-center text-gray-700">$${item.precio.toLocaleString('es-CO')}</p>
                    <div class="flex justify-center">
                        <input type="number" value="${item.cantidad}" min="1" data-id="${item.id}"
                               class="carrito-cantidad-input w-16 text-center border border-gray-300 rounded-lg p-2">
                    </div>
                    <p class="text-right font-bold text-oscuro">$${itemTotal.toLocaleString('es-CO')}</p>
                </div>`;
                carritoLista.insertAdjacentHTML('beforeend', itemHtml);
            });
        }

        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString('es-CO')}`;
        if (totalEl) totalEl.textContent = `$${subtotal.toLocaleString('es-CO')}`;
        
        document.querySelectorAll('.carrito-remover-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const carritoActual = getCarrito();
                const nuevoCarrito = carritoActual.filter(item => item.id !== id);
                saveCarrito(nuevoCarrito); 
                renderizarCarrito(); 
            });
        });

        document.querySelectorAll('.carrito-cantidad-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = e.currentTarget.dataset.id;
                let nuevaCantidad = parseInt(e.currentTarget.value);
                if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
                    nuevaCantidad = 1; 
                }
                
                const carritoActual = getCarrito();
                const itemIndex = carritoActual.findIndex(item => item.id === id);

                if (itemIndex > -1) {
                    carritoActual[itemIndex].cantidad = nuevaCantidad;
                    saveCarrito(carritoActual); 
                    renderizarCarrito();
                }
            });
        });
    }

    function inicializarPaginaCarrito() {
        const carritoLista = document.getElementById('carrito-lista');
        if (!carritoLista) return; 

        renderizarCarrito();

        const limpiarBtn = document.getElementById('limpiar-carrito-btn');
        if (limpiarBtn) {
            limpiarBtn.addEventListener('click', () => {
                saveCarrito([]); 
                renderizarCarrito();
            });
        }

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                window.location.href = 'checkout.html';
            });
        }
    }

    // --- ======================================================= ---
    // --- 7. DEFINICIÓN DE LÓGICA: CHECKOUT (checkout.html) ---
    // --- ======================================================= ---
    
    let costoEnvioCache = 0; 
    let tiempoEnvioCache = '...'; 
    let subtotalCache = 0;   
    let ePaycoHandler; 

    async function generarGuiaYConfirmar(cliente) {
        const btn = document.getElementById('finalizar-pedido-btn');
        const errorMsg = document.getElementById('checkout-error-msg');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Confirmando pedido...';

        const carrito = getCarrito();
        
        try {
            const response = await fetch('https://proyecto-arte-sol.vercel.app/api/envio/generar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    cliente: cliente, 
                    carrito: carrito,
                    costoEnvio: costoEnvioCache,
                    tiempoEntrega: tiempoEnvioCache
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'El servidor rechazó el pedido.');
            }

            const data = await response.json();
            
            if (data.exito) {
                saveCarrito([]); 
                localStorage.setItem('artesolUltimaGuia', data.guia);
                window.location.href = `confirmacion.html`;
            } else {
                throw new Error(data.msg || 'Error al generar guía.');
            }

        } catch (error) {
            console.error("Error al finalizar pedido:", error);
            errorMsg.textContent = `Error: ${error.message}. Tu pago fue recibido, contacta a soporte.`;
            btn.disabled = false;
            btn.innerHTML = 'Error, reintentar';
        }
    }

    async function cotizarEnvio() {
        const ciudadInput = document.getElementById('checkout-ciudad');
        if (!ciudadInput) return; 
        
        const ciudad = ciudadInput.value;
        const envioEl = document.getElementById('checkout-envio');
        const tiempoEl = document.getElementById('checkout-tiempo'); 

        if (!ciudad) {
            envioEl.textContent = 'Ingresa una ciudad';
            tiempoEl.textContent = ''; 
            return;
        }

        envioEl.innerHTML = '<i class="fas fa-spinner fa-spin text-sm"></i>';
        tiempoEl.innerHTML = '...'; 

        try {
            const response = await fetch('https://proyecto-arte-sol.vercel.app/api/envio/cotizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ciudad: ciudad })
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.msg || 'No se pudo cotizar');
            }

            const data = await response.json();
            
            costoEnvioCache = data.costoEnvio;
            tiempoEnvioCache = data.tiempoEntrega;
            
            envioEl.textContent = `$${costoEnvioCache.toLocaleString('es-CO')}`;
            tiempoEl.textContent = data.tiempoEntrega; 
            
            actualizarTotalCheckout();

        } catch (error) {
            console.error("Error al cotizar envío:", error);
            envioEl.textContent = 'Error al cotizar';
            tiempoEl.textContent = 'N/A';
            costoEnvioCache = 0;
            actualizarTotalCheckout();
        }
    }

    function actualizarTotalCheckout() {
        const totalEl = document.getElementById('checkout-total');
        if (!totalEl) return;
        const total = subtotalCache + costoEnvioCache;
        totalEl.textContent = `$${total.toLocaleString('es-CO')}`;
    }

    function inicializarPaginaCheckout() {
        const checkoutContainer = document.getElementById('checkout-container');
        if (!checkoutContainer) return; 
        
        const carrito = getCarrito();
        const listaEl = document.getElementById('checkout-lista-productos');
        const subtotalEl = document.getElementById('checkout-subtotal');
        const envioEl = document.getElementById('checkout-envio');
        const tiempoEl = document.getElementById('checkout-tiempo');
        const form = document.getElementById('checkout-form');
        const finalizarBtn = document.getElementById('finalizar-pedido-btn');
        const errorMsg = document.getElementById('checkout-error-msg');

        if (carrito.length === 0) {
            checkoutContainer.classList.add('hidden');
            document.getElementById('checkout-vacio').classList.remove('hidden');
            return;
        }

        listaEl.innerHTML = ''; 
        subtotalCache = 0; 
        let descripcionProductos = []; 

        carrito.forEach(item => {
            const itemTotal = item.precio * item.cantidad;
            subtotalCache += itemTotal;
            descripcionProductos.push(`${item.nombre} x${item.cantidad}`);
            
            const itemHtml = `
            <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <img src="${item.imagenUrl}" alt="${item.nombre}" class="w-12 h-12 rounded-lg object-cover shadow-sm">
                    <div>
                        <h3 class="font-bold text-oscuro text-sm">${item.nombre}</h3>
                        <p class="text-sm text-gray-500">Cant: ${item.cantidad}</p>
                    </div>
                </div>
                <span class="font-semibold text-gray-700 text-sm">$${itemTotal.toLocaleString('es-CO')}</span>
            </div>`;
            listaEl.insertAdjacentHTML('beforeend', itemHtml);
        });

        subtotalEl.textContent = `$${subtotalCache.toLocaleString('es-CO')}`;
        envioEl.textContent = '...';
        tiempoEl.textContent = 'Ingresa tu ciudad';
        actualizarTotalCheckout(); 

        document.getElementById('checkout-ciudad').addEventListener('change', cotizarEnvio);

        let intentosEspera = 0;
        const maxIntentos = 50; // Esperar 5 segundos (50 * 100ms)

        function esperarEpaycoYActivarBoton() {
            if (typeof ePayco === 'undefined' || typeof ePayco.checkout === 'undefined' || typeof ePayco.checkout.create !== 'function') {
                intentosEspera++;
                if (intentosEspera > maxIntentos) {
                    console.error("ePayco SDK no cargó después de 5 segundos.");
                    errorMsg.textContent = "Error: No se pudo cargar la pasarela de pago. Por favor, deshabilita tu bloqueador de anuncios (AdBlock) y refresca la página.";
                    
                    // --- ¡INICIO PLAN B! ---
                    // ePayco falló. Activar el botón de simulación
                    finalizarBtn.disabled = false;
                    finalizarBtn.innerHTML = '<i class="fas fa-magic mr-2"></i> Confirmar Pedido (Simulado)';
                    finalizarBtn.classList.replace('bg-verde-menta', 'bg-gray-500'); // Cambiar color a gris
                    
                    finalizarBtn.addEventListener('click', (e) => {
                         e.preventDefault();
                         if (!form.checkValidity()) {
                            form.reportValidity();
                            errorMsg.textContent = 'Por favor completa todos los campos requeridos.';
                            return;
                         }
                         if (costoEnvioCache === 0 || tiempoEnvioCache === '...' || tiempoEnvioCache === 'N/A' || envioEl.textContent === 'Error al cotizar') {
                             errorMsg.textContent = 'Por favor, ingresa una ciudad válida y cotiza tu envío.';
                             return;
                         }
                         
                         // Obtener datos del cliente y simular pago
                         const cliente = {
                             nombre: form.elements['nombre'].value,
                             email: form.elements['email'].value,
                             telefono: form.elements['telefono'].value,
                             direccion: form.elements['direccion'].value,
                             ciudad: form.elements['ciudad'].value,
                             departamento: form.elements['departamento'].value,
                             notas: form.elements['notas'].value
                         };
                         console.warn("MODO SIMULACIÓN: ePayco no cargó. Saltando al generador de guía.");
                         generarGuiaYConfirmar(cliente);
                    });
                    // --- ¡FIN PLAN B! ---
                    
                    return; 
                }
                console.warn("Esperando a ePayco SDK...");
                setTimeout(esperarEpaycoYActivarBoton, 100);
            } else {
                // --- PLAN A (ePayco SÍ cargó) ---
                console.log("ePayco SDK cargado. Creando handler...");
                
                ePaycoHandler = ePayco.checkout.create({
                    key: EPAYCO_P_KEY,
                    test: true, 
                    response: function(response) {
                        const cliente = {
                             nombre: form.elements['nombre'].value,
                             email: form.elements['email'].value,
                             telefono: form.elements['telefono'].value,
                             direccion: form.elements['direccion'].value,
                             ciudad: form.elements['ciudad'].value,
                             departamento: form.elements['departamento'].value,
                             notas: form.elements['notas'].value
                        };
                        switch (response.data.x_cod_response) {
                            case 1: // Aprobada
                                console.log("Pago APROBADO. Generando guía...");
                                generarGuiaYConfirmar(cliente);
                                break;
                            default: // Rechazada, Pendiente, Fallida o Cerrada
                                errorMsg.textContent = "El pago no se completó o fue rechazado.";
                                finalizarBtn.disabled = false;
                                finalizarBtn.innerHTML = 'Pagar Ahora';
                                break;
                        }
                    }
                });
                
                finalizarBtn.disabled = false; 
                console.log("Botón de pago activado.");

                finalizarBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    if (!form.checkValidity()) {
                        form.reportValidity();
                        errorMsg.textContent = 'Por favor completa todos los campos requeridos.';
                        return;
                    }
                    if (costoEnvioCache === 0 || tiempoEnvioCache === '...' || tiempoEnvioCache === 'N/A' || envioEl.textContent === 'Error al cotizar') {
                         errorMsg.textContent = 'Por favor, ingresa una ciudad válida y cotiza tu envío.';
                         return;
                    }
                    
                    errorMsg.textContent = '';
                    finalizarBtn.disabled = true;
                    finalizarBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Conectando...';

                    const formData = new FormData(form);
                    const total = subtotalCache + costoEnvioCache;

                    ePaycoHandler.open({
                        external: false, 
                        amount: total.toString(),
                        tax_base: subtotalCache.toString(),
                        tax: "0",
                        currency: 'COP',
                        invoice: `ARTESOL-${Date.now()}`, 
                        name: 'Pedido Artesol',
                        description: descripcionProductos.join(', '),
                        customerid: EPAYCO_P_CUST_ID,
                        name_billing: formData.get('nombre'),
                        address_billing: formData.get('direccion'),
                        email_billing: formData.get('email'),
                        mobilephone_billing: formData.get('telefono'),
                        country: 'CO',
                        lang: 'es',
                    });
                });
            }
        }

        // Iniciar la función "esperadora"
        esperarEpaycoYActivarBoton();
    }

    // --- ======================================================= ---
    // --- 8. DEFINICIÓN DE LÓGICA: CONFIRMACIÓN (confirmacion.html) ---
    // --- ======================================================= ---

    function inicializarPaginaConfirmacion() {
        const guiaEl = document.getElementById('numero-guia');
        if (!guiaEl) return; // Salir si no estamos en esta página

        const guia = localStorage.getItem('artesolUltimaGuia');

        if (guia) {
            guiaEl.textContent = guia;
            localStorage.removeItem('artesolUltimaGuia');
        } else {
            guiaEl.textContent = 'N/A';
        }
    }

    // --- ======================================================= ---
    // --- 9. DEFINICIÓN DE LÓGICA: OTRAS PÁGINAS (Blog, Contacto, etc.) ---
    // --- (¡RESTAURADAS!) ---
    // --- ======================================================= ---

    async function cargarResenasAleatorias() { 
        const reseñasGrilla = document.getElementById('reseñas-grilla');
        if (!reseñasGrilla) return; 
        
        const urlApi = 'https://proyecto-arte-sol.vercel.app/api/resenas/aleatorias?cantidad=3';
        reseñasGrilla.innerHTML = '<p class="col-span-3 text-center text-gray-600">Cargando opiniones...</p>';

        try {
            const response = await fetch(urlApi);
            if (!response.ok) throw new Error('Error al cargar las reseñas aleatorias.');
            
            const reseñas = await response.json();
            reseñasGrilla.innerHTML = '';

            if (reseñas.length === 0) {
                reseñasGrilla.innerHTML = '<p class="col-span-3 text-center text-gray-600">Aún no hay opiniones de clientes para mostrar.</p>';
                return;
            }

            reseñas.forEach(reseña => {
                const estrellasHtml = '<span class="text-yellow-400">★</span>'.repeat(reseña.calificacion) + 
                                      '<span class="text-gray-300">★</span>'.repeat(5 - reseña.calificacion);
                const reseñaHtml = `
                <div class="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col justify-between h-full">
                    <div>
                        <div class="flex items-center mb-3">
                            <div>
                                <p class="font-bold text-oscuro">${reseña.nombreCliente}</p>
                                <div class="flex text-lg">${estrellasHtml}</div>
                            </div>
                        </div>
                        <p class="text-gray-700 italic">"${reseña.comentario}"</p>
                    </div>
                    <p class="text-sm text-gray-500 mt-4 text-right">${new Date(reseña.fechaResena).toLocaleDateString('es-CO')}</p>
                </div>`;
                reseñasGrilla.insertAdjacentHTML('beforeend', reseñaHtml);
            });
        } catch (error) {
            console.error('Error al cargar reseñas aleatorias:', error);
            reseñasGrilla.innerHTML = '<p class="col-span-3 text-center text-red-500">Error al cargar opiniones. Intenta de nuevo más tarde.</p>';
        }
    }

    async function cargarPostsAleatorios() {
        const grilla = document.getElementById('grilla-blog-inicio'); 
        if (!grilla) return; 
        
        const urlApi = 'https://proyecto-arte-sol.vercel.app/api/blog/aleatorios?cantidad=3';
        grilla.innerHTML = '<p class="text-lg text-oscuro col-span-3 text-center">Cargando inspiración...</p>';

        try {
            const response = await fetch(urlApi);
            if (!response.ok) throw new Error('Error al cargar los posts aleatorios.');
            
            const posts = await response.json();
            grilla.innerHTML = ''; 

            if (posts.length === 0) {
                grilla.innerHTML = '<p class="text-lg text-oscuro col-span-3 text-center">No hay artículos para mostrar por el momento.</p>';
                return;
            }

            posts.forEach(post => {
                const fecha = new Date(post.fechaPublicacion).toLocaleDateString('es-CO', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
                const postHtml = `
                <article class="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
                    <a href="post.html?id=${post._id}"> 
                        <img src="${post.bannerUrl}" alt="${post.titulo}" class="w-full h-56 object-cover">
                    </a>
                    <div class="p-6 flex flex-col flex-grow">
                        <span class="text-sm text-gray-500 mb-2">${fecha}</span>
                        <h3 class="text-2xl font-serif-delicado text-oscuro mb-3">${post.titulo}</h3>
                        <p class="text-gray-700 mb-5 flex-grow">${post.contenido.substring(0, 100)}...</p>
                        <a href="post.html?id=${post._id}" class="text-verde-menta hover:underline font-bold text-lg mt-auto">Leer más &rarr;</a>
                    </div>
                </article>`;
                grilla.insertAdjacentHTML('beforeend', postHtml);
            });
        } catch (error) {
            console.error('Error al cargar posts aleatorios:', error);
            grilla.innerHTML = '<p class="text-lg text-red-500 col-span-3 text-center">Error al cargar la inspiración.</p>';
        }
    }

    function inicializarFormularioContacto() {
        const formularioContacto = document.getElementById('formulario-contacto');
        if (!formularioContacto) return; 

        const mensajeFeedback = document.getElementById('mensaje-feedback');

        formularioContacto.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            mensajeFeedback.textContent = 'Enviando...';
            mensajeFeedback.className = 'mt-4 text-center text-lg font-semibold text-gray-600';

            const datosFormulario = {
                nombre: document.getElementById('nombre-contacto').value,
                email: document.getElementById('email-contacto').value,
                mensaje: document.getElementById('mensaje-contacto').value,
            };

            try {
                const response = await fetch('https://proyecto-arte-sol.vercel.app/api/contacto', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosFormulario)
                });

                const data = await response.json();

                if (response.ok) {
                    mensajeFeedback.textContent = data.msg;
                    mensajeFeedback.className = 'mt-4 text-center text-lg font-semibold text-green-700';
                    formularioContacto.reset(); 
                } else {
                    mensajeFeedback.textContent = data.msg || 'Hubo un error al enviar el mensaje.';
                    mensajeFeedback.className = 'mt-4 text-center text-lg font-semibold text-red-700';
                }

            } catch (error) {
                console.error('Error de red o del servidor:', error);
                mensajeFeedback.textContent = 'No se pudo conectar con el servidor. Intenta de nuevo más tarde.';
                mensajeFeedback.className = 'mt-4 text-center text-lg font-semibold text-red-700';
            }
        });
    }

    // --- ======================================================= ---
    // --- 10. EJECUCIÓN E INICIALIZACIÓN DE TODAS LAS PÁGINAS ---
    // --- ======================================================= ---

    // Cargar Header y Footer
    await cargarComponente("componentes/header.html", "app-header");
    await cargarComponente("componentes/footer.html", "app-footer");
    
    // Actualizar el carrito en el Nav (ahora que el header existe)
    actualizarNavCarrito();

    // Lógica Tienda
    const productosGrillaElem = document.getElementById('productos-grilla');
    if (productosGrillaElem) {

       const toggleFilterBtn = document.getElementById('toggle-filter-btn');
        const filtrosTienda = document.getElementById('filtros-tienda');

        if (toggleFilterBtn && filtrosTienda) {
            toggleFilterBtn.addEventListener('click', () => {
                // 1. Alternar la clase 'open' que controla la visibilidad en CSS
                filtrosTienda.classList.toggle('open');
                
                // 2. Cambiar el texto del botón dinámicamente
                const isOpen = filtrosTienda.classList.contains('open');
                const btnText = toggleFilterBtn.querySelector('span');
                if (btnText) {
                    btnText.textContent = isOpen ? 'Ocultar Filtros' : 'Mostrar Filtros';
                }
            });
        }

        const urlParams = new URLSearchParams(window.location.search);
        const initialFilters = {
            searchTerm: urlParams.get('search') || '',
            category: urlParams.get('category') || '',
            minPrice: urlParams.get('minPrice') || '',
            maxPrice: urlParams.get('maxPrice') || '',
        };
        const initialPage = parseInt(urlParams.get('page')) || 1;
        
        (async () => { 
            await populateCategories(initialFilters.category); 
            
            const searchInputElem = document.getElementById('search-input');
            const minPriceFilterElem = document.getElementById('min-price-filter');
            const maxPriceFilterElem = document.getElementById('max-price-filter');
            
            if (searchInputElem) searchInputElem.value = initialFilters.searchTerm;
            if (minPriceFilterElem) minPriceFilterElem.value = initialFilters.minPrice;
            if (maxPriceFilterElem) maxPriceFilterElem.value = initialFilters.maxPrice;
            
            cargarProductos(getCurrentFilters(), initialPage);
        })();

        // --- Event Listeners para FILTROS ---
        const searchButtonElem = document.getElementById('search-button');
        if (searchButtonElem) {
            searchButtonElem.addEventListener('click', getAndApplyFilters);
            const searchInputElem = document.getElementById('search-input');
            if (searchInputElem) {
                searchInputElem.addEventListener('keypress', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        getAndApplyFilters();
                    }
                });
            }
        }
        const applyFiltersButtonElem = document.getElementById('apply-filters-button');
        if (applyFiltersButtonElem) applyFiltersButtonElem.addEventListener('click', getAndApplyFilters);
        
        const clearFiltersButtonElem = document.getElementById('clear-filters-button');
        if (clearFiltersButtonElem) clearFiltersButtonElem.addEventListener('click', clearAllFilters);
        
        const categoryFilterElem = document.getElementById('category-filter');
        if (categoryFilterElem) categoryFilterElem.addEventListener('change', getAndApplyFilters); 

        // --- Event Listeners para PAGINACIÓN ---
        const prevPageBtnElem = document.getElementById('prev-page-btn');
        const nextPageBtnElem = document.getElementById('next-page-btn');
        if (prevPageBtnElem) prevPageBtnElem.addEventListener('click', () => {
            if (currentPage > 1) cargarProductos(getCurrentFilters(), currentPage - 1);
        });
        if (nextPageBtnElem) nextPageBtnElem.addEventListener('click', () => {
            if (currentPage < totalPages) cargarProductos(getCurrentFilters(), currentPage + 1);
        });
    }

    // Lógica Inicio
    const heroCarouselElem = document.getElementById('hero-carousel');
    if (heroCarouselElem) {
        inicializarCarruselHeroe();
        cargarProductosAleatoriosGrilla();
        cargarResenasAleatorias(); 
        cargarPostsAleatorios();
        inicializarFormularioContacto();
    }

    // Lógica Detalle
    const detalleProductoContainerElem = document.getElementById('detalle-producto-container');
    if (detalleProductoContainerElem) {
        cargarDetalleProducto();
    }

    // Lógica Carrito
    inicializarPaginaCarrito(); // (La función ya tiene su 'if' adentro)

    // Lógica Checkout
    inicializarPaginaCheckout(); // (La función ya tiene su 'if' adentro)

    // Lógica Confirmación
    inicializarPaginaConfirmacion(); // (La función ya tiene su 'if' adentro)

    // Lógica para páginas genéricas (Blog, Contacto, Reseñas)
    const reseñasGrilla = document.getElementById('reseñas-grilla');
    if (reseñasGrilla && !heroCarouselElem) { // Solo si no es la home
        cargarResenasAleatorias();
    }
    
    const grillaBlog = document.getElementById('grilla-blog-inicio');
    if (grillaBlog && !heroCarouselElem) { // Solo si no es la home
        cargarPostsAleatorios();
    }
    
    const formularioContacto = document.getElementById('formulario-contacto');
    if (formularioContacto && !heroCarouselElem) { // Solo si no es la home
        inicializarFormularioContacto();
    }

    // --- LÓGICA DEL MENÚ MÓVIL (RESPONSIVE) ---
    // Esta función se ejecuta después de cargar el header dinámicamente
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    // Como el header se carga con fetch, a veces el botón aún no existe en el DOM inmediato.
    // Usamos delegación de eventos en el documento para asegurar que funcione.
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('#mobile-menu-btn');
        
        if (btn) {
            const menu = document.getElementById('mobile-menu');
            if (menu) {
                menu.classList.toggle('hidden');
                // Cambiar icono (Hamburguesa <-> X)
                const icon = btn.querySelector('i');
                if (menu.classList.contains('hidden')) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                } else {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                }
            }
        } else {
            // Cerrar menú si se hace clic fuera
            const menu = document.getElementById('mobile-menu');
            const isClickInsideMenu = e.target.closest('#mobile-menu');
            
            if (menu && !menu.classList.contains('hidden') && !isClickInsideMenu) {
                menu.classList.add('hidden');
                const btnIcon = document.getElementById('mobile-menu-btn').querySelector('i');
                btnIcon.classList.remove('fa-times');
                btnIcon.classList.add('fa-bars');
            }
        }
    });


}); // Cierre del DOMContentLoaded principal