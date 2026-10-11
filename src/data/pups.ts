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
  /** Web equivalent of the piece's official Pantone color */
  hex: string;
  image: ImageMetadata;
  blurb: string;
}

// Images are the hero renders from the "Dog Park Board Game – <breed> – Model Sheet" files.
export const pups: Pup[] = [
  { id: 'blue', color: 'Blue', breed: 'Bernedoodle', hex: '#00b3e3', image: blue, blurb: 'Fluffy ears, sweet face, and a polite little sit. Has never met a PUP CUP it didn’t like.' },
  { id: 'pink', color: 'Pink', breed: 'Dachshund', hex: '#e031ad', image: pink, blurb: 'Long body, longer memory. Remembers exactly who stole its bone.' },
  { id: 'red', color: 'Red', breed: 'German Shepherd', hex: '#da291c', image: red, blurb: 'Ears up, always on the lookout for a STEAL ONE BONE space.' },
  { id: 'green', color: 'Green', breed: 'Catahoula', hex: '#78be20', image: green, blurb: 'Ears up, tail ready… The labyrinth’s natural explorer.' },
  { id: 'orange', color: 'Orange', breed: 'Golden Retriever', hex: '#ff8200', image: orange, blurb: 'A Paw Spa regular. Diamonds are a pup’s best friend.' },
  { id: 'yellow', color: 'Yellow', breed: 'Yorkshire Terrier', hex: '#ffd100', image: yellow, blurb: 'Small, silky, and fearless. Zero turns in the Dog House. (Allegedly.)' },
];

export const pupName = (p: Pup) => p.breed;
