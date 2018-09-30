import React, { Component } from 'react';
import { Pie } from 'react-chartjs-2'

class Chart extends Component {
    render = () => {
        let poll = this.props.poll;

        // Original function from https://stackoverflow.com/questions/10014271/#20129594
        let chartColours = [];
        for (var i = 0, numOptions = poll.options.length; i < numOptions; i++) {
            chartColours.push(
                "hsl(" + Math.floor((i * (360 / numOptions) % 360)) + ", 100%, 65%)"
            )
        }

        let chartData = {
            labels: poll.options,
            datasets: [{
                data: poll.votes,
                backgroundColor: chartColours,
                hoverBackgroundColor: chartColours,
                borderColor: 'white',
                borderWidth: 4
            }]
        }

        let totalVotes = chartData.datasets[0].data.reduce((a, b) => a + b, 0);

        let options = {
            legend: {
                display: false
            }
        }


        return (
            <div>
                { totalVotes > 0 ? (
                    <Pie data={chartData} options={options} width="250" height="250" />
                ) : (
                    <p className="noVotes">This poll has no votes to display... yet...</p>
                ) }
            </div>
        )
    }
}

export default Chart;