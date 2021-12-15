import { searchFilter } from './string-handlers';

test('is search text equal', () => {
  const data = [
    {
      name: 'John',
      lastName: 'Snow'
    },
    {
      name: 'Eddard',
      lastName: 'Stark'
    },
    {
      name: 'Daenerys',
      lastName: 'Targaryen'
    },
    {
      name: 'Robert',
      lastName: 'Baratheon'
    }
  ];
  expect(searchFilter('sno', data, ['lastName']))
    .toEqual(
      [{
        name: 'John',
        lastName: 'Snow'
      }]
    );

  expect(searchFilter('rd', data, ['name']))
    .toEqual(
      [{
        name: 'Eddard',
        lastName: 'Stark'
      }]
    );
  expect(searchFilter('T', data, ['name', 'lastName']))
    .toEqual(
      [{
        name: 'Eddard',
        lastName: 'Stark'
      },
      {
        name: 'Daenerys',
        lastName: 'Targaryen'
      },
      {
        name: 'Robert',
        lastName: 'Baratheon'
      }]
    );
});
