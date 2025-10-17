import path from 'path';

export default {
  content: [
    path.resolve(__dirname, 'src/**/*.{js,ts,jsx,tsx}'), // include all your source files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
