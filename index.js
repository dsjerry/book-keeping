import 'react-native-gesture-handler';

// Polyfill for ai SDK streaming in React Native
import { TransformStream, ReadableStream, WritableStream } from 'web-streams-polyfill';
global.TransformStream = TransformStream;
global.ReadableStream = ReadableStream;
global.WritableStream = WritableStream;

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
