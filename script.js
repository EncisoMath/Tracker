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
    cargarCSV();
}

// Función para mostrar el campo de código cuando se selecciona una prueba
function mostrarCampoCodigo() {
    const prueba = document.getElementById('prueba').value;
    if (prueba) {
        document.getElementById('busqueda').style.display = 'block'; // Mostrar el campo de código
    }
}

let kakashi = ''; // Constante para almacenar el resultado
let naruto = []; // Constante para almacenar el resultado
let asignaturas = []; // Lista para almacenar los datos separados

async function cargarCSV() {
    let holi = ''; // Constante para almacenar el resultado
    let sakura = ''; // Constante para almacenar el resultado
    const pruebaBuscada = document.getElementById('prueba').value;
    try {
        // Carga el archivo CSV
        const response = await fetch('Datos/Pruebas.csv');
        const csvText = await response.text();

        // Divide las filas del CSV y extrae los encabezados
        const filas = csvText.split('\n').filter(row => row.trim() !== ''); // Elimina filas vacías
        const encabezados = filas[0].split(',').map(header => header.trim());
        
        // Encuentra los índices de las columnas relevantes
        const indiceNombrePrueba = encabezados.indexOf('NOMBREPRUEBA');
        const indiceAsignaturas = encabezados.indexOf('ASIGNATURAS');
        const indiceArchivo = encabezados.indexOf('ARCHIVO'); // Índice para la columna ARCHIVO
        const indicePreguntas = encabezados.indexOf('PREGUNTAS'); // Índice para la columna ARCHIVO

        // Recorre las filas para encontrar la coincidencia con 'pruebaBuscada'
        for (let i = 1; i < filas.length; i++) {
            const fila = filas[i].split(',').map(field => field.trim());
            if (fila[indiceNombrePrueba] === pruebaBuscada) {
                holi = fila[indiceAsignaturas]; // Actualiza la variable global 'holi'
                sakura = fila[indicePreguntas]; // Actualiza la variable global 'holi'
                asignaturas = holi.split(';').map(item => item.trim()); // Divide el valor de 'holi' en una lista usando el separador ';'
                naruto = sakura.split(';').map(item => item.trim()); // Divide el valor de 'holi' en una lista usando el separador ';'
                
                kakashi = fila[indiceArchivo]; // Actualiza la variable global 'kakashi'
                break; // Termina el bucle cuando se encuentra el resultado
            }
        }

        // Verifica el contenido de 'holi', 'asignaturas' y 'kakashi' en la consola
        console.log('holi:', holi);
        console.log('asignaturas:', asignaturas);
        console.log('kakashi:', kakashi);
        console.log('naruto:', naruto);
        
    } catch (error) {
        console.error("Error al leer el archivo CSV:", error);
    }
}



async function cargarNombresAsignaturas() {
    try {
        const response = await fetch('Datos/NombreAsignatura.csv');
        if (!response.ok) {
            throw new Error(`Error al cargar Datos/NombreAsignatura.csv: ${response.statusText}`);
        }
        const data = await response.text();
        const rows = data.split('\n').slice(1); // Saltar la cabecera

        // Crear un mapa de ASIGNATURA a NOMBREASIGNATURA
        const nombreAsignaturaMap = new Map();
        rows.forEach(row => {
            const [ASIGNATURA, NOMBREASIGNATURA] = row.split(',').map(col => col.trim());
            if (ASIGNATURA && NOMBREASIGNATURA) {
                nombreAsignaturaMap.set(ASIGNATURA, NOMBREASIGNATURA);
            }
        });

        return nombreAsignaturaMap;

    } catch (error) {
        console.error('Error al cargar los nombres de asignaturas:', error);
        return new Map();
    }
}


