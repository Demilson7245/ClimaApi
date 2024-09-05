document.getElementById('weather-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita el comportamiento por defecto del formulario
    const ciudad = document.getElementById('ciudad').value;
    if (ciudad) {
        obtenerClima(ciudad);
    }
});

async function obtenerCoordenadas(ciudad) {
    const apiKey = '4db46524007ecbb662e66c6f262793b7'; //  clave API
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.coord) {
            return {
                lat: data.coord.lat,
                lon: data.coord.lon
            };
        } else {
            throw new Error('No se pudieron obtener las coordenadas.');
        }
    } catch (error) {
        console.error('Error al obtener las coordenadas:', error);
        return null;
    }
}

function convertirTemperatura(temp, unidad) {
    if (unidad === 'metric') {
        return temp; // Celsius
    } else if (unidad === 'imperial') {
        return (temp - 273.15) * 9/5 + 32; // Kelvin a Fahrenheit
    } else if (unidad === 'standard') {
        return temp - 273.15; // Kelvin a Celsius
    } else {
        return temp; // Default to Celsius
    }
}

function convertirViento(viento) {
    return viento * 3.6; // m/s a km/h
}

async function obtenerClima(ciudad) {
    const coordenadas = await obtenerCoordenadas(ciudad);
    if (coordenadas) {
        const { lat, lon } = coordenadas;
        const apiKey = '4db46524007ecbb662e66c6f262793b7'; // Reemplaza con tu clave API
        const unidad = document.querySelector('input[name="unidad"]:checked').value;
        const url = `https://api.openweathermap.org/data/2.8/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}&units=${unidad}&lang=es`;

        try {
            const response = await fetch(url);
            const data = await response.json();
           // console.log(data);  Verifica la respuesta aquí

            if (data.current && data.daily && data.daily.length > 0) {
                const resultado = document.getElementById('resultado');
                resultado.innerHTML = `<h2>Clima Actual y Diario en ${ciudad}</h2>`;

                // Información actual
                const tempActual = convertirTemperatura(data.current.temp, unidad);
                const vientoActual = convertirViento(data.current.wind_speed);
                resultado.innerHTML += `
                    <div class="current">
                        <h3>Temperatura Actual:</h3>
                        <p>${tempActual.toFixed(2)} ${unidad === 'metric' ? '°C' : unidad === 'imperial' ? '°F' : 'K'}</p>
                        <p>Descripción: ${data.current.weather[0].description}</p>
                        <p>Humedad: ${data.current.humidity}%</p>
                        <p>Presión: ${data.current.pressure} hPa</p>
                        <p>Viento: ${vientoActual.toFixed(2)} km/h</p>
                    </div>
                `;

                // Información diaria
                data.daily.forEach((day) => {
                    const date = new Date(day.dt * 1000);
                    const formattedDate = date.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    
                    const tempMax = convertirTemperatura(day.temp.max, unidad);
                    const tempMin = convertirTemperatura(day.temp.min, unidad);

                    resultado.innerHTML += `
                        <div class="day">
                            <h3>Fecha: ${formattedDate}</h3>
                            <p>Temperatura Máxima: ${tempMax.toFixed(2)} ${unidad === 'metric' ? '°C' : unidad === 'imperial' ? '°F' : 'K'}</p>
                            <p>Temperatura Mínima: ${tempMin.toFixed(2)} ${unidad === 'metric' ? '°C' : unidad === 'imperial' ? '°F' : 'K'}</p>
                            <p>Descripción: ${day.weather[0].description}</p>
                            <p>Humedad: ${day.humidity}%</p>
                            
                        </div>
                    `;
                });
            } else {
                document.getElementById('resultado').innerHTML = `
                    <h2>No se pudieron obtener los datos del clima.</h2>
                `;
            }
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            document.getElementById('resultado').innerHTML = `
                <h2>Error al obtener los datos del clima.</h2>
            `;
        }
    } else {
        document.getElementById('resultado').innerHTML = `
            <h2>Error al obtener las coordenadas para ${ciudad}.</h2>
        `;
    }
}
