import type { ImageMetadata } from 'astro';
import logoLime from '../assets/logo-lime.webp';
import logoWhite from '../assets/logo-white.webp';
import logoYellow from '../assets/logo-yellow.webp';
import logoLavender from '../assets/logo-lavender.webp';
import magnetRed from '../assets/magnet-red.webp';
import magnetAqua from '../assets/magnet-aqua.webp';
import magnetPink from '../assets/magnet-pink.webp';
import magnetOnCar from '../assets/magnet-on-car-lime.webp';
import magnetOnCarRed from '../assets/magnet-on-car-red.webp';
import teeFlat from '../assets/tee-flat.webp';
import teeFolded from '../assets/tee-folded.webp';
import teeAngle from '../assets/tee-angle.webp';
import teeDetail from '../assets/tee-detail.webp';

export interface Option {
  label: string;
  swatch?: string;
  image?: ImageMetadata;
  /** true when the option image is a photo (fill the frame) rather than flat logo art */
  photo?: boolean;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  priceFrom?: boolean;
  optionLabel: string;
  options: Option[];
  gallery: { src: ImageMetadata; alt: string }[];
}

export const products: Product[] = [
  {
    id: 'car-magnet',
    name: 'Dog Park Car Magnet',
    tagline: 'Let the whole parking lot know.',
    description:
      'Our signature Welsh Terrier logo as a sturdy car magnet in seven happy colors. Sticks to any steel surface: car, fridge, filing cabinet, dog crate.',
    price: 16,
    optionLabel: 'Color',
    options: [
      { label: 'Brand green', swatch: '#b4cb76', image: logoLime },
      { label: 'Aqua', swatch: '#6fc7e6', image: magnetAqua, photo: true },
      { label: 'Pink', swatch: '#f0c8e6', image: magnetPink, photo: true },
      { label: 'Yellow', swatch: '#f6eda0', image: logoYellow },
      { label: 'Red', swatch: '#ec5a46', image: magnetRed, photo: true },
      { label: 'White', swatch: '#ffffff', image: logoWhite },
      { label: 'Lavender', swatch: '#9d9fd3', image: logoLavender },
    ],
    gallery: [
      { src: magnetOnCar, alt: 'Green Dog Park magnet on the back of an SUV' },
      { src: magnetRed, alt: 'Red Dog Park car magnet on a slate patio' },
      { src: magnetAqua, alt: 'Aqua Dog Park car magnet' },
      { src: magnetPink, alt: 'Pink Dog Park car magnet' },
      { src: magnetOnCarRed, alt: 'Red Dog Park magnet on the back of an SUV' },
    ],
  },
  {
    id: 'long-sleeve-tee',
    name: 'Long-Sleeve Logo Tee',
    tagline: '100% cotton, 100% good boy.',
    description:
      'A soft heather-gray, 100% cotton long-sleeve tee with the Dog Park logo and our signature Welsh Terrier on the chest.',
    price: 30,
    priceFrom: true,
    optionLabel: 'Size',
    options: [{ label: 'SM' }, { label: 'MD' }, { label: 'LG' }, { label: 'XL' }, { label: 'XXL' }],
    gallery: [
      { src: teeFlat, alt: 'Gray long-sleeve Dog Park tee laid flat' },
      { src: teeFolded, alt: 'Folded Dog Park tee with hang tag' },
      { src: teeAngle, alt: 'Dog Park tee on white tile' },
      { src: teeDetail, alt: 'Close-up of the Dog Park chest logo' },
    ],
  },
];