// Función para buscar y mostrar los resultados del alumno
async function buscar() {
    cargarCSV();
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
        const response = await fetch(`Datos/${kakashi}.csv`);
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
                const RANKING_C = columns[columnMap['RANKING_C']];
                const RANKING_G = columns[columnMap['RANKING_G']];

                if (ID === codigo) {
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
    <table border="1" style="border-collapse: collapse; width: 100%; font-size: 25px;"> <!-- Establece tamaño de letra general -->
        <thead>
            <tr>
                <th style="padding: 8px; text-align: center; font-size: 25px">Asignatura</th>
                <th style="padding: 8px; text-align: center; font-size: 25px">Aciertos</th>
                <th style="padding: 8px; text-align: center; font-size: 25px">Nota</th>
            </tr>
        </thead>
        <tbody>
            ${datosAsignaturas.map((asignatura, index) => {
                // Seleccionar el valor de naruto según el índice de la asignatura
                const preguntas = naruto[index] || 'N/A'; // Usa 'N/A' si no hay suficientes valores en naruto
                
                return `
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
                            <span style="font-size: 15px;">${preguntas}</span>
                        </td>
                        <td class="numero-font" style="padding: 8px;">${asignatura.resultado}</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    </table>
`;


                    // Aquí se agrega el mensaje y la imagen del examen después de la tabla de notas
                    const idAlumno = codigo; // El ID del alumno es el código ingresado
                    const imgExtensions = ['jpg', 'png']; // Extensiones de imagen permitidas
                    let imgExamen1 = '';
                    let imgExamen2 = '';
                    let imgExamen3 = '';
                    let imgExamen4 = '';

                    // Buscar la imagen del examen según el ID
                    for (const ext of imgExtensions) {
                        imgExamen1 = `Soportes/${prueba}/${idAlumno}_p1.${ext}`;
                        try {
                            const response = await fetch(imgExamen1);
                            if (response.ok) {
                                break; // Si encuentra la imagen, se sale del bucle
                            }
                        } catch (error) {
                            console.error(`Imagen no encontrada: ${imgExamen1}`);
                        }
                    };

                    for (const ext of imgExtensions) {
                        imgExamen2 = `Soportes/${prueba}/${idAlumno}_p2.${ext}`;
                        try {
                            const response = await fetch(imgExamen2);
                            if (response.ok) {
                                break; // Si encuentra la imagen, se sale del bucle
                            }
                        } catch (error) {
                            console.error(`Imagen no encontrada: ${imgExamen2}`);
                        }
                    }

                    for (const ext of imgExtensions) {
                        imgExamen3 = `Soportes/${prueba}/${idAlumno}_p3.${ext}`;
                        try {
                            const response = await fetch(imgExamen3);
                            if (response.ok) {
                                break; // Si encuentra la imagen, se sale del bucle
                            }
                        } catch (error) {
                            console.error(`Imagen no encontrada: ${imgExamen3}`);
                        }
                    }

                    for (const ext of imgExtensions) {
                        imgExamen4 = `Soportes/${prueba}/${idAlumno}_p4.${ext}`;
                        try {
                            const response = await fetch(imgExamen4);
                            if (response.ok) {
                                break; // Si encuentra la imagen, se sale del bucle
                            }
                        } catch (error) {
                            console.error(`Imagen no encontrada: ${imgExamen4}`);
                        }
                    }

                    // Añadir el mensaje y la imagen al HTML
                    resultado.innerHTML = `
                        <h1>Resultados</h1>

                        
<!-- Contenedor principal -->
<div class="resultados-container" style="display: flex; flex-direction: column; align-items: center; width: 100%;">

    <!-- Bloque superior (Información del alumno) -->
    <div class="resultado-left" style="width: 100%; text-align: center; margin-bottom: 20px;">
        <div class="resultado-item" style="margin-bottom: 10px;">
            <span class="bold-font" style="color: orange; font-size: 22px;">Alumno: </span>
            <span>${NOMBRE}</span>
        </div>
        <div class="resultado-item">
            <span class="bold-font" style="color: orange; font-size: 22px;">Grado y Sede: </span>
            <span>${GRADO} ${SEDE}</span>
        </div>
    </div>

    <!-- Bloque inferior (Ranking) -->
    <div class="resultado-right" style="width: 100%; text-align: center;">
        <!-- Título "Ranking" centrado -->
        <div class="bold-font" style="color: orange; font-size: 35px; margin-top: 0;">Ranking</div>

        <!-- División de dos columnas para RANKING_C y RANKING_G -->
        <div class="bold-font" style="font-size: 32px; display: flex; justify-content: space-around; margin-top: 20px;">

            <!-- Columna izquierda con RANKING_C -->
            <div style="text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <img src="Iconos/${RANKING_C >= 1 && RANKING_C <= 3 ? `${RANKING_C}` : 'RANKING'}.png" style="width: 35px; height: 35px;">
                    <span>${RANKING_C}</span>
                </div>
                <div style="font-size: 18px; margin-top: 10px;">Nivel Curso</div>
            </div>

            <!-- Columna derecha con RANKING_G -->
            <div style="text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <img src="Iconos/${RANKING_G >= 1 && RANKING_G <= 3 ? `${RANKING_G}` : 'RANKING'}.png" style="width: 35px; height: 35px;">
                    <span>${RANKING_G}</span>
                </div>
                <div style="font-size: 18px; margin-top: 10px;">Nivel Grado</div>
            </div>
        </div>
    </div>

</div>










                        </div>
                        <hr>
                        ${tablaNotas}
                        <h3>Aquí está tu examen:</h3>
<div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
    <!-- Contenedor de las imágenes -->
    <div style="display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap;">
        <div style="width: 100%; max-width: 500px; overflow: hidden;">
            <img src="${imgExamen1}" style="width: 100%; height: auto; object-fit: cover; object-position: center;" onerror="this.onerror=null; this.src='Iconos/NA.png';">
        </div>
        <div style="width: 100%; max-width: 500px; overflow: hidden;">
            <img src="${imgExamen2}" style="width: 100%; height: auto; object-fit: cover; object-position: center;" onerror="this.onerror=null; this.src='Iconos/NA.png';">
        </div>
        <div style="width: 100%; max-width: 500px; overflow: hidden;">
            <img src="${imgExamen3}" style="width: 100%; height: auto; object-fit: cover; object-position: center;" onerror="this.onerror=null; this.src='Iconos/NA.png';">
        </div>
        <div style="width: 100%; max-width: 500px; overflow: hidden;">
            <img src="${imgExamen4}" style="width: 100%; height: auto; object-fit: cover; object-position: center;" onerror="this.onerror=null; this.src='Iconos/NA.png';">
        </div>
    </div>
                            
                            <!-- Descripción de colores -->
                            <div style="text-align: center; width: 100%; max-width: 1000px;">
                                <p>🟢 Correcta | 🟡 Respuesta Correcta | 🔴 Incorrecta</p>
                            </div>
                        </div>

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
        console.error('Error al buscar resultados:', error);
    }
}

// Cargar los años al cargar la página
document.addEventListener('DOMContentLoaded', cargarAnios);
