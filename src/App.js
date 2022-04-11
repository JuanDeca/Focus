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

    const [ resultado, guardarResultado ] = useState([])
    const [ precio, guardarPrecio ] = useState([])
    const [ fecha, guardarFecha ] = useState([])
    const [ memo, guardarMemo ] = useState([])
    
    useEffect( () => {
        const cotizarCriptomoneda = async () => {

            //  Consulta a la API
            const url = `https://min-api.cryptocompare.com/data/top/mktcapfull?limit=10&tsym=USD`
            const result = await axios.get(url)
            
            const arrayc = result.data.Data.map(cripto => {
                const obj = cripto.CoinInfo
                
                return obj
            })
            
            guardarResultado(arrayc)
        }
        cotizarCriptomoneda()
    }, [])

    const buscarValor = async (e) => {

        //  Consulta a la API
        const url = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${e.target.value}&tsym=USD&limit=364`
        const result = await axios.get(url)

        console.log(result)

        const arrayPrecios = result.data.Data.Data.map(cripto => {
            const obj = cripto.close
            return obj
        })
        guardarPrecio(arrayPrecios)

        const arrayFechas = result.data.Data.Data.map(cripto => {
            let x = new Date(cripto.time * 1000)
            const obj = `${x.getDate()}/${x.getMonth() + 1}/${x.getFullYear()}`
            return obj
        })
        guardarFecha(arrayFechas)

        const url2 = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${e.target.value}&tsym=USD&limit=414`
        const result2 = await axios.get(url2)

        calcularMM(result2.data.Data.Data)    

    }

    const calcularMM = (data) => {

        let x, c, suma, prom, array

        array = []
    
        for (x=50; x<416; x++) {

            prom = 0
            c = 0
            suma = 0

            while (c < 49) {
                suma = suma + data[x - 50 + c].close
                c++
            }

            prom = suma / 50

            array = [
                ...array,
                prom
            ]

            guardarMemo(array)

        }

    }

    const data = {
        labels: fecha,
        datasets: [{
            borderColor: 'rgb(75, 102, 192)',
            data: memo,
            tension: 0.3
        },
            {
                borderColor: 'rgb(25, 190, 3)',
                data: precio,
                tension: 0.3
            }
        ]
    };

    return (
        <div className="App">
            <div className='graf'>
                <Line
                    data={data}
                />
            </div>
            <div>
                <select onChange={buscarValor}>
                    <option value="">--- Seleccionar ---</option>
                    {
                        resultado.map( opcion => (
                            <option key={opcion.FullName} value={opcion.Name}>{opcion.FullName}</option>
                        ))
                    }               
                </select>
            </div>
        </div>
    );
}

export default App;
