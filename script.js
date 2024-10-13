// Variable para almacenar el contenido del CSV para reutilización
let csvData = [];
let nombreAsignaturaMap = new Map();

// Función para cargar el archivo CSV una vez
async function cargarCSV() {
    try {
        const response = await fetch('Datos/Pruebas.csv');
        if (!response.ok) {
            throw new Error(`Error al cargar el CSV: ${response.statusText}`);
        }
        const data = await response.text();
        csvData = data.split('\n').map(row => row.split(',').map(col => col.trim()));
    } catch (error) {
        console.error("Error al leer el archivo CSV:", error);
    }
}

// Función para cargar los años únicos desde el archivo CSV
function cargarAnios() {
    const anios = new Set();
    csvData.slice(1).forEach(row => {
        const anio = row[0]; // Asumiendo que el año está en la primera columna
        if (anio) {
            anios.add(anio);
        }
    });
    const anoSelect = document.getElementById('ano');
    anios.forEach(anio => {
        const option = document.createElement('option');
        option.value = anio;
        option.textContent = anio;
        anoSelect.appendChild(option);
    });
}

// Función para cargar las pruebas según el año seleccionado
function cargarPruebas() {
    const anio = document.getElementById('ano').value;
    if (!anio) return;

    const pruebas = new Set();
    csvData.slice(1).forEach(row => {
        const [ANIO, NOMBREPRUEBA] = row;
        if (ANIO === anio) {
            pruebas.add(NOMBREPRUEBA);
        }
    });

    const pruebaSelect = document.getElementById('prueba');
    pruebaSelect.innerHTML = '<option value="">Selecciona una prueba</option>';
    pruebas.forEach(prueba => {
        const option = document.createElement('option');
        option.value = prueba;
        option.textContent = prueba;
        pruebaSelect.appendChild(option);
    });
    document.getElementById('container-prueba').style.display = 'block';
}

// Función para cargar los nombres de asignaturas desde el CSV correspondiente
async function cargarNombresAsignaturas() {
    try {
        const response = await fetch('Datos/NombreAsignatura.csv');
        if (!response.ok) {
            throw new Error(`Error al cargar Datos/NombreAsignatura.csv: ${response.statusText}`);
        }
        const data = await response.text();
        const rows = data.split('\n').slice(1); // Saltar la cabecera
        nombreAsignaturaMap.clear();
        rows.forEach(row => {
            const [ASIGNATURA, NOMBREASIGNATURA] = row.split(',').map(col => col.trim());
            if (ASIGNATURA && NOMBREASIGNATURA) {
                nombreAsignaturaMap.set(ASIGNATURA, NOMBREASIGNATURA);
            }
        });
    } catch (error) {
        console.error('Error al cargar los nombres de asignaturas:', error);
    }
}

// Función para buscar y mostrar los resultados del alumno
async function buscar() {
    const codigo = document.getElementById('codigo').value.trim();
    const resultado = document.getElementById('resultado');
    const pruebaBuscada = document.getElementById('prueba').value;

    if (codigo.length !== 4) {
        resultado.innerHTML = 'Por favor, ingresa un código de 4 dígitos.';
        return;
    }

    try {
        await cargarNombresAsignaturas();

        // Encuentra la fila que coincide con la prueba seleccionada
        const filaPrueba = csvData.slice(1).find(row => row[1] === pruebaBuscada); // Asumiendo que la prueba está en la segunda columna
        if (!filaPrueba) return;

        const [ , , asignaturasCSV, archivoCSV] = filaPrueba;
        const asignaturas = asignaturasCSV.split(';').map(item => item.trim());

        // Cargar el archivo CSV correspondiente
        const response = await fetch(`Datos/${archivoCSV}.csv`);
        if (!response.ok) {
            throw new Error(`Error al cargar el archivo de pruebas: ${response.statusText}`);
        }
        const data = await response.text();
        const rows = data.split('\n');
        const header = rows.shift().split(',').map(col => col.trim());
        const columnMap = header.reduce((map, column, index) => {
            map[column] = index;
            return map;
        }, {});

        // Buscar por código
        const filaAlumno = rows.find(row => row.split(',')[columnMap['ID']] === codigo);
        if (!filaAlumno) return;

        const datosAsignaturas = [];
        const columns = filaAlumno.split(',').map(col => col.trim());

        asignaturas.forEach(asignatura => {
            const nombreAsignatura = nombreAsignaturaMap.get(asignatura) || asignatura;
            datosAsignaturas.push({
                nombre: nombreAsignatura,
                respuestasCorrectas: columns[columnMap[asignatura]],
                cantidadPreguntas: columns[columnMap[`Q_${asignatura}`]],
                resultado: columns[columnMap[`R_${asignatura}`]]
            });
        });

        // Mostrar la tabla con resultados
        const tablaNotas = generarTablaNotas(datosAsignaturas);
        resultado.innerHTML = tablaNotas;

        // Mostrar imágenes en paralelo
        const imgExamen1 = `Soportes/${pruebaBuscada}/${codigo}_p1.jpg`;
        const imgExamen2 = `Soportes/${pruebaBuscada}/${codigo}_p2.jpg`;

        await Promise.all([cargarImagen(imgExamen1), cargarImagen(imgExamen2)]);

    } catch (error) {
        console.error('Error al buscar resultados:', error);
    }
}

// Función para generar la tabla de notas
function generarTablaNotas(datosAsignaturas) {
    return `
        <table border="1" style="border-collapse: collapse; width: 100%; font-size: 25px;">
            <thead>
                <tr>
                    <th>Asignatura</th>
                    <th>Aciertos</th>
                    <th>Nota</th>
                </tr>
            </thead>
            <tbody>
                ${datosAsignaturas.map(asignatura => `
                    <tr>
                        <td>${asignatura.nombre}</td>
                        <td>${asignatura.respuestasCorrectas} / ${asignatura.cantidadPreguntas}</td>
                        <td>${asignatura.resultado}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Función para cargar imágenes en paralelo
async function cargarImagen(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const imgElement = document.createElement('img');
            imgElement.src = url;
            imgElement.style.width = '100px';
            document.getElementById('resultado').appendChild(imgElement);
        }
    } catch (error) {
        console.error(`Error al cargar la imagen: ${url}`);
    }
}
