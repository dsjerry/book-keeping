const React = require('react')
const { Text } = require('react-native')

const MockIcon = props => React.createElement(Text, props, props.name || 'icon')
MockIcon.loadFont = jest.fn()

module.exports = MockIcon
module.exports.default = MockIcon
