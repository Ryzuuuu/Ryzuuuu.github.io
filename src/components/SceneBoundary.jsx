import { Component } from 'react'
import { reportOpening } from '../opening'

// If WebGL or the 3D chunk fails, drop the scene and keep the rest of the page alive.
class SceneBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.warn('3D scene disabled:', error)
    // Nothing left to wait for: let the curtain go up.
    reportOpening({ ready: true, progress: 100 })
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default SceneBoundary
