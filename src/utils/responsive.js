import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reference dimensions (your device)
const REFERENCE_WIDTH = 432;
const REFERENCE_HEIGHT = 984;

// Calculate scaling factors
const widthScale = SCREEN_WIDTH / REFERENCE_WIDTH;
const heightScale = SCREEN_HEIGHT / REFERENCE_HEIGHT;

// Function to scale size based on width
export const scaleWidth = (size) => Math.round(size * widthScale);

// Function to scale size based on height
export const scaleHeight = (size) => Math.round(size * heightScale);

// Function to scale font size
export const scaleFont = (size) => Math.round(size * Math.min(widthScale, heightScale));

// Function to scale padding/margin
export const scaleSize = (size) => Math.round(size * Math.min(widthScale, heightScale)); 