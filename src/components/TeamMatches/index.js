import {Component} from 'react'
import Loader from 'react-loader-spinner'
import {PieChart, Pie, Cell, Legend} from 'recharts'

import LatestMatch from '../LatestMatch'
import MatchCard from '../MatchCard'

import './index.css'

const teamMatchesApiUrl = 'https://apis.ccbp.in/ipl/'

class TeamMatches extends Component {
  state = {
    isLoading: true,
    teamMatchesData: {},
    won: 0,
    lost: 0,
    draw: 0,
  }

  componentDidMount() {
    this.getTeamMatches()
  }

  goBack = () => {
    const {history} = this.props
    history.replace('/')
  }

  getFormattedData = data => ({
    umpires: data.umpires,
    result: data.result,
    manOfTheMatch: data.man_of_the_match,
    id: data.id,
    date: data.date,
    venue: data.venue,
    competingTeam: data.competing_team,
    competingTeamLogo: data.competing_team_logo,
    firstInnings: data.first_innings,
    secondInnings: data.second_innings,
    matchStatus: data.match_status,
  })

  getTeamMatches = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params

    const response = await fetch(`${teamMatchesApiUrl}${id}`)
    const fetchedData = await response.json()
    const formattedData = {
      teamBannerURL: fetchedData.team_banner_url,
      latestMatch: this.getFormattedData(fetchedData.latest_match_details),
      recentMatches: fetchedData.recent_matches.map(eachMatch =>
        this.getFormattedData(eachMatch),
      ),
    }

    // this.setState({teamMatchesData: formattedData, isLoading: false})
    const {recentMatches} = formattedData
    let won = 0
    let lost = 0
    let draw = 0

    recentMatches.forEach(matching => {
      if (matching.matchStatus === 'Won') {
        won += 1
      } else if (matching.matchStatus === 'Lost') {
        lost += 1
      } else {
        draw += 1
      }
    })

    this.setState({
      teamMatchesData: formattedData,
      isLoading: false,
      won,
      lost,
      draw,
    })
  }

  renderRecentMatchesList = () => {
    const {teamMatchesData} = this.state
    const {recentMatches} = teamMatchesData

    return (
      <ul className="recent-matches-list">
        {recentMatches.map(recentMatch => (
          <MatchCard matchDetails={recentMatch} key={recentMatch.id} />
        ))}
      </ul>
    )
  }

  renderTeamMatches = () => {
    const {teamMatchesData, won, lost, draw} = this.state
    const {teamBannerURL, latestMatch} = teamMatchesData

    return (
      <div className="responsive-container">
        <img src={teamBannerURL} alt="team banner" className="team-banner" />
        <LatestMatch latestMatchData={latestMatch} />
        {this.renderPieChart(won, lost, draw)}
        {this.renderRecentMatchesList()}
      </div>
    )
  }

  renderLoader = () => (
    <div data-testid="loader" className="loader-container">
      <Loader type="Oval" color="#ffffff" height={50} width={50} />
    </div>
  )

  renderPieChart = (won, lost, draw) => {
    const info = [
      {count: won, name: 'Won'},
      {count: lost, name: 'Lost'},
      {count: draw, name: 'Draw'},
    ]

    return (
      <PieChart width={1000} height={300}>
        <Pie
          cx="50%"
          cy="60%"
          data={info}
          startAngle={360}
          endAngle={0}
          innerRadius="30%"
          outerRadius="70%"
          dataKey="count"
        >
          <Cell name="Won" fill="green" />
          <Cell name="Lost" fill="red" />
          <Cell name="Draw" fill="blue" />
        </Pie>
        <Legend
          iconType="circle"
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{fontSize: 12, fontFamily: 'Roboto'}}
        />
      </PieChart>
    )
  }

  getRouteClassName = () => {
    const {match} = this.props
    const {params} = match
    const {id} = params

    switch (id) {
      case 'RCB':
        return 'rcb'
      case 'KKR':
        return 'kkr'
      case 'KXP':
        return 'kxp'
      case 'CSK':
        return 'csk'
      case 'RR':
        return 'rr'
      case 'MI':
        return 'mi'
      case 'SH':
        return 'srh'
      case 'DC':
        return 'dc'
      default:
        return ''
    }
  }

  render() {
    const {isLoading} = this.state
    const className = `team-matches-container ${this.getRouteClassName()}`

    return (
      <div className={className}>
        <button type="button" className="back-button" onClick={this.goBack}>
          Back
        </button>
        {isLoading ? this.renderLoader() : this.renderTeamMatches()}
      </div>
    )
  }
}

export default TeamMatches
