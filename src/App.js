import React, { useEffect, useState } from 'react';
import './sass/index.sass';
import axios from 'axios'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement
  } from 'chart.js'
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement
  )

function App() {

    const [ listaCriptos, guardarListaCriptos ] = useState([])
    const [ precios, guardarPrecios ] = useState([])
    const [ fechas, guardarFechas ] = useState([])
    const [ mediaMovil, guardarMediaMovil ] = useState([])
    const [ parametros, guardarParametros ] = useState({})

    const periodos = [ 5,10,20,50,100,200 ]
    const tiempo = [ 7, 14, 30, 60, 120, 365 ]
    
    useEffect( () => {

        const cotizarCriptomoneda = async () => {

            const url = `https://min-api.cryptocompare.com/data/top/mktcapfull?limit=10&tsym=USD`
            const result = await axios.get(url)
            
            const array = result.data.Data.map(cripto => {
                const obj = cripto.CoinInfo
                
                return obj
            })
            
            guardarListaCriptos(array)
        }

        cotizarCriptomoneda()

    }, [])

    const buscarValores = async (parametros) => {

        const url = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${parametros.cripto}&tsym=USD&limit=${parametros.tiempo - 1}`
        const result = await axios.get(url)

        const arrayPrecios = result.data.Data.Data.map(cripto => {
            const obj = cripto.close
            return obj
        })
        guardarPrecios(arrayPrecios)

        const arrayFechas = result.data.Data.Data.map(cripto => {
            let x = new Date(cripto.time * 1000)
            const obj = `${x.getDate()}/${x.getMonth() + 1}/${x.getFullYear()}`
            return obj
        })
        guardarFechas(arrayFechas)

        const params = parseInt(parametros.tiempo) + parseInt(parametros.periodo) - 1

        const url2 = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${parametros.cripto}&tsym=USD&limit=${params}`
        const result2 = await axios.get(url2)

        const arrayMM = result2.data.Data.Data


        // Cálculo de la media móvil
        
        let x, c, suma, prom, array

        array = []

        const params2 = parseInt(parametros.tiempo) + parseInt(parametros.periodo)
            
        console.clear()
    
        for ( x = parametros.periodo; x < params2; x++ ) {

            // Muestra el progreso por consola
            console.log(Math.trunc(x / params * 100), "%")

            prom = 0
            c = 0
            suma = 0

            while (c < parametros.periodo) {

                suma = suma + arrayMM[x - parametros.periodo + c + 1].close

                c++

            }

            prom = suma / parametros.periodo

            array = [
                ...array,
                prom
            ]

            guardarMediaMovil(array)

        }

    }

    const actualizarState = (e) => {
        guardarParametros({
            ...parametros,
            [e.target.name]: e.target.value
        })
    }

    const data = {
        labels: fechas, 
        datasets: [{
            borderColor: '#1d8aff',
            data: mediaMovil
        },
            {
                borderColor: '#01DF01',
                data: precios
            }
        ]
    };

    const calcularTendencia = () => {
        
        let a
        let fechas1 = []
        let fechas2 = []
        let porcentaje = 0
        let c

        for (a = 0; a < precios.length; a++) {            
            if ( mediaMovil[a] < precios[a] && (mediaMovil[a - 1] > precios[a - 1] || mediaMovil[a-1] === undefined) ) {
                fechas1[fechas1.length] = a
            }
            if ( (mediaMovil[a] > precios[a] && mediaMovil[a - 1] < precios[a - 1]) || mediaMovil[a+1] === undefined ) {
                fechas2[fechas2.length] = a
            }
        }

        console.clear()

        for ( c = 0; c < fechas1.length; c++) {

            let a = (fechas2[c] - fechas1[c]) / fechas.length
            porcentaje = porcentaje + a * 100
            console.log('Desde', fechas[fechas1[c]], 'Hasta', fechas[fechas2[c]], "\n (", Math.trunc(a * 100), "% ) ")
            
        }
        
        console.log( "Total: ", Math.trunc(porcentaje), '%' )

    }

    return (
        <div className="App">
            <div className='options'>

                <label>Criptomoneda</label>
                <select onChange={actualizarState} name="cripto">
                    <option value="">-- Seleccionar --</option>
                    {
                        listaCriptos.map( opcion => (
                            <option key={opcion.FullName} value={opcion.Name}>{opcion.FullName}</option>
                        ))
                    }               
                </select>

                <label>Intervalo</label>
                <select onChange={actualizarState} name="periodo">
                    <option value="">-- Seleccionar --</option>
                    {
                        periodos.map( opcion => (
                            <option key={opcion} value={opcion}>{opcion}</option>
                        ))
                    }
                </select>
                
                <label>Plazo de tiempo</label>
                <select onChange={actualizarState} name="tiempo">
                    <option value="">-- Seleccionar --</option>
                    {
                        tiempo.map( opcion => (
                            <option key={opcion} value={opcion}>{opcion}</option>
                        ))
                    }
                </select>

                <button onClick={() => buscarValores(parametros)}>Calcular</button>

                <button onClick={() => calcularTendencia(mediaMovil, precios, fechas)}>Ver Tendencia</button>

                <label>(Abrir consola)</label>

            </div>

            <div className='grafico'>
                <div>
                    <div className='indice1'>Media Móvil</div>
                    <div className='indice2'>Precios</div>
                </div>
                <Line
                    data={data}
                />
            </div>

        </div>
    );
}

export default App;
