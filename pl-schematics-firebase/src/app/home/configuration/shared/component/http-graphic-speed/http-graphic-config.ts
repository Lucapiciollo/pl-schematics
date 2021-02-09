export function option( ) {
    return {      
        plugins:[],
        type: 'line',
        data: {
            datasets: [{
                data: [],
                backgroundColor: ["#06B125"],
                borderColor: [],
                lineTension: 0,
            }]
        },
        options: {
            responsive: true,
            annotation: {
                annotations: [{
                    type: 'line',
                    mode: 'horizontal',
                    value: 0,
                    scaleID: 'y-axis-0',
                    borderColor: '#000802',
                    borderWidth: 0,
                    label: {
                        enabled: true,
                        fontStyle: null,
                        content: null,
                        backgroundColor: 'rgba(0,0,255,0.5)',
                        align: 'end',
                        cornerRadius: 7,
                        position: 'right'
                    }
                }]
            },
            chartArea: {
                backgroundColor: '#A8E591'
            },
            legend: {
                display: false
            },
            elements: {
                point: {
                    backgroundColor: "#06B125",
                    borderWidth: 0,
                    radius: 0
                }
            },
            tooltips: {
                enabled: false
            },
            title: {
                display: false
            },
            scales: {
                yAxes: [{
                    enabled: false,
                    ticks: {
                        display: false,
                        suggestedMin: 0,
                        suggestedMax: 100,
                        stepSize: 30
                    }
                }],
                xAxes: [{
                    display: false,
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 100
                    },
                    type: 'linear',
                    position: 'bottom'
                }]
            }
        }
    }
}