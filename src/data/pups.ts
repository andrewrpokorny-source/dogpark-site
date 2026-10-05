import type { ImageMetadata } from 'astro';
import blue from '../assets/pups/blue.webp';
import pink from '../assets/pups/pink.webp';
import red from '../assets/pups/red.webp';
import green from '../assets/pups/green.webp';
import orange from '../assets/pups/orange.webp';
import yellow from '../assets/pups/yellow.webp';

export interface Pup {
  id: string;
  /** Color name of the playing piece */
  color: string;
  /** Breed, from the official model sheets */
  breed: string;
  /** The real dog this piece is based on, once Brenda tells us. Shown in place of the breed. */
  name: string | null;
  /** Official Pantone color of the piece, and a close web equivalent */
  pantone: string;
  hex: string;
  image: ImageMetadata;
  blurb: string;
}

// Images are the hero renders from the "Dog Park Board Game – <breed> – Model Sheet" files.
export const pups: Pup[] = [
  { id: 'blue', color: 'Blue', breed: 'Bernedoodle', name: null, pantone: '306 C', hex: '#00b3e3', image: blue, blurb: 'Fluffy ears, sweet face, and a polite little sit. Has never met a PUP CUP it didn’t like.' },
  { id: 'pink', color: 'Pink', breed: 'Dachshund', name: null, pantone: '239 C', hex: '#e031ad', image: pink, blurb: 'Long body, longer memory. Remembers exactly who stole its bone.' },
  { id: 'red', color: 'Red', breed: 'German Shepherd', name: null, pantone: '485 C', hex: '#da291c', image: red, blurb: 'Ears up, always on the lookout for a STEAL ONE BONE space.' },
  { id: 'green', color: 'Green', breed: 'Catahoula', name: null, pantone: '368 C', hex: '#78be20', image: green, blurb: 'One ear up, tail up, ready to wander. The labyrinth’s natural explorer.' },
  { id: 'orange', color: 'Orange', breed: 'Golden Retriever', name: null, pantone: '151 C', hex: '#ff8200', image: orange, blurb: 'A Paw Spa regular. Diamonds are a pup’s best friend.' },
  { id: 'yellow', color: 'Yellow', breed: 'Yorkshire Terrier', name: null, pantone: '109 C', hex: '#ffd100', image: yellow, blurb: 'Small, silky, and fearless. Zero turns in the Dog House. (Allegedly.)' },
];

export const pupName = (p: Pup) => p.name ?? p.breed;
