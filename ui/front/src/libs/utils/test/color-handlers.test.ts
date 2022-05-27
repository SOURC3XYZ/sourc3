import { ActionColor } from '@libs/constants';
import { colorizer } from '../colors-handler';

test('colorizer returns the correct result depending on the index', () => {
  const colors = Object.values(ActionColor);
  expect(colorizer(0, colors))
    .toEqual(ActionColor.BRIGHT_TEAL);
  expect(colorizer(2, colors))
    .toEqual(ActionColor.LIGHTGREEN);
  expect(colorizer(10, colors))
    .toEqual(ActionColor.SMTH_ORANGE);
  expect(colorizer(11, colors))
    .toEqual(ActionColor.BRIGHT_TEAL);
  expect(colorizer(13, colors))
    .toEqual(ActionColor.LIGHTGREEN);
  expect(colorizer(24, colors))
    .toEqual(ActionColor.LIGHTGREEN);
  for (let q = 0; q < colors.length; q++) {
    let i = q;
    while (i < 300) {
      expect(colorizer(i, colors))
        .toEqual(colors[q]);
      i += colors.length;
    }
  }
});
