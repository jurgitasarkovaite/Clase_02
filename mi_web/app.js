const BASE_URL = 'http://127.0.0.1:8000';
let loggedInUser = null;

// Función para cambiar de tab
function switchTab(tabName) {
    // Quitar clase active de todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    // Agregar clase active a la sección seleccionada
    document.getElementById(tabName).classList.add('active');

    // Si no hay usuario logueado y el tab es protegido, redirigir a acceso
    if (!loggedInUser && ['servicios', 'mascotas', 'reporte'].includes(tabName)) {
        switchTab('acceso');
        return;
    }

    // Si está logueado y en reporte, pre-llenar el correo
    if (loggedInUser && tabName === 'reporte') {
        document.getElementById('report-email').value = loggedInUser;
    }

    // Cargar datos específicos del tab si es necesario
    if (tabName === 'servicios') {
        loadServices();
    } else if (tabName === 'mascotas') {
        loadPets();
    }
}

// Función para mostrar alertas temporales
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.padding = '10px';
    alertDiv.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    alertDiv.style.color = 'white';
    alertDiv.style.borderRadius = '5px';
    alertDiv.style.zIndex = '1000';
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Función para cargar servicios
function loadServices() {
    fetch(`${BASE_URL}/servicios`)
        .then(response => response.json())
        .then(data => {
            // Poblar lista de servicios
            const ul = document.getElementById('services-ul');
            ul.innerHTML = '';
            data.servicios.forEach(service => {
                const li = document.createElement('li');
                li.textContent = `${service.nombre} - $${service.precio}`;
                ul.appendChild(li);
            });

            // Poblar select en formulario de mascotas
            const select = document.getElementById('pet-service');
            select.innerHTML = '<option value="">Seleccionar servicio</option>';
            data.servicios.forEach(service => {
                const option = document.createElement('option');
                option.value = service.nombre;
                option.textContent = service.nombre;
                select.appendChild(option);
            });
        })
        .catch(error => showAlert('Error al cargar servicios', 'error'));
}

// Función para cargar mascotas del usuario logueado
function loadPets() {
    if (!loggedInUser) return;
    fetch(`${BASE_URL}/mascotas/${loggedInUser}`)
        .then(response => response.json())
        .then(data => {
            // Crear contenedor para cards si no existe
            let cardsContainer = document.getElementById('pets-cards');
            if (!cardsContainer) {
                cardsContainer = document.createElement('div');
                cardsContainer.id = 'pets-cards';
                cardsContainer.style.display = 'flex';
                cardsContainer.style.flexWrap = 'wrap';
                cardsContainer.style.gap = '10px';
                document.querySelector('#mascotas .register-pet-form').after(cardsContainer);
            }
            cardsContainer.innerHTML = '';

            // Renderizar cards
            data.mascotas.forEach(pet => {
                const card = document.createElement('div');
                card.className = 'pet-card';
                card.style.border = '1px solid #ccc';
                card.style.padding = '10px';
                card.style.borderRadius = '5px';
                card.style.width = '200px';
                card.innerHTML = `
                    <h4>${pet.nombre}</h4>
                    <p>Servicio: ${pet.tipo_servicio}</p>
                    <p>Fecha: ${pet.fecha}</p>
                `;
                cardsContainer.appendChild(card);
            });
        })
        .catch(error => showAlert('Error al cargar mascotas', 'error'));
}

// Función para logout
function logout() {
    loggedInUser = null;
    document.querySelector('.user-badge').style.display = 'none';
    document.querySelector('.logout-btn').style.display = 'none';
    switchTab('acceso');
}

// Event listeners para tabs
document.querySelectorAll('.sidebar-nav li').forEach(li => {
    li.addEventListener('click', () => {
        switchTab(li.dataset.tab);
    });
});

// Event listener para formulario de saludo
document.querySelector('.greeting-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('user-name').value;
    fetch(`${BASE_URL}/bienvenido/${name}`)
        .then(response => response.json())
        .then(data => {
            showAlert(data.mensaje, 'success');
        })
        .catch(error => showAlert('Error al saludar', 'error'));
});

