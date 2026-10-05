import type { ImageMetadata } from 'astro';
import blue from '../assets/pups/blue.webp';
import pink from '../assets/pups/pink.webp';
import red from '../assets/pups/red.webp';
import green from '../assets/pups/green.webp';
import orange from '../assets/pups/orange.webp';
import yellow from '../assets/pups/yellow.webp';

export interface Pup {
  id: string;
  /** Color name, used until the real names are filled in */
  color: string;
  /** The real dog this piece is based on, once Brenda tells us. Shown in place of the color name. */
  name: string | null;
  hex: string;
  image: ImageMetadata;
  blurb: string;
}

export const pups: Pup[] = [
  { id: 'blue', color: 'Blue', name: null, hex: '#2fb5e3', image: blue, blurb: 'Sits politely, rolls boldly. Has never met a PUP CUP it didn’t like.' },
  { id: 'pink', color: 'Pink', name: null, hex: '#e23fb4', image: pink, blurb: 'Long body, longer memory. Remembers exactly who stole its bone.' },
  { id: 'red', color: 'Red', name: null, hex: '#f0402c', image: red, blurb: 'Ears up, always on the lookout for a STEAL ONE BONE space.' },
  { id: 'green', color: 'Green', name: null, hex: '#7cc62a', image: green, blurb: 'Mid-stride and ready to wander. The labyrinth’s natural explorer.' },
  { id: 'orange', color: 'Orange', name: null, hex: '#f5841f', image: orange, blurb: 'A Paw Spa regular. Diamonds are a pup’s best friend.' },
  { id: 'yellow', color: 'Yellow', name: null, hex: '#f2cc1b', image: yellow, blurb: 'Small, fluffy, and fearless. Zero turns in the Dog House. (Allegedly.)' },
];

export const pupName = (p: Pup) => p.name ?? `${p.color} Pup`;
