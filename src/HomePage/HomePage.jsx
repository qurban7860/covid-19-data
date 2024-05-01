
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { userActions } from '../_actions';
import Chart from 'chart.js/auto';

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: null,
            covidData: []
        };
        this.chartRef = React.createRef();
    }

    componentDidMount() {
        this.props.getUsers();
        this.fetchCovidData();
    }

    fetchCovidData() {
        fetch('/owid-covid-latest.csv')
            .then(response => response.text())
            .then(csvData => {
                // Parse CSV data
                const rows = csvData.split('\n');
                const headers = rows[0].split(',');
                const locationIndex = headers.indexOf('location');
                const totalCasesIndex = headers.indexOf('total_cases');
                const covidData = [];

                // Extract location and total cases
                for (let i = 1; i < rows.length; i++) {
                    const cols = rows[i].split(',');
                    if (cols.length > 1) {
                        covidData.push({
                            location: cols[locationIndex],
                            totalCases: parseInt(cols[totalCasesIndex])
                        });
                    }
                }

                // Set state with extracted data
                this.setState({ covidData, loading: false });

                // Render chart
                this.renderChart();
            })
            .catch(error => {
                console.error("Failed to fetch COVID-19 data:", error);
                this.setState({ error: "Failed to fetch COVID-19 data.", loading: false });
            });
    }

    handleDeleteUser(id) {
        return () => {
            this.props.deleteUser(id);
        };
    }

    renderChart() {
        const chartLabels = this.state.covidData.map(data => data.location);
        const chartData = this.state.covidData.map(data => data.totalCases);

        const ctx = this.chartRef.current.getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Total Cases',
                    data: chartData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    render() {
        const { user, users } = this.props;
        const { loading, error } = this.state;

        return (
            <div className="">
                <h1>Hi {user.firstName}!</h1>
                {users.loading && <em>Loading users...</em>} <br/>
                {users.error && <span className="text-danger">ERROR: {users.error}</span>}
                {users.items &&            
                    <ul>
                        {users.items.map((user, index) =>
                            <li key={user.id}>
                                {user.firstName + ' ' + user.lastName}
                                {
                                    user.deleting ? <em> - Deleting...</em>
                                    : user.deleteError ? <span className="text-danger"> - ERROR: {user.deleteError}</span>
                                    : <span> - <a onClick={this.handleDeleteUser(user.id)}>Delete</a></span>
                                }
                            </li>
                        )}
                    </ul>
                }
                <h3 style={{ textAlign: 'center' }}>COVID-19 Total Cases by Location</h3>
                {loading && <em>Loading COVID-19 data...</em>} <br/>
                {error && <span className="text-danger">ERROR: {error}</span>}
                <canvas ref={this.chartRef} width="800" height="400"></canvas>
                <p style={{ textAlign: 'center' }}>
                    <Link to="/login">Logout</Link> 
                </p>
            </div>
        );
    }
}

function mapState(state) {
    const { users, authentication } = state;
    const { user } = authentication;
    return { user, users };
}

const actionCreators = {
    getUsers: userActions.getAll,
    deleteUser: userActions.delete
}

const connectedHomePage = connect(mapState, actionCreators)(HomePage);
export { connectedHomePage as HomePage };