// Event listener para formulario de registro
document.querySelector('.register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contrasena: password })
    })
    .then(response => {
        if (response.ok) {
            showAlert('Registro exitoso', 'success');
            document.querySelector('.register-form').reset();
        } else {
            showAlert('Error en registro', 'error');
        }
    })
    .catch(error => showAlert('Error en registro', 'error'));
});

// Event listener para formulario de login
document.querySelector('.login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contrasena: password })
    })
    .then(response => {
        if (response.ok) {
            loggedInUser = email;
            document.querySelector('.user-badge span').textContent = `Usuario: ${email}`;
            document.querySelector('.user-badge').style.display = 'block';
            document.querySelector('.logout-btn').style.display = 'block';
            showAlert('Login exitoso', 'success');
            switchTab('servicios');
        } else {
            showAlert('Credenciales incorrectas', 'error');
        }
    })
    .catch(error => showAlert('Error en login', 'error'));
});

// Event listener para formulario de agregar servicio
document.querySelector('.add-service-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('service-name').value;
    const price = parseFloat(document.getElementById('service-price').value);
    fetch(`${BASE_URL}/agregar-servicio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: name, precio: price })
    })
    .then(response => {
        if (response.ok) {
            showAlert('Servicio agregado', 'success');
            document.querySelector('.add-service-form').reset();
            loadServices();
        } else {
            showAlert('Error al agregar servicio', 'error');
        }
    })
    .catch(error => showAlert('Error al agregar servicio', 'error'));
});

// Event listener para formulario de registrar mascota
document.querySelector('.register-pet-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('pet-email').value;
    const name = document.getElementById('pet-name').value;
    const service = document.getElementById('pet-service').value;
    const date = document.getElementById('pet-date').value;
    fetch(`${BASE_URL}/registrar-mascota`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, nombre: name, tipo_servicio: service, fecha: date })
    })
    .then(response => {
        if (response.ok) {
            showAlert('Mascota registrada', 'success');
            document.querySelector('.register-pet-form').reset();
            if (email === loggedInUser) {
                loadPets();
            }
        } else {
            showAlert('Error al registrar mascota', 'error');
        }
    })
    .catch(error => showAlert('Error al registrar mascota', 'error'));
});

// Event listener para búsqueda de mascota
document.getElementById('search-btn').addEventListener('click', function() {
    const searchTerm = document.getElementById('search-pet').value.toLowerCase();
    const cards = document.querySelectorAll('#pets-cards .pet-card');
    cards.forEach(card => {
        const name = card.querySelector('h4').textContent.toLowerCase();
        if (name.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// Event listener para búsqueda de reporte
document.getElementById('report-search-btn').addEventListener('click', function() {
    const email = document.getElementById('report-email').value;
    fetch(`${BASE_URL}/reporte/${email}`)
        .then(response => response.json())
        .then(data => {
            const resultsArea = document.getElementById('results-area');
            resultsArea.innerHTML = `
                <div class="stat-box" style="border:1px solid #ccc; padding:10px; margin:5px; display:inline-block;">
                    <h4>Cantidad de Servicios</h4>
                    <p>${data.cantidad_servicios}</p>
                </div>
                <div class="stat-box" style="border:1px solid #ccc; padding:10px; margin:5px; display:inline-block;">
                    <h4>Total Gastado</h4>
                    <p>$${data.total_gastado}</p>
                </div>
                <div class="stat-box" style="border:1px solid #ccc; padding:10px; margin:5px; display:inline-block;">
                    <h4>Correo</h4>
                    <p>${data.correo}</p>
                </div>
                <div class="services-tags" style="margin-top:20px;">
                    <h4>Servicios Usados</h4>
                    ${data.servicios.map(s => `<span class="tag" style="display:inline-block; background:#eee; padding:5px; margin:2px; border-radius:3px;">${s}</span>`).join('')}
                </div>
            `;
        })
        .catch(error => showAlert('Error al cargar reporte', 'error'));
});

// Event listener para logout
document.querySelector('.logout-btn').addEventListener('click', logout);

// Inicializar
window.addEventListener('load', function() {
    loadServices();
    // Ocultar badge y logout inicialmente
    document.querySelector('.user-badge').style.display = 'none';
    document.querySelector('.logout-btn').style.display = 'none';
    // Iniciar en inicio
    switchTab('inicio');
});