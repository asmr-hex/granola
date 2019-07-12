import React, {Component} from 'react'
import {render} from 'react-dom'
import {ipcRenderer} from 'electron'
import {map, range} from 'lodash'

import Logo from './components/Logo/'
import Link from './components/Link/'

import ElectronImg from './assets/electron.png'
import ReactImg from './assets/react.png'
import WebpackImg from './assets/webpack.png'

const logos = [
    ElectronImg,
    ReactImg,
    WebpackImg
]


export default class App extends Component {
  constructor(props) {
    super(props)
    this.id = 'main-component'
    this.state = {
      operatorCount: 0,
    }

    // update the parameters of this component when we receive
    // a message from the main process.
    ipcRenderer.on(this.id, (event, data) => {
      data = JSON.parse(data)

      console.log(data)
      // merge the updated params
      this.setState({...this.state, ...data})
    })
  }
  
  addOperator() {
    const data = JSON.stringify({
      [this.id]: {
        operatorCount: this.state.operatorCount + 1,
      },
    })
    ipcRenderer.send('update', data)
  }
  
  render() {
    const logosRender = logos.map( (logo, index) => {
      return <Logo key = {index} src = { logo } />
    })
    
    return (
      <div>
        <button onClick={() => this.addOperator()}>ADD OPERATOR</button>
        <div>{this.state.operatorCount}</div>
        <div>
          {
            map(
              range(this.state.operatorCount),
              (op, idx) => (
                <div className='operator' key={idx}>OPERATOR {idx}</div>
              )
            )
          }
        </div>
      </div>
    )
  }
}
