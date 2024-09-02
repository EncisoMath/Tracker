// Función para cargar los años únicos desde el archivo CSV
async function cargarAnios() {
    try {
        const response = await fetch('Datos/Pruebas.csv');
        if (!response.ok) {
            throw new Error(`Error al cargar el CSV: ${response.statusText}`);
        }
        const data = await response.text();
        const rows = data.split('\n').slice(1); // Saltar la cabecera

        // Extraer años únicos
        const anios = new Set();
        rows.forEach(row => {
            const columns = row.split(',');
            if (columns.length) {
                const [ANIO] = columns.map(col => col.trim()); // Extraer el valor de ANIO
                anios.add(ANIO);
            }
        });

        const anoSelect = document.getElementById('ano');
        anios.forEach(anio => {
            const option = document.createElement('option');
            option.value = anio;
            option.textContent = anio;
            anoSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error al cargar los años:', error);
    }
}

// Función para cargar las pruebas según el año seleccionado
async function cargarPruebas() {
    const anio = document.getElementById('ano').value;
    if (!anio) return;

    try {
        const response = await fetch('Datos/Pruebas.csv');
        if (!response.ok) {
            throw new Error(`Error al cargar el CSV: ${response.statusText}`);
        }
        const data = await response.text();
        const rows = data.split('\n').slice(1); // Saltar la cabecera

        // Extraer pruebas para el año seleccionado
        const pruebas = new Set();
        rows.forEach(row => {
            const columns = row.split(',');
            if (columns.length) {
                const [ANIO, NOMBREPRUEBA] = columns.map(col => col.trim()); // Extraer valores de ANIO y PRUEBA
                if (ANIO === anio) {
                    pruebas.add(NOMBREPRUEBA);
                }
            }
        });

        const pruebaSelect = document.getElementById('prueba');
        pruebaSelect.innerHTML = '<option value="">Selecciona una prueba</option>'; // Limpiar opciones anteriores
        pruebas.forEach(prueba => {
            const option = document.createElement('option');
            option.value = prueba;
            option.textContent = prueba;
            pruebaSelect.appendChild(option);
        });

        document.getElementById('container-prueba').style.display = 'block'; // Mostrar el campo de prueba

    } catch (error) {
        console.error('Error al cargar las pruebas:', error);
    }
}

// Función para cargar las asignaturas según la prueba seleccionada
async function cargarAsignaturas() {
    const anio = document.getElementById('ano').value;
    const prueba = document.getElementById('prueba').value;
    if (!anio || !prueba) return [];

    try {
        const response = await fetch('Datos/Pruebas.csv');
        if (!response.ok) {
            throw new Error(`Error al cargar el CSV: ${response.statusText}`);
        }
        const data = await response.text();
        const rows = data.split('\n'); // Incluye el encabezado
        const header = rows[0].split(',').map(col => col.trim()); // Obtener la cabecera
        const columnMap = header.reduce((map, column, index) => {
            map[column] = index;
            return map;
        }, {});

        let asignaturas = [];
        rows.slice(1).forEach(row => { // Saltar la cabecera
            const columns = row.split(',').map(col => col.trim());
            if (columns[columnMap['ANIO']] === anio && columns[columnMap['NOMBREPRUEBA']] === prueba) {
                // Iterar sobre las columnas que corresponden a asignaturas
                header.forEach((col, index) => {
                    if (col !== 'ANIO' && col !== 'NOMBREPRUEBA' && columns[index] === '1') {
                        asignaturas.push(col); // Añadir la asignatura si es 1
                    }
                });
            }
        });

        return asignaturas;

    } catch (error) {
        console.error('Error al cargar las asignaturas:', error);
        return [];
    }
}

// Función para buscar y mostrar los resultados del alumno
async function buscar() {
    const codigo = document.getElementById('codigo').value.trim();
    const resultado = document.getElementById('resultado');
    const anio = document.getElementById('ano').value;
    const prueba = document.getElementById('prueba').value;

    if (codigo.length !== 4) {
        resultado.innerHTML = 'Por favor, ingresa un código de 4 dígitos.';
        return;
    }

    try {
        const nombreAsignaturaMap = await cargarNombresAsignaturas();
        const asignaturas = await cargarAsignaturas(); // Cargar asignaturas según la prueba seleccionada
        const response = await fetch('Datos/datos.csv');
        if (!response.ok) {
            throw new Error(`Error al cargar el CSV: ${response.statusText}`);
        }
        const data = await response.text();
        const rows = data.split('\n');

        // Obtener los nombres de las columnas
        const header = rows.shift().split(',').map(col => col.trim()); // Obtener la primera fila como encabezado

        // Crear un mapa de nombres de columna a índices
        const columnMap = header.reduce((map, column, index) => {
            map[column] = index;
            return map;
        }, {});

        let encontrado = false;
        const datosAsignaturas = [];

        for (const row of rows) {
            const columns = row.split(',').map(col => col.trim());
            if (columns.length) {
                const ANIO = columns[columnMap['ANIO']];
                const PRUEBA = columns[columnMap['PRUEBA']];
                const ID = columns[columnMap['ID']];
                const NOMBRE = columns[columnMap['NOMBRE']];
                const SEDE = columns[columnMap['SEDE']];
                const GRADO = columns[columnMap['GRADO']];
                const RANKING = columns[columnMap['RANKING']];

                if (ANIO === anio && PRUEBA === prueba && ID === codigo) {
                    asignaturas.forEach(asignatura => {
                        const nombreAsignatura = nombreAsignaturaMap.get(asignatura) || asignatura;
                        datosAsignaturas.push({
                            nombre: nombreAsignatura,
                            icono: asignatura,
                            respuestasCorrectas: columns[columnMap[asignatura]],
                            cantidadPreguntas: columns[columnMap[`Q_${asignatura}`]],
                            resultado: columns[columnMap[`R_${asignatura}`]]
                        });
                    });

                    // Construir la tabla con las notas
                    const tablaNotas = `
                        <table border="1" style="border-collapse: collapse; width: 100%; font-size: 25px;">
                            <thead>
                                <tr>
                                    <th style="padding: 8px; text-align: center; font-size: 25px">Asignatura</th>
                                    <th style="padding: 8px; text-align: center; font-size: 25px">Aciertos</th>
                                    <th style="padding: 8px; text-align: center; font-size: 25px">Puntaje</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${datosAsignaturas.map(asignatura => `
                                    <tr>
                                        <td style="padding: 8px; text-align: center; font-size: 18px">
                                            <div style="display: flex; flex-direction: column; align-items: center;">
                                                ${(() => {
                                                    const Icon = `Iconos/${asignatura.icono}.png`;                                        
                                                    return `<img 
                                                        src="${Icon}"
                                                        style="width: 50px; height: 50px;"
                                                        onerror="this.src='https://via.placeholder.com/60';"
                                                        alt="${asignatura.nombre}">`;
                                                })()}
                                                <span>${asignatura.nombre}</span>
                                            </div>
                                        </td>
                                        <td class="numero-font" style="padding: 8px;">
                                            <span>${asignatura.respuestasCorrectas}</span>
                                            <span style="font-size: 15px;"> / </span> 
                                            <span style="font-size: 15px;">${asignatura.cantidadPreguntas}</span>
                                        </td>
                                        <td class="numero-font" style="padding: 8px;">${asignatura.resultado}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;

                    resultado.innerHTML = `
                        <p style="font-size: 18px;">Año: ${ANIO}</p>
                        <p style="font-size: 18px;">Prueba: ${PRUEBA}</p>
                        <p style="font-size: 18px;">Código: ${ID}</p>
                        <p style="font-size: 18px;">Nombre: ${NOMBRE}</p>
                        <p style="font-size: 18px;">Sede: ${SEDE}</p>
                        <p style="font-size: 18px;">Grado: ${GRADO}</p>
                        <p style="font-size: 18px;">Ranking: ${RANKING}</p>
                        ${tablaNotas}
                    `;

                    encontrado = true;
                    break;
                }
            }
        }

        if (!encontrado) {
            resultado.innerHTML = 'No se encontraron resultados para el código ingresado.';
        }
    } catch (error) {
        console.error('Error al buscar el código:', error);
        resultado.innerHTML = 'Ocurrió un error al buscar los resultados.';
    }
}

// Llamar a la función para cargar los años al iniciar
cargarAnios();

// Agregar eventos para la carga de pruebas y búsqueda
document.getElementById('ano').addEventListener('change', cargarPruebas);
document.getElementById('prueba').addEventListener('change', cargarAsignaturas);
document.getElementById('buscar').addEventListener('click', buscar);
